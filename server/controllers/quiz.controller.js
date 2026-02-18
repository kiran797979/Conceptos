const quizData = require('../demo_data/quiz.json');

function generateQuiz(req, res) {
  const { topic, questionCount = 3 } = req.body;

  const topicQuiz = quizData.filter((q) => q.topic.toLowerCase() === String(topic).toLowerCase());
  const selected = topicQuiz.length > 0 ? topicQuiz.slice(0, questionCount) : [];

  return res.status(200).json({
    success: true,
    data: {
      topic,
      count: selected.length,
      questions: selected
    }
  });
}

module.exports = {
  generateQuiz
};
