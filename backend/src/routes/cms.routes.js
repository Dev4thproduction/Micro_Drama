const express = require('express');
const { allowRoles } = require('../middleware/auth');
const {
  createEntry,
  listEntries,
  getEntry,
  updateEntry,
  publishEntry,
  archiveEntry,
  listPublicEntries,
  getPublicEntryBySlug
} = require('../controllers/cmsController');

const router = express.Router();

// Publicly consumable published content (for marketing/home surfaces)
router.get('/public', listPublicEntries);
router.get('/public/:slug', getPublicEntryBySlug);

// Authenticated CMS management
router.use(...allowRoles(['admin', 'creator']));
router.get('/entries', listEntries);
router.post('/entries', createEntry);
router.get('/entries/:entryId', getEntry);
router.put('/entries/:entryId', updateEntry);
router.post('/entries/:entryId/publish', publishEntry);
router.post('/entries/:entryId/archive', archiveEntry);

module.exports = router;

