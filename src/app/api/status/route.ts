import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const STATE_FILE = '/tmp/agentic-dashboard-state.json';

interface ToolState {
  name: string;
  status: 'idle' | 'running' | 'error' | 'success';
  output: string;
  pid?: number;
}

interface DashboardState {
  tools: Record<string, ToolState>;
  runs: Array<{
    id: string;
    tool: string;
    prompt: string;
    status: 'running' | 'completed' | 'failed';
    startedAt: string;
    output: string;
  }>;
}

async function loadState(): Promise<DashboardState> {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      tools: {
        'auto-claude': { name: 'Auto-Claude', status: 'idle', output: '' },
        'continuous-claude': { name: 'Continuous Claude', status: 'idle', output: '' },
        'automaker': { name: 'Automaker', status: 'idle', output: '' },
      },
      runs: [],
    };
  }
}

async function checkProcessRunning(pid: number): Promise<boolean> {
  try {
    await execAsync(`kill -0 ${pid} 2>/dev/null`);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const state = await loadState();

    // Check if any running processes are still alive
    for (const [key, tool] of Object.entries(state.tools)) {
      if (tool.status === 'running' && tool.pid) {
        const isRunning = await checkProcessRunning(tool.pid);
        if (!isRunning) {
          state.tools[key] = { ...tool, status: 'idle', output: 'Process completed' };
        }
      }
    }

    // Check if Automaker server is running
    try {
      const { stdout } = await execAsync('pgrep -f "automaker.*dev:web" || pgrep -f "npm.*dev:web.*automaker" || echo ""');
      if (stdout.trim()) {
        state.tools['automaker'] = {
          ...state.tools['automaker'],
          status: 'running',
          pid: parseInt(stdout.trim().split('\n')[0]),
        };
      }
    } catch {
      // Not running
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
