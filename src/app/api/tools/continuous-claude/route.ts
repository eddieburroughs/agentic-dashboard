import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs/promises';

const STATE_FILE = '/tmp/agentic-dashboard-state.json';
const LOG_DIR = '/tmp/agentic-logs';

interface RunConfig {
  prompt: string;
  maxRuns: number;
  repo?: string;
  owner?: string;
}

async function saveState(toolKey: string, status: string, output: string, pid?: number) {
  try {
    let state = { tools: {}, runs: [] as Array<Record<string, unknown>> };
    try {
      const data = await fs.readFile(STATE_FILE, 'utf-8');
      state = JSON.parse(data);
    } catch {
      // File doesn't exist yet
    }

    state.tools = state.tools || {};
    (state.tools as Record<string, unknown>)[toolKey] = {
      name: toolKey === 'continuous-claude' ? 'Continuous Claude' : toolKey,
      status,
      output,
      pid,
    };

    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

async function addRun(tool: string, prompt: string, status: string) {
  try {
    let state = { tools: {}, runs: [] as Array<Record<string, unknown>> };
    try {
      const data = await fs.readFile(STATE_FILE, 'utf-8');
      state = JSON.parse(data);
    } catch {
      // File doesn't exist
    }

    state.runs = state.runs || [];
    state.runs.unshift({
      id: Date.now().toString(),
      tool,
      prompt,
      status,
      startedAt: new Date().toISOString(),
      output: '',
    });

    // Keep only last 20 runs
    state.runs = state.runs.slice(0, 20);

    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Error adding run:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RunConfig = await request.json();
    const { prompt, maxRuns, repo, owner } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Ensure log directory exists
    await fs.mkdir(LOG_DIR, { recursive: true });

    const logFile = `${LOG_DIR}/continuous-claude-${Date.now()}.log`;

    // Build command arguments
    const args = [
      '--prompt', prompt,
      '--max-runs', String(maxRuns || 5),
    ];

    if (repo) {
      const [repoOwner, repoName] = repo.includes('/') ? repo.split('/') : [owner, repo];
      if (repoOwner) args.push('--owner', repoOwner);
      if (repoName) args.push('--repo', repoName);
    }

    // Spawn the process
    const child = spawn('continuous-claude', args, {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });

    // Log output to file
    const logStream = await fs.open(logFile, 'w');
    child.stdout?.on('data', (data) => {
      logStream.write(data);
    });
    child.stderr?.on('data', (data) => {
      logStream.write(data);
    });

    child.on('close', async (code) => {
      await logStream.close();
      await saveState('continuous-claude', code === 0 ? 'success' : 'error', `Process exited with code ${code}`);
    });

    child.unref();

    await saveState('continuous-claude', 'running', `Started with prompt: ${prompt}`, child.pid);
    await addRun('Continuous Claude', prompt, 'running');

    return NextResponse.json({
      message: `Continuous Claude started with PID ${child.pid}`,
      pid: child.pid,
      logFile,
    });
  } catch (error) {
    console.error('Error starting Continuous Claude:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Kill any running continuous-claude processes
    try {
      await execAsync('pkill -f continuous-claude || true');
    } catch {
      // Process may not be running
    }

    await saveState('continuous-claude', 'idle', 'Stopped by user');

    return NextResponse.json({ message: 'Continuous Claude stopped' });
  } catch (error) {
    console.error('Error stopping Continuous Claude:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
