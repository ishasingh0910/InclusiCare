// const express = require('express');
// const router = express.Router();
// const {
//     createJournalEntry,
//     getUserJournalEntries,
//     deleteJournalEntry,
//     getMoodInsights
// } = require('../controllers/journalController');

// // In a real application, you would attach authentication middleware here
// // const { protect } = require('../middleware/auth');
// // router.use(protect); // Protect all journal routes

// // @route   GET /api/journal/insights
// // NOTE: Place this BEFORE /:id routes so "insights" isn't treated as an ID parameter
// router.get('/insights', getMoodInsights);

// // @route   POST /api/journal
// // @route   GET /api/journal
// router.route('/')
//     .post(createJournalEntry)
//     .get(getUserJournalEntries);

// // @route   DELETE /api/journal/:id
// router.route('/:id')
//     .delete(deleteJournalEntry);

// module.exports = router;

const express = require('express');
const router = express.Router();

const {
    createJournalEntry,
    updateJournalEntry,
    getUserJournalEntries,
    deleteJournalEntry,
    getMoodInsights
} = require('../controllers/journalController');

// ✅ CREATE
router.post('/journal', createJournalEntry);

// ✅ READ
router.get('/journal', getUserJournalEntries);

// ✅ UPDATE
router.put('/journal/:id', updateJournalEntry);

// ✅ DELETE
router.delete('/journal/:id', deleteJournalEntry);

// ✅ MOOD INSIGHTS
router.get('/journal/insights', getMoodInsights);

module.exports = router;