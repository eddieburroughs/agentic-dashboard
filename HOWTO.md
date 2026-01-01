# Agentic Dashboard - Complete How-To Guide

## Overview

The Agentic Dashboard at **https://intelliagent.site** provides a unified control panel for four AI-powered coding automation tools:

| Tool | Purpose | Best For |
|------|---------|----------|
| **Continuous Claude** | PR loop automation | Incremental improvements, test coverage, lint fixes |
| **Auto-Claude** | Multi-agent spec builder | New features, refactoring, complex implementations |
| **Automaker** | Visual Kanban agent studio | Task management, visual workflows |
| **ACFS** | Environment & session management | Tool status, NTM sessions, system health |

---

## Quick Start

### 1. Access the Dashboard
Open **https://intelliagent.site** in your browser.

### 2. Check System Status
The top bar shows:
- Claude Code version
- Node.js version
- Python version

### 3. Choose Your Tool
Each card has a colored header indicating its purpose. Click to expand/collapse.

---

## Tool 1: Continuous Claude

### What It Does
Runs Claude Code in a loop to iteratively improve your codebase. Each run creates a PR or commit, then continues until the task is complete or max runs reached.

### How to Use

1. **Set Task Prompt**
   ```
   Example prompts:
   - "add unit tests until coverage reaches 80%"
   - "fix all ESLint errors and warnings"
   - "update dependencies to latest stable versions"
   - "add TypeScript types to all JavaScript files"
   ```

2. **Set Max Runs**
   - Recommended: 5-10 for small tasks
   - Use 15-20 for larger refactoring
   - Maximum: 100

3. **Repository (Optional)**
   - Format: `owner/repo`
   - Leave blank to use current directory

4. **Click "Start Loop"**
   - Status changes to "Running"
   - Output appears in the card
   - Click "Stop" to abort

### Best Practices
- Start with low max runs (3-5) to test
- Be specific in your prompts
- Check output regularly for progress

### Example Workflow
```
Task: "Add comprehensive error handling to all API routes"
Max Runs: 10
Result: Claude iteratively adds try/catch, error responses, logging
```

---

## Tool 2: Auto-Claude

### What It Does
Uses multiple AI agents (Planner, Coder, QA Reviewer, QA Fixer) to build features from specifications. Creates a detailed spec first, then implements with human review checkpoints.

### How to Use

1. **Set Task Description**
   ```
   Example tasks:
   - "Add a user settings page with dark/light theme toggle"
   - "Implement a REST API for user authentication"
   - "Create a dashboard with real-time metrics"
   - "Add file upload functionality with progress bar"
   ```

2. **Set Project Directory**
   - Default: `/root/agentic-tools`
   - Change to your project path

3. **Click "Create Spec"**
   - Auto-Claude analyzes your codebase
   - Creates requirements, complexity assessment
   - Generates implementation plan
   - Pauses at human review checkpoint

### The Auto-Claude Phases
1. **Project Discovery** - Scans codebase structure
2. **Requirements Gathering** - Understands what's needed
3. **Complexity Assessment** - SIMPLE, MEDIUM, or COMPLEX
4. **Historical Context** - Finds similar past work (if Graphiti enabled)
5. **Quick Spec** - Creates detailed specification
6. **Validation** - Verifies spec completeness
7. **Human Review** - Waits for your approval

### After Spec Creation
To continue with implementation via SSH:
```bash
ssh root@intelliagent.site
cd /root/agentic-tools/Auto-Claude/apps/backend
python run.py --spec 001  # Run the approved spec
```

### View Generated Specs
Specs are saved to:
```
/root/agentic-tools/Auto-Claude/apps/backend/.auto-claude/specs/
```

---

## Tool 3: Automaker

### What It Does
Provides a visual Kanban-style interface for managing AI agent tasks. Good for organizing multiple tasks and tracking progress visually.

### How to Use

1. **Click "Start Server"**
   - Launches Automaker on port 3007
   - Status changes to "Running"

2. **Click "Open UI"**
   - Opens Automaker's visual interface
   - Note: Requires direct access to port 3007

3. **In the Automaker UI**
   - Create task cards
   - Assign to AI agents
   - Track progress visually
   - Manage workflows

### Accessing Automaker UI
Via SSH tunnel (if port 3007 not exposed):
```bash
ssh -L 3007:localhost:3007 root@intelliagent.site
# Then open http://localhost:3007 in your browser
```

---

## Tool 4: ACFS (Agentic Coding Flywheel Setup)

### What It Does
Manages your development environment, shows installed tools, and controls NTM (Named Tmux Manager) sessions for multi-agent workflows.

### Features

#### Installed Tools Grid
Shows 9 tools with versions:
- **bun** - Fast JavaScript runtime
- **cargo** - Rust package manager
- **go** - Go programming language
- **uv** - Fast Python package manager
- **claude** - Claude Code CLI
- **ntm** - Named Tmux Manager
- **bat** - Better cat with syntax highlighting
- **rg** - ripgrep for fast search
- **fd** - Fast file finder

#### NTM Sessions
View and manage tmux sessions with AI agents.

**To spawn a new session** (via SSH):
```bash
ssh ubuntu@intelliagent.site
ntm spawn myproject --cc=2        # 2 Claude agents
ntm spawn myproject --cc=2 --cod=1  # 2 Claude + 1 Codex
ntm attach myproject              # Attach to session
```

**Session controls in dashboard:**
- View active sessions
- Kill sessions with trash icon

