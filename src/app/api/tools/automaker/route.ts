import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs/promises';

const STATE_FILE = '/tmp/agentic-dashboard-state.json';
const LOG_DIR = '/tmp/agentic-logs';
const AUTOMAKER_DIR = '/root/agentic-tools/automaker';

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
      name: 'Automaker',
      status,
      output,
      pid,
    };

    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action !== 'start') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Ensure log directory exists
    await fs.mkdir(LOG_DIR, { recursive: true });

    const logFile = `${LOG_DIR}/automaker-${Date.now()}.log`;

    // Check if Automaker is already running
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync('pgrep -f "automaker.*dev:web" || echo ""');
      if (stdout.trim()) {
        return NextResponse.json({
          message: 'Automaker is already running',
          pid: parseInt(stdout.trim().split('\n')[0]),
        });
      }
    } catch {
      // Not running
    }

    // Spawn the Automaker dev server
    const child = spawn('npm', ['run', 'dev:web'], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: AUTOMAKER_DIR,
      env: {
        ...process.env,
        PORT: '3007',
      },
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
      await saveState('automaker', 'idle', `Process exited with code ${code}`);
    });

    child.unref();

    await saveState('automaker', 'running', 'Server starting on http://localhost:3007', child.pid);

    return NextResponse.json({
      message: 'Automaker started on http://localhost:3007',
      pid: child.pid,
      logFile,
      url: 'http://localhost:3007',
    });
  } catch (error) {
    console.error('Error starting Automaker:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Kill any running Automaker processes
    try {
      await execAsync('pkill -f "automaker.*dev" || true');
      await execAsync('pkill -f "npm.*run.*dev.*automaker" || true');
      // Also kill any node processes on port 3007
      await execAsync('lsof -ti:3007 | xargs kill -9 2>/dev/null || true');
    } catch {
      // Process may not be running
    }

    await saveState('automaker', 'idle', 'Stopped by user');

    return NextResponse.json({ message: 'Automaker stopped' });
  } catch (error) {
    console.error('Error stopping Automaker:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
