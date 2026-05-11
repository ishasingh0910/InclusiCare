/**
 * Analyzes the sentiment of a given text.
 * @param {string} text - The journal text to analyze.
 * @returns {Object} An object containing the calculated mood and sentiment score.
 */
function analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
        return { mood: 'neutral', score: 0 };
    }

    const positiveKeywords = ['happy', 'joy', 'great', 'good', 'excited', 'love', 'fantastic', 'amazing', 'hope', 'better'];
    const negativeKeywords = ['sad', 'bad', 'angry', 'anxious', 'depressed', 'hate', 'terrible', 'worst', 'fear', 'alone'];

    const lowerText = text.toLowerCase();
    const words = lowerText.match(/\b\w+\b/g) || [];

    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
        if (positiveKeywords.includes(word)) positiveCount++;
        if (negativeKeywords.includes(word)) negativeCount++;
    });

    const totalKeywords = positiveCount + negativeCount;

    // Base neutral score
    if (totalKeywords === 0) {
        return { mood: 'neutral', score: 0.5 };
    }

    // Calculate sentiment score between 0 (highly negative) and 1 (highly positive)
    // Formula: (positiveCount / totalKeywords) -> ranges from 0 to 1
    const score = positiveCount / totalKeywords;

    let mood = 'neutral';
    if (score >= 0.6) {
        mood = 'positive';
    } else if (score <= 0.4) {
        mood = 'negative';
    }

    return {
        mood,
        // Round score to two decimal places
        score: Math.round(score * 100) / 100
    };
}

module.exports = {
    analyzeSentiment
};
