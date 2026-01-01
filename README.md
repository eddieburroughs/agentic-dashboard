# Agentic Dashboard

A unified web control panel for managing AI-powered coding tools. Built with Next.js 16, React 19, and Tailwind CSS.

## Overview

Agentic Dashboard provides a single interface to start, stop, and monitor multiple AI coding automation tools:

- **Continuous Claude** - Automated PR loop tool that runs Claude Code iteratively to accomplish tasks like adding tests until coverage targets are met
- **Auto-Claude** - Multi-agent framework for generating specifications and coordinating complex development tasks
- **Automaker** - Visual Kanban board interface for managing AI agent tasks

## Features

- Start/stop tools with one click
- Real-time status monitoring with auto-refresh
- Quick action presets for common workflows (add tests, fix lint, update deps)
- System info display (Claude Code, Node.js, Python versions)
- Run history tracking (last 20 runs)
- Dark theme UI

## Getting Started

### Prerequisites

- Node.js 20+
- Claude Code CLI installed
- Python 3 (for Auto-Claude)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 to access the dashboard.

### Production

```bash
npm run build
npm start
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/status | GET | Get status of all tools and recent runs |
| /api/system | GET | Get system info (versions) |
| /api/tools/continuous-claude | POST/DELETE | Start/Stop Continuous Claude |
| /api/tools/auto-claude | POST/DELETE | Start/Stop Auto-Claude |
| /api/tools/automaker | POST/DELETE | Start/Stop Automaker server |

## Live Dashboard

Access at: https://intelliagent.site

## License

MIT
