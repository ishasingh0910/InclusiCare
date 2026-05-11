// const { analyzeSentiment } = require('../utils/sentimentAnalyzer'); 
// const JournalEntry = require('../models/journalEntry');
// const MoodAnalytics = require('../models/moodAnalytics'); // ADDED

// // Create Journal Entry
// exports.createJournalEntry = async (req, res) => {
//     try {
//         const { text, mood, userId } = req.body;

//         if (!text || !mood || !userId) {
//             return res.status(400).json({
//                 error: "Please provide text, mood, and userId"
//             });
//         }

//         const sentiment = analyzeSentiment(text);

//         const newEntry = {
//             userId,
//             text,
//             mood: mood || sentiment.mood,
//             sentimentScore: sentiment.score,
//             createdAt: new Date()
//         };

//         const savedEntry = await JournalEntry.create(newEntry);

//         // ADDED: Update Mood Analytics
//         let update = {};

//         let update = {};

// if (sentiment.score >= 0.6) {
//     update = { $inc: { positiveCount: 1 } };
// } else if (sentiment.score <= 0.4) {
//     update = { $inc: { negativeCount: 1 } };
// } else {
//     update = { $inc: { neutralCount: 1 } };
// }

//         if (Object.keys(update).length > 0) {
//             await MoodAnalytics.findOneAndUpdate(
//                 { userId },
//                 update,
//                 { upsert: true, new: true }
//             );
//         }
//         // END ADDED

//         res.status(201).json({
//             success: true,
//             data: savedEntry
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: "Server Error",
//             details: error.message
//         });
//     }
// };


// // Get Journal Entries for a User
// exports.getUserJournalEntries = async (req, res) => {
//     try {

//         const { userId } = req.query;

//         const entries = await JournalEntry
//             .find({ userId })
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             count: entries.length,
//             data: entries
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: "Server Error",
//             details: error.message
//         });
//     }
// };


// // Delete Entry
// exports.deleteJournalEntry = async (req, res) => {
//     try {

//         const { id } = req.params;

//         const deleted = await JournalEntry.findByIdAndDelete(id);

//         if (!deleted) {
//             return res.status(404).json({
//                 error: "Journal entry not found"
//             });
//         }

//         res.json({
//             success: true,
//             message: "Entry deleted"
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: "Server Error",
//             details: error.message
//         });
//     }
// };


// // Mood Insights
// exports.getMoodInsights = async (req, res) => {

//     try {

//         const { userId } = req.query;

//         const journalEntries = await JournalEntry.find({ userId });

//         if (journalEntries.length === 0) {
//             return res.json({
//                 success: true,
//                 data: {
//                     totalEntries: 0,
//                     mostFrequentMood: null,
//                     positiveEntries: 0,
//                     negativeEntries: 0
//                 }
//             });
//         }

//         const moodCounts = {};
//         let positive = 0;
//         let negative = 0;

//         journalEntries.forEach(entry => {

//             moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;

//             if (entry.sentimentScore >= 0.6) positive++;
//             if (entry.sentimentScore <= 0.4) negative++;

//         });

//         let mostFrequentMood = Object.keys(moodCounts).reduce((a, b) =>
//             moodCounts[a] > moodCounts[b] ? a : b
//         );

//         res.json({
//             success: true,
//             data: {
//                 totalEntries: journalEntries.length,
//                 mostFrequentMood,
//                 positiveEntries: positive,
//                 negativeEntries: negative
//             }
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: "Server Error",
//             details: error.message
//         });
//     }
// };


const { analyzeSentiment } = require('../utils/sentimentAnalyzer'); 
const JournalEntry = require('../models/journalEntry');
const MoodAnalytics = require('../models/moodAnalytics');


// ✅ CREATE
exports.createJournalEntry = async (req, res) => {
    try {
        const { text, mood, userId } = req.body;

        if (!text || !userId) {
            return res.status(400).json({
                error: "Please provide text and userId"
            });
        }

        const sentiment = analyzeSentiment(text);

        const newEntry = await JournalEntry.create({
            userId,
            text,
            mood: mood || sentiment.mood,
            sentimentScore: sentiment.score,
            createdAt: new Date()
        });

        // ✅ Mood Analytics Update
        let update = {};

        if (sentiment.score >= 0.6) {
            update = { $inc: { positiveCount: 1 } };
        } else if (sentiment.score <= 0.4) {
            update = { $inc: { negativeCount: 1 } };
        } else {
            update = { $inc: { neutralCount: 1 } };
        }

        await MoodAnalytics.findOneAndUpdate(
            { userId },
            update,
            { upsert: true, new: true }
        );

        res.status(201).json({
            success: true,
            data: newEntry
        });

    } catch (error) {
        res.status(500).json({
            error: "Server Error",
            details: error.message
        });
    }
};


// ✅ UPDATE
exports.updateJournalEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, mood } = req.body;

        const existingEntry = await JournalEntry.findById(id);

        if (!existingEntry) {
            return res.status(404).json({
                error: "Journal entry not found"
            });
        }

        let updatedData = {};

        if (text) {
            const sentiment = analyzeSentiment(text);
            updatedData.text = text;
            updatedData.sentimentScore = sentiment.score;
            updatedData.mood = mood || sentiment.mood;
        }

        if (mood) {
            updatedData.mood = mood;
        }

        const updatedEntry = await JournalEntry.findByIdAndUpdate(
            id,
            updatedData,
            { new: true }
        );

        res.json({
            success: true,
            data: updatedEntry
        });

    } catch (error) {
        res.status(500).json({
            error: "Server Error",
            details: error.message
        });
    }
};


// ✅ READ
exports.getUserJournalEntries = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                error: "userId is required"
            });
        }

        const entries = await JournalEntry
            .find({ userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: entries.length,
            data: entries
        });

    } catch (error) {
        res.status(500).json({
            error: "Server Error",
            details: error.message
        });
    }
};


// ✅ DELETE
exports.deleteJournalEntry = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await JournalEntry.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                error: "Journal entry not found"
            });
        }

        res.json({
            success: true,
            message: "Entry deleted"
        });

    } catch (error) {
        res.status(500).json({
            error: "Server Error",
            details: error.message
        });
    }
};


// ✅ MOOD INSIGHTS
exports.getMoodInsights = async (req, res) => {
    try {
        const { userId } = req.query;

        const journalEntries = await JournalEntry.find({ userId });

        if (journalEntries.length === 0) {
            return res.json({
                success: true,
                data: {
                    totalEntries: 0,
                    mostFrequentMood: null,
                    positiveEntries: 0,
                    negativeEntries: 0
                }
            });
        }

        const moodCounts = {};
        let positive = 0;
        let negative = 0;

        journalEntries.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;

            if (entry.sentimentScore >= 0.6) positive++;
            if (entry.sentimentScore <= 0.4) negative++;
        });

        let mostFrequentMood = Object.keys(moodCounts).reduce((a, b) =>
            moodCounts[a] > moodCounts[b] ? a : b
        );

        res.json({
            success: true,
            data: {
                totalEntries: journalEntries.length,
                mostFrequentMood,
                positiveEntries: positive,
                negativeEntries: negative
            }
        });

    } catch (error) {
        res.status(500).json({
            error: "Server Error",
            details: error.message
        });
    }
};