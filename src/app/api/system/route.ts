import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const [claudeVersion, nodeVersion, pythonVersion] = await Promise.all([
      execAsync('claude --version 2>/dev/null || echo "not installed"').then(r => r.stdout.trim()),
      execAsync('node --version').then(r => r.stdout.trim()),
      execAsync('python3 --version').then(r => r.stdout.trim().replace('Python ', '')),
    ]);

    return NextResponse.json({
      claudeVersion,
      nodeVersion,
      pythonVersion,
    });
  } catch (error) {
    console.error('Error fetching system info:', error);
    return NextResponse.json({
      claudeVersion: 'error',
      nodeVersion: 'error',
      pythonVersion: 'error',
    });
  }
}
