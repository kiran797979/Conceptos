const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const apiRouter = require('./server/routes');
const { notFoundHandler, errorHandler } = require('./server/middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({
    service: 'ConceptOS Backend',
    status: 'ok',
    docs: '/api/v1/health'
  });
});

app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
