import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const STATE_FILE = '/tmp/agentic-dashboard-state.json';
const LOG_DIR = '/tmp/agentic-logs';
const AUTO_CLAUDE_DIR = '/root/agentic-tools/Auto-Claude';

interface RunConfig {
  task: string;
  projectDir: string;
  complexity?: 'simple' | 'standard' | 'complex';
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
      name: toolKey === 'auto-claude' ? 'Auto-Claude' : toolKey,
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

    state.runs = state.runs.slice(0, 20);

    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Error adding run:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RunConfig = await request.json();
    const { task, projectDir, complexity } = body;

    if (!task) {
      return NextResponse.json({ error: 'Task description is required' }, { status: 400 });
    }

    // Ensure log directory exists
    await fs.mkdir(LOG_DIR, { recursive: true });

    const logFile = `${LOG_DIR}/auto-claude-${Date.now()}.log`;
    const backendDir = path.join(AUTO_CLAUDE_DIR, 'apps', 'backend');

    // Check if backend directory exists
    try {
      await fs.access(backendDir);
    } catch {
      return NextResponse.json({
        error: 'Auto-Claude backend not found. Run setup first.',
      }, { status: 500 });
    }

    // Build command arguments for spec_runner.py
    const args = ['spec_runner.py', '--task', task];
    if (complexity) {
      args.push('--complexity', complexity);
    }

    // Spawn the process
    const child = spawn('python', args, {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: backendDir,
      env: {
        ...process.env,
        PROJECT_DIR: projectDir || process.cwd(),
      },
    });

    // Log output to file
    const logStream = await fs.open(logFile, 'w');
    let outputBuffer = '';

    child.stdout?.on('data', (data) => {
      logStream.write(data);
      outputBuffer += data.toString();
      // Keep last 1000 chars for status
      if (outputBuffer.length > 1000) {
        outputBuffer = outputBuffer.slice(-1000);
      }
    });

    child.stderr?.on('data', (data) => {
      logStream.write(data);
      outputBuffer += data.toString();
      if (outputBuffer.length > 1000) {
        outputBuffer = outputBuffer.slice(-1000);
      }
    });

    child.on('close', async (code) => {
      await logStream.close();
      await saveState(
        'auto-claude',
        code === 0 ? 'success' : 'error',
        code === 0 ? 'Spec created successfully' : `Process exited with code ${code}`
      );
    });

    child.unref();

    await saveState('auto-claude', 'running', `Creating spec for: ${task}`, child.pid);
    await addRun('Auto-Claude', task, 'running');

    return NextResponse.json({
      message: `Auto-Claude started with PID ${child.pid}`,
      pid: child.pid,
      logFile,
    });
  } catch (error) {
    console.error('Error starting Auto-Claude:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Kill any running Auto-Claude processes
    try {
      await execAsync('pkill -f "python.*spec_runner.py" || true');
      await execAsync('pkill -f "python.*run.py" || true');
    } catch {
      // Process may not be running
    }

    await saveState('auto-claude', 'idle', 'Stopped by user');

    return NextResponse.json({ message: 'Auto-Claude stopped' });
  } catch (error) {
    console.error('Error stopping Auto-Claude:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
