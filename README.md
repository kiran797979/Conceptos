# ConceptOS Backend (Phase 1)

A runnable Node.js + Express backend skeleton for ConceptOS.

## Features

- Express application bootstrap (`index.js`, `app.js`)
- API versioning under `/api/v1`
- Health endpoint
- Hint and quiz endpoints with request validation
- Centralized not-found and error handling
- Demo data for mock responses

## Project Structure

```
.
├── app.js
├── index.js
├── package.json
├── .env.example
└── server
    ├── controllers
    │   ├── health.controller.js
    │   ├── hint.controller.js
    │   └── quiz.controller.js
    ├── demo_data
    │   ├── hints.json
    │   └── quiz.json
    ├── middlewares
    │   ├── errorHandler.js
    │   └── validateBody.js
    ├── routes
    │   ├── health.routes.js
    │   ├── hint.routes.js
    │   ├── index.js
    │   └── quiz.routes.js
    ├── schemas
    │   ├── hint.schema.js
    │   └── quiz.schema.js
    └── utils
        └── response.js
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Start in dev mode:
   ```bash
   npm run dev
   ```

## Run

```bash
npm start
```

Server URL: `http://localhost:3000`

## API Endpoints

### Health

- `GET /api/v1/health`

### Hints

- `POST /api/v1/hints`
- Body:
  ```json
  {
    "topic": "fractions",
    "language": "en",
    "level": "beginner"
  }
  ```

### Quiz

- `POST /api/v1/quiz`
- Body:
  ```json
  {
    "topic": "fractions",
    "questionCount": 2
  }
  ```
