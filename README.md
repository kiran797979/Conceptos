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

## Phase 2: AI Hint Generation (OpenRouter)

### Environment Configuration

Set the following variables in `.env`:

```bash
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
PRIMARY_MODEL=qwen/qwen3-next-80b-a3b-instruct:free
FALLBACK_MODEL=openai/gpt-oss-120b:free
MODEL_TIMEOUT_MS=8000
```

If `OPENROUTER_API_KEY` is missing, hint generation degrades safely with:

```json
{ "success": false, "error": "service_degraded" }
```

### Run

```bash
npm install
npm run dev
```

### Fallback Behavior

- Primary model is used first.
- If primary fails repeatedly, a circuit breaker opens after 3 consecutive failures and skips primary for 30 seconds.
- Requests automatically retry up to 3 times with exponential backoff (500ms, 1000ms, 2000ms).
- On primary failure, the fallback model is attempted.
- If all attempts fail or output is invalid JSON/schema, the API returns `service_degraded`.
