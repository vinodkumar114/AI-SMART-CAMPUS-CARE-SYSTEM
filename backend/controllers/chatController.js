const submitMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    // Simple sentiment analysis mock wrapper for the hackathon
    // Since we aren't hooking up a real python microservice right now
    const lowerMsg = message.toLowerCase();
    let sentiment = 'neutral';
    let responseText = "I hear you. Tell me more about what's on your mind. Remember, I am an AI, but I'm here to listen.";

    // Lexical matching for sentiment
    if (lowerMsg.match(/(stress|anxious|tired|overwhelmed|fail|sad|cry|depressed|hopeless)/)) {
      sentiment = 'negative';
      responseText = "It sounds like you're going through a really tough time. Your feelings are completely valid, and it's okay to feel this way. I highly encourage you to schedule a quick chat with our campus counselors—they are amazing at helping students navigate this. Would you like me to show you how?";
    } else if (lowerMsg.match(/(happy|great|good|passed|excited|awesome|relieved)/)) {
      sentiment = 'positive';
      responseText = "That's wonderful to hear! It's great that things are going well. Keep up the good energy!";
    }

    res.json({
      reply: responseText,
      sentiment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitMessage };
