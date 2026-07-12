/**
 * Audit Controller (Owned by Member 4 - Likitha)
 *
 * Handles Audit Cycles, items, and verification logic.
 * Currently uses mock data to adhere to the agreed API contract.
 */
const mockHelper = require('../utils/auditMocks');

exports.getAuditCycles = async (req, res, next) => {
  try {
    // TODO (Phase 4): Replace with AuditCycle.find().populate('auditors')
    const audits = await mockHelper.getMockAudits();
    res.status(200).json(audits);
  } catch (error) {
    next(error);
  }
};

exports.createAuditCycle = async (req, res, next) => {
  try {
    // TODO (Phase 4): Validate input and create new AuditCycle document
    res.status(201).json({ message: "Audit cycle created successfully (mock)" });
  } catch (error) {
    next(error);
  }
};

exports.updateAuditItemResult = async (req, res, next) => {
  try {
    // TODO (Phase 4): Update specific AuditItem result in MongoDB
    res.status(200).json({ message: "Audit item updated successfully (mock)" });
  } catch (error) {
    next(error);
  }
};

exports.closeAuditCycle = async (req, res, next) => {
  try {
    // TODO (Phase 4):
    // 1. Mark AuditCycle status as 'Closed'
    // 2. Business Rule: Find all AuditItems in this cycle marked 'Missing'
    // 3. For each missing item, update corresponding Asset.status to 'Lost'
    res.status(200).json({ message: "Audit cycle closed successfully (mock)" });
  } catch (error) {
    next(error);
  }
};
