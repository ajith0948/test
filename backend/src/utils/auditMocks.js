// NOT USED - superseded by the real AuditCycle model + controllers/auditController.js.
// This file can be deleted.
/**
 * Audit Mock Data (Owned by Member 4 - Likitha)
 *
 * Provides mock audit cycle data reflecting the agreed API contract.
 * Phase 4: Replace with AuditCycle.find().populate('auditors') and real AuditItem docs.
 */
const mockAudits = [
  {
    id: "audit-101",
    name: "Q3 Electronics Audit",
    scopeType: "Department",
    scopeValue: "IT Operations",
    startDate: "2026-07-01T00:00:00Z",
    endDate: "2026-07-15T00:00:00Z",
    auditors: ["Priya Sharma"],
    status: "Open",
    items: [
      { assetTag: "AF-0012", assetName: "Dell XPS 15", result: "Verified" },
      { assetTag: "AF-0045", assetName: "iPad Pro", result: "Pending" },
      { assetTag: "AF-0062", assetName: "Lenovo ThinkPad", result: "Missing" }
    ]
  },
  {
    id: "audit-099",
    name: "Q2 Furniture Audit",
    scopeType: "Location",
    scopeValue: "Building A, Floor 2",
    startDate: "2026-04-01T00:00:00Z",
    endDate: "2026-04-10T00:00:00Z",
    auditors: ["Raj Patel"],
    status: "Closed",
    items: [
      { assetTag: "AF-0005", assetName: "Office Chair", result: "Verified" },
      { assetTag: "AF-0008", assetName: "Standing Desk", result: "Damaged" }
    ]
  }
];

exports.getMockAudits = async () => {
  return mockAudits;
};
