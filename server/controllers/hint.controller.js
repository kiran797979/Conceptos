const hintData = require('../demo_data/hints.json');

function generateHint(req, res) {
  const { topic, language = 'en', level = 'beginner' } = req.body;

  const selected = hintData.find((item) => item.topic.toLowerCase() === String(topic).toLowerCase()) || {
    topic,
    hints: [
      'Break the topic into smaller concepts.',
      'Identify one real-world example.',
      'Summarize what you learned in one sentence.'
    ]
  };

  return res.status(200).json({
    success: true,
    data: {
      topic: selected.topic,
      language,
      level,
      hints: selected.hints
    }
  });
}

module.exports = {
  generateHint
};
