const hintData = require('../demo_data/hints.json');
const modelAdapter = require('../services/modelAdapter');

function getMockHints(topic) {
  return hintData.find((item) => item.topic.toLowerCase() === String(topic).toLowerCase()) || {
    topic,
    hints: [
      'Break the topic into smaller concepts.',
      'Identify one real-world example.',
      'Summarize what you learned in one sentence.'
    ]
  };
}

async function generateHint(req, res) {
  const {
    topic,
    diagnosticQuestion = '',
    language = 'en',
    stage = '1'
  } = req.body;

  if (process.env.NODE_ENV === 'mock') {
    const selected = getMockHints(topic);
    return res.status(200).json({
      success: true,
      data: {
        topic: selected.topic,
        language,
        stage,
        hint1: selected.hints[0] || '',
        hint2: selected.hints[1] || '',
        hint3: selected.hints[2] || '',
        answer: '',
        confidence: 0.6
      }
    });
  }

  try {
    const aiResult = await modelAdapter.generateHints({
      topic,
      diagnosticQuestion,
      language,
      stage
    });

    if (aiResult && aiResult.success === false && aiResult.error === 'service_degraded') {
      return res.status(503).json(aiResult);
    }

    return res.status(200).json({ success: true, data: aiResult });
  } catch (_err) {
    console.error('[hint.controller] generateHint failed');
    return res.status(503).json({ success: false, error: 'service_degraded' });
  }
}

module.exports = {
  generateHint
};
