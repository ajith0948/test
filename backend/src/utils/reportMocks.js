/**
 * Report Mock Data (Owned by Member 4 - Likitha)
 * Phase 4: Replace each function body with the corresponding Mongoose aggregation pipeline.
 */
const utilizationData = [
  { status: 'Available',        count: 142 },
  { status: 'Allocated',        count: 315 },
  { status: 'UnderMaintenance', count: 8   },
  { status: 'Reserved',         count: 5   },
  { status: 'Lost',             count: 2   },
  { status: 'Retired',          count: 10  },
  { status: 'Disposed',         count: 3   }
];

const maintenanceData = [
  { status: 'Pending',            count: 4  },
  { status: 'Approved',           count: 2  },
  { status: 'TechnicianAssigned', count: 1  },
  { status: 'InProgress',         count: 3  },
  { status: 'Resolved',           count: 18 },
  { status: 'Rejected',           count: 1  }
];

const allocationData = [
  { status: 'Active',   count: 315 },
  { status: 'Returned', count: 280 },
  { status: 'Overdue',  count: 12  }
];

exports.getMockUtilizationData  = async () => utilizationData;
exports.getMockMaintenanceData  = async () => maintenanceData;
exports.getMockAllocationData   = async () => allocationData;