#### Run Doctor
Click "Run Doctor" to check system health:
- Identity & permissions
- Workspace setup
- Shell configuration
- Core tools
- AI agents
- Cloud/DB tools
- Stack tools

### ACFS Commands (via SSH)
```bash
ssh ubuntu@intelliagent.site

# Check system health
acfs doctor

# Update ACFS tools
acfs update

# Interactive onboarding tutorial
onboard

# Quick agent access
cc   # Claude Code
cod  # Codex CLI
gmi  # Gemini CLI
```

---

## Quick Actions Panel

Pre-configured workflows to quickly set up common tasks:

| Action | What It Does |
|--------|--------------|
| **Add Unit Tests** | Sets Continuous Claude to add tests for 80% coverage |
| **Refactor Codebase** | Sets Auto-Claude for clean architecture improvements |
| **Fix Lint Issues** | Sets Continuous Claude to fix ESLint errors |
| **Update Dependencies** | Sets Continuous Claude to upgrade packages |

Click any action to pre-fill the relevant tool's form.

---

## SSH Access for Advanced Features

Some features require SSH access:

```bash
# Connect as root
ssh root@intelliagent.site

# Connect as ubuntu (for ACFS tools)
ssh ubuntu@intelliagent.site
```

### Common SSH Tasks

**Run NTM multi-agent session:**
```bash
ssh ubuntu@intelliagent.site
ntm spawn myproject --cc=2 --cod=1
ntm attach myproject
```

**View Auto-Claude specs:**
```bash
ssh root@intelliagent.site
cat /root/agentic-tools/Auto-Claude/apps/backend/.auto-claude/specs/001-pending/spec.md
```

**Check running processes:**
```bash
pm2 list
pm2 logs agentic-dashboard
```

---

## Workflows & Recipes

### Workflow 1: Add a New Feature
1. Open Auto-Claude card
2. Describe feature: "Add user profile page with avatar upload"
3. Click "Create Spec"
4. Review generated spec via SSH
5. Approve and run implementation

### Workflow 2: Improve Test Coverage
1. Open Continuous Claude card
2. Prompt: "add unit tests to increase coverage to 80%"
3. Set max runs: 15
4. Click "Start Loop"
5. Monitor progress in output

### Workflow 3: Fix All Lint Errors
1. Click "Fix Lint Issues" in Quick Actions
2. Click "Start Loop" in Continuous Claude
3. Wait for completion

### Workflow 4: Multi-Agent Development
1. SSH to server: `ssh ubuntu@intelliagent.site`
2. Spawn session: `ntm spawn myproject --cc=2 --cod=1`
3. Attach: `ntm attach myproject`
4. Work with multiple AI agents in tmux panes

---

## Monitoring & Logs

### Dashboard Logs
```bash
pm2 logs agentic-dashboard
```

### Continuous Claude Output
Visible in the dashboard card after starting

### Auto-Claude Logs
```bash
cat /root/agentic-tools/Auto-Claude/apps/backend/.auto-claude/specs/*/task_logs.json
```

### ACFS Doctor Output
Click "Run Doctor" in ACFS card, or:
```bash
ssh ubuntu@intelliagent.site
acfs doctor
```

---

## Troubleshooting

### Dashboard Not Loading
```bash
ssh root@intelliagent.site
pm2 restart agentic-dashboard
pm2 logs agentic-dashboard
```

### Tool Shows "Error" Status
1. Check the output in the card
2. View logs: `pm2 logs agentic-dashboard`
3. Try stopping and restarting the tool

### Continuous Claude Fails to Start
- Ensure Claude Code is installed: `claude --version`
- Check permissions: `ls -la /usr/local/bin/continuous-claude`

### Auto-Claude Spec Creation Fails
- Check OAuth token: `cat ~/.claude/.credentials.json`
- Verify project directory exists

### NTM Session Won't Spawn
- Create project directory first: `mkdir -p /data/projects/myproject`
- Ensure tmux is running: `tmux list-sessions`

### ACFS Doctor Shows Failures
- Run suggested fix commands
- Re-run: `acfs doctor`

---

## API Reference

All endpoints are at `https://intelliagent.site/api/`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/system` | GET | System versions |
| `/api/status` | GET | Tool statuses |
| `/api/tools/continuous-claude` | POST/DELETE | Start/stop CC |
| `/api/tools/auto-claude` | POST | Create spec |
| `/api/tools/automaker` | POST/DELETE | Start/stop server |
| `/api/tools/acfs` | GET | Tool versions & sessions |
| `/api/tools/acfs` | POST | doctor, ntm-spawn, ntm-kill |

---

## Tool Comparison: When to Use What

| Scenario | Best Tool |
|----------|-----------|
| "Fix all TypeScript errors" | Continuous Claude |
| "Add comprehensive tests" | Continuous Claude |
| "Build new authentication system" | Auto-Claude |
| "Refactor to microservices" | Auto-Claude |
| "Manage multiple parallel tasks" | Automaker |
| "Work with multiple AI agents" | NTM (via ACFS) |
| "Check system health" | ACFS Doctor |

---

## Getting Help

- **Dashboard Issues**: Check PM2 logs
- **Tool Issues**: Check output in card
- **ACFS Issues**: Run `acfs doctor`
- **General**: SSH in and investigate

## Links

- [Auto-Claude GitHub](https://github.com/AndyMik90/Auto-Claude)
- [Continuous Claude GitHub](https://github.com/AnandChowdhary/continuous-claude)
- [Automaker GitHub](https://github.com/AutoMaker-Org/automaker)
- [ACFS GitHub](https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup)
