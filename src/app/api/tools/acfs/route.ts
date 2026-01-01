import { NextResponse } from 'next/server';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

const STATE_FILE = '/tmp/agentic-dashboard-state.json';

interface DashboardState {
  tools: Record<string, {
    name: string;
    status: 'idle' | 'running' | 'error' | 'success';
    output: string;
    pid?: number;
  }>;
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
      tools: {},
      runs: [],
    };
  }
}

async function saveState(state: DashboardState): Promise<void> {
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

// Run command as ubuntu user with proper PATH
async function runAsUbuntu(command: string): Promise<{ stdout: string; stderr: string }> {
  const fullCommand = `sudo -u ubuntu -i bash -c 'export PATH="$HOME/.local/bin:$HOME/.bun/bin:$HOME/.cargo/bin:/usr/local/go/bin:$PATH"; ${command}'`;
  return execAsync(fullCommand, { timeout: 60000 });
}

export async function GET() {
  try {
    // Get ACFS tools status
    const tools: Record<string, { version: string; installed: boolean }> = {};

    // Check each tool
    const checks = [
      { name: 'bun', cmd: 'bun --version' },
      { name: 'cargo', cmd: 'cargo --version' },
      { name: 'go', cmd: 'go version' },
      { name: 'uv', cmd: 'uv --version' },
      { name: 'claude', cmd: 'claude --version' },
      { name: 'ntm', cmd: 'ntm --version 2>/dev/null || echo installed' },
      { name: 'bat', cmd: 'bat --version' },
      { name: 'rg', cmd: 'rg --version' },
      { name: 'fd', cmd: 'fd --version' },
    ];

    for (const check of checks) {
      try {
        const { stdout } = await runAsUbuntu(check.cmd);
        tools[check.name] = { version: stdout.trim().split('\n')[0], installed: true };
      } catch {
        tools[check.name] = { version: 'not found', installed: false };
      }
    }

    // Check for active NTM sessions
    let ntmSessions: string[] = [];
    try {
      const { stdout } = await runAsUbuntu('tmux list-sessions -F "#{session_name}" 2>/dev/null || echo ""');
      ntmSessions = stdout.trim().split('\n').filter(s => s && s !== '');
    } catch {
      // No sessions
    }

    return NextResponse.json({
      tools,
      ntmSessions,
      acfsVersion: '0.1.0',
    });
  } catch (error) {
    console.error('Error fetching ACFS status:', error);
    return NextResponse.json({ error: 'Failed to fetch ACFS status' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, sessionName, agents } = body;

    const state = await loadState();

    switch (action) {
      case 'doctor': {
        // Run acfs doctor
        try {
          const { stdout, stderr } = await runAsUbuntu('acfs doctor 2>&1');
          return NextResponse.json({
            success: true,
            output: stdout || stderr,
            message: 'ACFS doctor completed'
          });
        } catch (error: unknown) {
          const execError = error as { stdout?: string; stderr?: string };
          return NextResponse.json({
            success: false,
            output: execError.stdout || execError.stderr || 'Unknown error',
            error: 'Doctor check failed'
          });
        }
      }

      case 'ntm-spawn': {
        // Spawn a new NTM session
        const name = sessionName || `session-${Date.now()}`;
        const ccCount = agents?.claude || 1;
        const codCount = agents?.codex || 0;

        try {
          // Create project directory first
          await runAsUbuntu(`mkdir -p /data/projects/${name}`);

          // Build command - only add --cod if count > 0
          let cmd = `ntm spawn ${name} --cc=${ccCount}`;
          if (codCount > 0) {
            cmd += ` --cod=${codCount}`;
          }

          const { stdout } = await runAsUbuntu(cmd);

          state.tools['acfs'] = {
            name: 'ACFS',
            status: 'running',
            output: `NTM session "${name}" spawned`,
          };
          await saveState(state);

          return NextResponse.json({
            success: true,
            message: `NTM session "${name}" created`,
            output: stdout,
            sessionName: name
          });
        } catch (error: unknown) {
          const execError = error as { message?: string };
          return NextResponse.json({
            success: false,
            error: execError.message || 'Failed to spawn NTM session'
          });
        }
      }

      case 'ntm-attach': {
        // Return attach command (can't actually attach from web)
        return NextResponse.json({
          success: true,
          message: `To attach, run: ssh ubuntu@intelliagent.site -t "tmux attach -t ${sessionName}"`,
          command: `tmux attach -t ${sessionName}`
        });
      }

      case 'ntm-kill': {
        try {
          await runAsUbuntu(`tmux kill-session -t ${sessionName}`);
          return NextResponse.json({
            success: true,
            message: `Session "${sessionName}" killed`
          });
        } catch (error: unknown) {
          const execError = error as { message?: string };
          return NextResponse.json({
            success: false,
            error: execError.message || 'Failed to kill session'
          });
        }
      }

      case 'onboard': {
        // Show onboard info
        try {
          const { stdout } = await runAsUbuntu('cat ~/.acfs/onboard/00_welcome.md 2>/dev/null || echo "Run: ssh ubuntu@intelliagent.site then: onboard"');
          return NextResponse.json({
            success: true,
            output: stdout,
            message: 'To run onboard interactively: ssh ubuntu@intelliagent.site then run "onboard"'
          });
        } catch {
          return NextResponse.json({
            success: true,
            message: 'To run onboard: ssh ubuntu@intelliagent.site then run "onboard"'
          });
        }
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in ACFS action:', error);
    return NextResponse.json({ error: 'Failed to execute ACFS action' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionName = searchParams.get('session');

    if (sessionName) {
      await runAsUbuntu(`tmux kill-session -t ${sessionName}`);
      return NextResponse.json({ message: `Session "${sessionName}" killed` });
    }

    return NextResponse.json({ error: 'No session specified' }, { status: 400 });
  } catch (error) {
    console.error('Error killing session:', error);
    return NextResponse.json({ error: 'Failed to kill session' }, { status: 500 });
  }
}
