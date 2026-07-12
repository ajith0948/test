const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', auditController.getAuditCycles);
router.post('/', auditController.createAuditCycle);
router.put('/:id/items', auditController.updateAuditItemResult);
router.post('/:id/close', auditController.closeAuditCycle);

module.exports = router;
