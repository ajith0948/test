/**
 * Audit Controller
 *
 * Real DB-backed implementation (formerly mock-backed). Business rule on
 * close: any item left marked 'Missing' flips its Asset.status to 'Lost'.
 */
const AuditCycle = require('../models/AuditCycle');
const Asset = require('../models/Asset');
const Department = require('../models/Department');
const { logActivity } = require('../utils/logActivity');

// @desc    List audit cycles
// @route   GET /api/audits
// @access  Private
exports.getAuditCycles = async (req, res, next) => {
  try {
    const cycles = await AuditCycle.find().populate('auditors', 'name').sort({ createdAt: -1 });
    const shaped = cycles.map((cycle) => ({
      id: cycle._id.toString(),
      name: cycle.name,
      scopeType: cycle.scopeType,
      scopeValue: cycle.scopeValue,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      auditors: cycle.auditors.map((auditor) => auditor.name),
      status: cycle.status,
      items: cycle.items.map((item) => ({ assetTag: item.assetTag, assetName: item.assetName, result: item.result })),
    }));
    res.status(200).json(shaped);
  } catch (error) {
    next(error);
  }
};

// @desc    Open a new audit cycle. Automatically populates items from every
//          active asset in scope (whole org, a department, or a location).
// @route   POST /api/audits
// @access  Private (Admin & Asset Manager)
exports.createAuditCycle = async (req, res, next) => {
  try {
    const { name, scopeType, scopeValue, startDate, endDate, auditorIds } = req.body;
    if (!name || !scopeType || !scopeValue || !startDate || !endDate) {
      return res.status(400).json({ message: 'Provide name, scopeType, scopeValue, startDate, and endDate.' });
    }
    if (!['Organization', 'Department', 'Location'].includes(scopeType)) {
      return res.status(400).json({ message: 'scopeType must be Organization, Department, or Location.' });
    }

    const assetQuery = { isActive: true };
    let displayScopeValue = scopeValue;

    if (scopeType === 'Department') {
      const department = await Department.findById(scopeValue);
      if (!department) return res.status(404).json({ message: 'Department not found.' });
      assetQuery.department = department._id;
      displayScopeValue = department.name;
    } else if (scopeType === 'Location') {
      assetQuery.location = new RegExp(`^${scopeValue}$`, 'i');
    }

    const assets = await Asset.find(assetQuery).select('assetTag name');
    if (!assets.length) {
      return res.status(400).json({ message: 'No active assets found in that scope to audit.' });
    }

    const cycle = await AuditCycle.create({
      name,
      scopeType,
      scopeValue: displayScopeValue,
      startDate,
      endDate,
      auditors: auditorIds && auditorIds.length ? auditorIds : [req.user._id],
      createdBy: req.user._id,
      items: assets.map((asset) => ({
        asset: asset._id,
        assetTag: asset.assetTag,
        assetName: asset.name,
        result: 'Pending',
      })),
    });

    await logActivity({
      user: req.user._id,
      action: `Opened audit cycle "${cycle.name}" (${assets.length} assets)`,
      module: 'Audit',
      metadata: { auditCycleId: cycle._id },
    });

    res.status(201).json({ message: 'Audit cycle created successfully.', id: cycle._id.toString() });
  } catch (error) {
    next(error);
  }
};

// @desc    Record the verification result for one item in an open audit cycle
// @route   PUT /api/audits/:id/items
// @access  Private (Admin & Asset Manager)
exports.updateAuditItemResult = async (req, res, next) => {
  try {
    const { assetTag, result } = req.body;
    if (!assetTag || !['Pending', 'Verified', 'Missing', 'Damaged'].includes(result)) {
      return res.status(400).json({ message: 'Provide a valid assetTag and result.' });
    }

    const cycle = await AuditCycle.findOne({ _id: req.params.id, status: 'Open' });
    if (!cycle) return res.status(404).json({ message: 'An open audit cycle was not found.' });

    const item = cycle.items.find((entry) => entry.assetTag === assetTag);
    if (!item) return res.status(404).json({ message: 'That asset is not part of this audit cycle.' });

    item.result = result;
    await cycle.save();

    res.status(200).json({ message: 'Audit item updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Close an audit cycle. Any item still marked 'Missing' flips its
//          asset to status 'Lost'.
// @route   POST /api/audits/:id/close
// @access  Private (Admin & Asset Manager)
exports.closeAuditCycle = async (req, res, next) => {
  try {
    const cycle = await AuditCycle.findOne({ _id: req.params.id, status: 'Open' });
    if (!cycle) return res.status(404).json({ message: 'An open audit cycle was not found.' });

    cycle.status = 'Closed';
    cycle.closedAt = new Date();
    await cycle.save();

    const missingItems = cycle.items.filter((item) => item.result === 'Missing');
    if (missingItems.length) {
      await Asset.updateMany(
        { _id: { $in: missingItems.map((item) => item.asset) } },
        { $set: { status: 'Lost' } }
      );
    }

    await logActivity({
      user: req.user._id,
      action: `Closed audit cycle "${cycle.name}"${missingItems.length ? ` (${missingItems.length} assets marked Lost)` : ''}`,
      module: 'Audit',
      metadata: { auditCycleId: cycle._id, missingCount: missingItems.length },
    });

    res.status(200).json({ message: 'Audit cycle closed successfully.', missingCount: missingItems.length });
  } catch (error) {
    next(error);
  }
};
