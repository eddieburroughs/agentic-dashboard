'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Server,
  FolderOpen,
  Terminal,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PathConfig {
  autoClaude: string;
  continuousClaude: string;
  automaker: string;
  acfs: string;
  defaultProject: string;
}

export default function SettingsPage() {
  const [paths, setPaths] = useState<PathConfig>({
    autoClaude: '/root/agentic-tools/Auto-Claude',
    continuousClaude: '/usr/local/bin/continuous-claude',
    automaker: '/root/agentic-tools/automaker',
    acfs: '/root/agentic-tools/agentic_coding_flywheel_setup',
    defaultProject: '/root/agentic-tools',
  });

  const [systemInfo, setSystemInfo] = useState({
    claudeVersion: '',
    nodeVersion: '',
    pythonVersion: '',
  });

  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    // Load system info
    fetch('/api/system')
      .then(res => res.json())
      .then(data => setSystemInfo(data))
      .catch(console.error);

    // Load saved paths from localStorage
    const savedPaths = localStorage.getItem('agentic-dashboard-paths');
    if (savedPaths) {
      setPaths(JSON.parse(savedPaths));
    }
  }, []);

  const savePaths = () => {
    setStatus('saving');
    localStorage.setItem('agentic-dashboard-paths', JSON.stringify(paths));
    setTimeout(() => setStatus('saved'), 500);
    setTimeout(() => setStatus('idle'), 2000);
  };

  const refreshSystemInfo = async () => {
    try {
      const res = await fetch('/api/system');
      const data = await res.json();
      setSystemInfo(data);
    } catch (e) {
      console.error('Failed to refresh system info:', e);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Settings</h1>
                <p className="text-sm text-zinc-500">Configure dashboard paths and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* System Information */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Server className="w-5 h-5 text-zinc-500" />
              System Information
            </h2>
            <button
              onClick={refreshSystemInfo}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
            <div className="p-4 flex items-center justify-between">
              <span className="text-zinc-400">Claude Code</span>
              <span className="font-mono text-sm">{systemInfo.claudeVersion || 'Loading...'}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-zinc-400">Node.js</span>
              <span className="font-mono text-sm">{systemInfo.nodeVersion || 'Loading...'}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-zinc-400">Python</span>
              <span className="font-mono text-sm">{systemInfo.pythonVersion || 'Loading...'}</span>
            </div>
          </div>
        </section>

        {/* Tool Paths */}
        <section>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-zinc-500" />
            Tool Paths
          </h2>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Auto-Claude Path
              </label>
              <input
                type="text"
                value={paths.autoClaude}
                onChange={(e) => setPaths({ ...paths, autoClaude: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Continuous Claude Path
              </label>
              <input
                type="text"
                value={paths.continuousClaude}
                onChange={(e) => setPaths({ ...paths, continuousClaude: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Automaker Path
              </label>
              <input
                type="text"
                value={paths.automaker}
                onChange={(e) => setPaths({ ...paths, automaker: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                ACFS Path
              </label>
              <input
                type="text"
                value={paths.acfs}
                onChange={(e) => setPaths({ ...paths, acfs: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Default Project Directory
              </label>
              <input
                type="text"
                value={paths.defaultProject}
                onChange={(e) => setPaths({ ...paths, defaultProject: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 text-sm font-mono"
              />
            </div>
          </div>
        </section>

        {/* SSH Access */}
        <section>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Terminal className="w-5 h-5 text-zinc-500" />
            SSH Access
          </h2>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <p className="text-sm text-zinc-400 mb-4">
              Some features require SSH access to the server:
            </p>
            <div className="space-y-3">
              <div className="bg-zinc-950 rounded-lg p-3">
                <div className="text-xs text-zinc-500 mb-1">Dashboard / Tools:</div>
                <code className="text-sm">ssh root@intelliagent.site</code>
              </div>
              <div className="bg-zinc-950 rounded-lg p-3">
                <div className="text-xs text-zinc-500 mb-1">ACFS / NTM Sessions:</div>
                <code className="text-sm">ssh ubuntu@intelliagent.site</code>
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-sm">
            {status === 'saved' && (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Settings saved</span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={savePaths}
              disabled={status === 'saving'}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium transition-all disabled:opacity-50"
            >
              {status === 'saving' ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* About */}
        <section className="pt-8 border-t border-zinc-800">
          <h2 className="text-lg font-semibold mb-4">About</h2>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="space-y-2 text-sm text-zinc-400">
              <p><strong className="text-zinc-200">Agentic Dashboard</strong> v1.0.0</p>
              <p>Unified control panel for AI-powered coding tools.</p>
              <p className="pt-2">
                <a
                  href="https://github.com/eddieburroughs/agentic-dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  View on GitHub
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
