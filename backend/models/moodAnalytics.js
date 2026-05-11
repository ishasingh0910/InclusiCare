const mongoose = require("mongoose");

const moodAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  positiveCount: {
    type: Number,
    default: 0
  },
  negativeCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("MoodAnalytics", moodAnalyticsSchema);
