<div align="center">

# Builder AI

**Describe a website in plain English. Get a working, multi-file React project with live preview, chat-based editing, one-click publishing, and ZIP export.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](#license)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [How the AI Pipeline Works](#how-the-ai-pipeline-works)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Builder AI is a full-stack MERN application that turns a natural-language prompt into a complete React website. An AI agent first **plans** the file structure, then **generates each file in parallel**, and the result appears instantly in an in-browser editor and live preview powered by Sandpack.

Once the site is generated, you can keep iterating by chatting with the AI ("make the hero darker", "add a pricing section"). Changes are applied as targeted search/replace patches rather than full rewrites, so edits are fast and the rest of your code stays untouched. When you're happy, publish the site to a shareable public link or download it as a ready-to-run Vite project.

<!--
## Screenshots
Add screenshots or a demo GIF here, for example:
![Home](./docs/home.png)
![Builder](./docs/builder.png)
-->

## Features

**Generation**
- Prompt-to-website generation with a two-phase pipeline: plan first, then write files
- Parallel file generation with configurable concurrency and automatic retry rounds for failed files
- Intent recognition: small apps and games are built as a functional single-file app, while marketing sites get a full multi-component landing page
- Real-time progress dashboard showing planned files, the file currently being written, and completion percentage

**Editing**
- Chat-based revisions applied as `create`, `update` and `delete` file operations
- Whitespace-tolerant search/replace matching so slightly misformatted AI patches still apply
- Built-in Sandpack code editor with file explorer; manual edits are auto-saved with a debounce

**Quality guardrails**
- Post-generation validator and auto-fixer that repairs common AI mistakes: `class` to `className`, `for` to `htmlFor`, un-closed void elements, missing default exports, missing React imports, stray HTML comments, leaked TypeScript annotations, markdown code fences, and broken relative import paths
- Content normalizer that fixes double-escaped newlines and quotes in model output
- Sandpack error monitor that suppresses transient network errors from the overlay

**Sharing**
- Live preview in a full-page tab
- One-click publish to a public URL (`/publish/:id`)
- Export the project as a ZIP containing `package.json`, `vite.config.js`, `index.html` and source files, with npm dependencies auto-detected from imports

**Accounts**
- Email and password authentication with bcrypt hashing and JWT stored in an `httpOnly` cookie
- Per-user project dashboard with create, open and delete

## Architecture

[![Architecture diagram of darshan-beep/ai-developer](https://gitdiagram.com/darshan-beep/ai-developer/diagram.png)](https://gitdiagram.com/darshan-beep/ai-developer?utm_source=readme&utm_medium=picture)

```
Browser (React + Sandpack)
        |
        |  REST (cookies / JWT)
        v
Express API  --->  MongoDB (users, projects, files, messages)
        |
        v
AI Service (Vercel AI SDK)  --->  OpenRouter  --->  LLM
   plan -> generate files (parallel) -> validate/fix -> save
```

Generation runs in the background on the server. The client polls the project every 2 seconds while its status is `pending`, `generating` or `revising`, which drives the live progress dashboard.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router 7, Sandpack, Axios, react-hot-toast, Lucide icons, JSZip, file-saver |
| **Backend** | Node.js, Express 5, Mongoose, JSON Web Tokens, bcrypt, cookie-parser, CORS |
| **AI** | Vercel AI SDK (`ai`, `@ai-sdk/openai`) with OpenRouter, Zod schemas for structured output, p-map for concurrency control |
| **Database** | MongoDB |

## Project Structure

```
ai-developer/
├── client/
│   └── src/
│       ├── api/            # Axios instance
│       ├── components/     # ChatPanel, PreviewPanel, FileExplorer, AgentProgressDashboard, ...
│       ├── context/        # AppContext (auth, projects, chat, autosave)
│       ├── pages/          # Home, Auth, Builder, Preview, Publish
│       └── utils/          # exportProject (ZIP), sandpackUtils (dependency detection)
└── server/
    ├── config/             # MongoDB connection
    ├── controllers/        # Auth, Project, Chat
    ├── middleware/         # JWT auth middleware
    ├── models/             # User, Project
    ├── routes/             # /api/auth, /api/projects
    └── services/
        ├── ai.js               # Plan, generate and revise pipeline
        ├── aiSchemas.js        # Zod schemas for structured output
        ├── prompts.js          # System prompts and design system
        ├── codeValidator.js    # Auto-fixer for common AI code errors
        ├── contentNormalizer.js
        └── diff.js             # Applies create/update/delete operations
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- An [OpenRouter](https://openrouter.ai/) API key

### 1. Clone the repository

```bash
git clone https://github.com/darshan-beep/ai-developer.git
cd ai-developer
```

### 2. Set up the server

```bash
cd server
npm install
```

Create `server/.env` (see [Environment Variables](#environment-variables)), then start the API:

```bash
npm run dev     # development with nodemon
# or
npm start       # production
```

### 3. Set up the client

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_BASE_URL=http://localhost:3000
```

```bash
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`), create an account, and describe your first website.

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign session tokens |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key |
| `ORIGIN` | Yes | Allowed CORS origin(s), comma-separated (e.g. `http://localhost:5173`) |
| `OPENROUTER_MODEL` | No | Model ID to use (default: `openrouter/free`) |
| `AI_MAX_CONCURRENCY` | No | Number of files generated in parallel (default: `6`) |
| `PORT` | No | API port (default: `3000`) |
| `NODE_ENV` | No | Set to `production` to enable secure cookies |

### Client (`client/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_BASE_URL` | Yes | Base URL of the API server |

> Never commit `.env` files. Add them to `.gitignore`.

## API Reference

All `/api/projects` routes (except the public one) require an authenticated session cookie.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/auth/me` | Get the current user |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/projects` | Create a project from a prompt and start background generation |
| `GET` | `/api/projects` | List the current user's projects |
| `GET` | `/api/projects/:id` | Get a project with its files, messages and status |
| `DELETE` | `/api/projects/:id` | Delete a project |
| `PUT` | `/api/projects/:id/files` | Save manually edited files |
| `POST` | `/api/projects/:id/chat` | Request an AI revision |
| `POST` | `/api/projects/:id/publish` | Publish the project |
| `GET` | `/api/projects/public/:id` | Fetch a published project (no auth required) |

## How the AI Pipeline Works

1. **Plan.** The model returns a structured plan (Zod-validated) listing every file with its purpose, exports and imports, so files agree on component contracts.
2. **Generate.** Files are written concurrently. Each request includes the full file plan plus the code of already-generated files for consistency.
3. **Validate.** Every file passes through the normalizer and validator, which fix common syntax and import-path mistakes before saving.
4. **Retry.** Failed files are retried for up to two extra rounds; any that still fail get a clearly marked placeholder so the project still renders.
5. **Revise.** Chat requests send a file manifest and contents to the model, which responds with a list of `create` / `update` / `delete` operations that are applied to the stored files, bumping the project version.

## Roadmap

- [ ] Streaming generation output
- [ ] Version history with rollback
- [ ] Image upload and asset support
- [ ] Custom subdomains for published sites
- [ ] Tests and CI pipeline
- [ ] Rate limiting and usage quotas

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

This project is licensed under the ISC License.

---

<div align="center">

Built by [Darshan](https://github.com/darshan-beep)

</div>
