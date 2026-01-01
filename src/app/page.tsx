'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Play,
  Square,
  Terminal,
  GitBranch,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Cpu,
  Zap,
  Layers,
  Settings,
  ChevronDown,
  ChevronUp,
  Wrench,
  Box,
  Stethoscope,
  Plus,
  Trash2,
  HelpCircle,
} from 'lucide-react';

interface ToolStatus {
  name: string;
  status: 'idle' | 'running' | 'error' | 'success';
  output: string;
  pid?: number;
}

interface AgentRun {
  id: string;
  tool: string;
  prompt: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  output: string;
}

export default function Dashboard() {
  const [tools, setTools] = useState<Record<string, ToolStatus>>({
    'auto-claude': { name: 'Auto-Claude', status: 'idle', output: '' },
    'continuous-claude': { name: 'Continuous Claude', status: 'idle', output: '' },
    'automaker': { name: 'Automaker', status: 'idle', output: '' },
    'acfs': { name: 'ACFS', status: 'idle', output: '' },
  });

  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'auto-claude': true,
    'continuous-claude': true,
    'automaker': true,
    'acfs': true,
  });

  // ACFS specific state
  const [acfsTools, setAcfsTools] = useState<Record<string, { version: string; installed: boolean }>>({});
  const [ntmSessions, setNtmSessions] = useState<string[]>([]);
  const [ntmSessionName, setNtmSessionName] = useState('');
  const [ntmClaudeCount, setNtmClaudeCount] = useState('1');
  const [ntmCodexCount, setNtmCodexCount] = useState('0');
  const [acfsOutput, setAcfsOutput] = useState('');

  // Form states
  const [ccPrompt, setCcPrompt] = useState('add unit tests until coverage reaches 80%');
  const [ccMaxRuns, setCcMaxRuns] = useState('5');
  const [ccRepo, setCcRepo] = useState('');

  const [acTask, setAcTask] = useState('');
  const [acProject, setAcProject] = useState('/root/agentic-tools');

  const [systemInfo, setSystemInfo] = useState({
    claudeVersion: '',
    nodeVersion: '',
    pythonVersion: '',
  });

  const fetchSystemInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/system');
      const data = await res.json();
      setSystemInfo(data);
    } catch (e) {
      console.error('Failed to fetch system info:', e);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data.tools) {
        setTools(prev => ({
          ...prev,
          ...data.tools,
        }));
      }
      if (data.runs) {
        setRuns(data.runs);
      }
    } catch (e) {
      console.error('Failed to fetch status:', e);
    }
  }, []);

  const fetchAcfsStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/tools/acfs');
      const data = await res.json();
      if (data.tools) {
        setAcfsTools(data.tools);
      }
      if (data.ntmSessions) {
        setNtmSessions(data.ntmSessions);
      }
    } catch (e) {
      console.error('Failed to fetch ACFS status:', e);
    }
  }, []);

  useEffect(() => {
    fetchSystemInfo();
    fetchStatus();
    fetchAcfsStatus();
    const interval = setInterval(() => {
      fetchStatus();
      fetchAcfsStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchSystemInfo, fetchStatus, fetchAcfsStatus]);

  const runAcfsDoctor = async () => {
    setAcfsOutput('Running ACFS doctor...');
    try {
      const res = await fetch('/api/tools/acfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'doctor' }),
      });
      const data = await res.json();
      setAcfsOutput(data.output || data.message || 'Doctor complete');
    } catch (e) {
      setAcfsOutput('Failed to run doctor');
      console.error(e);
    }
  };

  const spawnNtmSession = async () => {
    const name = ntmSessionName || `session-${Date.now()}`;
    setAcfsOutput(`Spawning NTM session "${name}"...`);
    try {
      const res = await fetch('/api/tools/acfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ntm-spawn',
          sessionName: name,
          agents: {
            claude: parseInt(ntmClaudeCount),
            codex: parseInt(ntmCodexCount),
          },
        }),
      });
      const data = await res.json();
      setAcfsOutput(data.output || data.message || 'Session spawned');
      setNtmSessionName('');
      fetchAcfsStatus();
    } catch (e) {
      setAcfsOutput('Failed to spawn session');
      console.error(e);
    }
  };

  const killNtmSession = async (sessionName: string) => {
    try {
      const res = await fetch('/api/tools/acfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ntm-kill', sessionName }),
      });
      const data = await res.json();
      setAcfsOutput(data.message || 'Session killed');
      fetchAcfsStatus();
    } catch (e) {
      setAcfsOutput('Failed to kill session');
      console.error(e);
    }
  };

  const startContinuousClaude = async () => {
    try {
      setTools(prev => ({
        ...prev,
        'continuous-claude': { ...prev['continuous-claude'], status: 'running', output: 'Starting...' },
      }));

      const res = await fetch('/api/tools/continuous-claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: ccPrompt,
          maxRuns: parseInt(ccMaxRuns),
          repo: ccRepo || undefined,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setTools(prev => ({
          ...prev,
          'continuous-claude': { ...prev['continuous-claude'], status: 'error', output: data.error },
        }));
      } else {
        setTools(prev => ({
          ...prev,
          'continuous-claude': { ...prev['continuous-claude'], status: 'running', output: data.message, pid: data.pid },
        }));
      }
    } catch (e) {
      console.error('Failed to start Continuous Claude:', e);
    }
  };

  const startAutoClaude = async () => {
    try {
      setTools(prev => ({
        ...prev,
        'auto-claude': { ...prev['auto-claude'], status: 'running', output: 'Starting...' },
      }));

      const res = await fetch('/api/tools/auto-claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: acTask,
          projectDir: acProject,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setTools(prev => ({
          ...prev,
          'auto-claude': { ...prev['auto-claude'], status: 'error', output: data.error },
        }));
      } else {
        setTools(prev => ({
          ...prev,
          'auto-claude': { ...prev['auto-claude'], status: 'running', output: data.message },
        }));
      }
    } catch (e) {
      console.error('Failed to start Auto-Claude:', e);
    }
  };

  const startAutomaker = async () => {
    try {
      setTools(prev => ({
        ...prev,
        'automaker': { ...prev['automaker'], status: 'running', output: 'Starting Automaker server...' },
      }));

      const res = await fetch('/api/tools/automaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      const data = await res.json();
      setTools(prev => ({
        ...prev,
        'automaker': {
          ...prev['automaker'],
          status: data.error ? 'error' : 'running',
          output: data.error || data.message,
          pid: data.pid,
        },
      }));
    } catch (e) {
      console.error('Failed to start Automaker:', e);
    }
  };

  const stopTool = async (tool: string) => {
    try {
      const res = await fetch(`/api/tools/${tool}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      setTools(prev => ({
        ...prev,
        [tool]: { ...prev[tool], status: 'idle', output: data.message || 'Stopped' },
      }));
    } catch (e) {
      console.error(`Failed to stop ${tool}:`, e);
    }
  };

  const toggleCard = (key: string) => {
    setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      idle: 'bg-zinc-700 text-zinc-300',
      running: 'bg-emerald-900 text-emerald-300',
      error: 'bg-red-900 text-red-300',
      success: 'bg-blue-900 text-blue-300',
    };
    const icons = {
      idle: null,
      running: <Loader2 className="w-3 h-3 animate-spin" />,
      error: <XCircle className="w-3 h-3" />,
      success: <CheckCircle2 className="w-3 h-3" />,
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Agentic Dashboard</h1>
                <p className="text-sm text-zinc-500">Unified AI Coding Tools Control Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchStatus}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <Link
                href="/help"
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Help"
              >
                <HelpCircle className="w-5 h-5" />
              </Link>
              <Link
                href="/settings"
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* System Info Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Claude Code: <span className="text-zinc-300">{systemInfo.claudeVersion || 'checking...'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Node: <span className="text-zinc-300">{systemInfo.nodeVersion || 'checking...'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Python: <span className="text-zinc-300">{systemInfo.pythonVersion || 'checking...'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Continuous Claude Card */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <div
              className="p-5 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors"
              onClick={() => toggleCard('continuous-claude')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Continuous Claude</h2>
                    <p className="text-sm text-zinc-500">PR Loop Automation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={tools['continuous-claude'].status} />
                  {expandedCards['continuous-claude'] ? (
                    <ChevronUp className="w-5 h-5 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-500" />
                  )}
                </div>
              </div>
            </div>

            {expandedCards['continuous-claude'] && (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Task Prompt</label>
                  <textarea
                    value={ccPrompt}
                    onChange={(e) => setCcPrompt(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm resize-none"
                    rows={3}
                    placeholder="Describe the task for Claude..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Max Runs</label>
                    <input
                      type="number"
                      value={ccMaxRuns}
                      onChange={(e) => setCcMaxRuns(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Repository (optional)</label>
                    <input
                      type="text"
                      value={ccRepo}
                      onChange={(e) => setCcRepo(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
                      placeholder="owner/repo"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  {tools['continuous-claude'].status !== 'running' ? (
                    <button
                      onClick={startContinuousClaude}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium transition-all"
                    >
                      <Play className="w-4 h-4" />
                      Start Loop
                    </button>
                  ) : (
                    <button
                      onClick={() => stopTool('continuous-claude')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-all"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </button>
                  )}
                </div>

                {tools['continuous-claude'].output && (
                  <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-xs font-medium text-zinc-500 mb-2">Output</div>
                    <div className="terminal-output text-zinc-300 max-h-40 overflow-y-auto">
                      {tools['continuous-claude'].output}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auto-Claude Card */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <div
              className="p-5 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors"
              onClick={() => toggleCard('auto-claude')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Auto-Claude</h2>
                    <p className="text-sm text-zinc-500">Multi-Agent Framework</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={tools['auto-claude'].status} />
                  {expandedCards['auto-claude'] ? (
                    <ChevronUp className="w-5 h-5 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-500" />
                  )}
                </div>
              </div>
            </div>

            {expandedCards['auto-claude'] && (
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Task Description</label>
                  <textarea
                    value={acTask}
                    onChange={(e) => setAcTask(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm resize-none"
                    rows={3}
                    placeholder="Describe the feature to build..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Project Directory</label>
                  <input
                    type="text"
                    value={acProject}
                    onChange={(e) => setAcProject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                    placeholder="/path/to/project"
                  />
                </div>

                <div className="flex gap-3">
                  {tools['auto-claude'].status !== 'running' ? (
                    <button
                      onClick={startAutoClaude}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white font-medium transition-all"
                    >
                      <Play className="w-4 h-4" />
                      Create Spec
                    </button>
                  ) : (
                    <button
                      onClick={() => stopTool('auto-claude')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-all"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </button>
                  )}
                </div>

                {tools['auto-claude'].output && (
                  <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-xs font-medium text-zinc-500 mb-2">Output</div>
                    <div className="terminal-output text-zinc-300 max-h-40 overflow-y-auto">
                      {tools['auto-claude'].output}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Automaker Card */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <div
              className="p-5 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors"
              onClick={() => toggleCard('automaker')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Automaker</h2>
                    <p className="text-sm text-zinc-500">Visual Kanban Agent Studio</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={tools['automaker'].status} />
                  {expandedCards['automaker'] ? (
                    <ChevronUp className="w-5 h-5 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-500" />
                  )}
                </div>
              </div>
            </div>

            {expandedCards['automaker'] && (
              <div className="p-5 space-y-4">
                <p className="text-sm text-zinc-400">
                  Automaker provides a visual Kanban board interface for managing AI agent tasks.
                </p>

                <div className="flex gap-3">
                  {tools['automaker'].status !== 'running' ? (
                    <button
                      onClick={startAutomaker}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-medium transition-all"
                    >
                      <Play className="w-4 h-4" />
                      Start Server
                    </button>
                  ) : (
                    <button
                      onClick={() => stopTool('automaker')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-all"
                    >
                      <Square className="w-4 h-4" />
                      Stop Server
                    </button>
                  )}
                </div>

                {tools['automaker'].status === 'running' && (
                  <a
                    href="https://maker.intelliagent.site"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 font-medium transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Automaker UI
                  </a>
                )}

                {tools['automaker'].output && (
                  <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-xs font-medium text-zinc-500 mb-2">Output</div>
                    <div className="terminal-output text-zinc-300 max-h-40 overflow-y-auto">
                      {tools['automaker'].output}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACFS Card */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <div
              className="p-5 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors"
              onClick={() => toggleCard('acfs')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">ACFS</h2>
                    <p className="text-sm text-zinc-500">Agentic Coding Flywheel Setup</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">{Object.values(acfsTools).filter(t => t.installed).length} tools</span>
                  {expandedCards['acfs'] ? (
                    <ChevronUp className="w-5 h-5 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-500" />
                  )}
                </div>
              </div>
            </div>

            {expandedCards['acfs'] && (
              <div className="p-5 space-y-4">
                {/* Installed Tools Grid */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Installed Tools</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(acfsTools).map(([name, info]) => (
                      <div
                        key={name}
                        className={`px-3 py-2 rounded-lg text-xs ${
                          info.installed
                            ? 'bg-emerald-900/30 border border-emerald-800 text-emerald-300'
                            : 'bg-zinc-800 border border-zinc-700 text-zinc-500'
                        }`}
                      >
                        <div className="font-medium">{name}</div>
                        <div className="truncate opacity-70">{info.version}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NTM Sessions */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    NTM Sessions ({ntmSessions.length})
                  </label>
                  {ntmSessions.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {ntmSessions.map((session) => (
                        <div
                          key={session}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700"
                        >
                          <div className="flex items-center gap-2">
                            <Box className="w-4 h-4 text-pink-400" />
                            <span className="text-sm font-medium">{session}</span>
                          </div>
                          <button
                            onClick={() => killNtmSession(session)}
                            className="p-1.5 rounded-lg hover:bg-red-900/50 text-zinc-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 mb-3">No active sessions</p>
                  )}

                  {/* Spawn New Session */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <input
                      type="text"
                      value={ntmSessionName}
                      onChange={(e) => setNtmSessionName(e.target.value)}
                      className="col-span-3 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm"
                      placeholder="Session name (optional)"
                    />
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Claude</label>
                      <input
                        type="number"
                        value={ntmClaudeCount}
                        onChange={(e) => setNtmClaudeCount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm"
                        min="0"
                        max="4"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Codex</label>
                      <input
                        type="number"
                        value={ntmCodexCount}
                        onChange={(e) => setNtmCodexCount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm"
                        min="0"
                        max="4"
                      />
                    </div>
                    <button
                      onClick={spawnNtmSession}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-sm font-medium mt-5"
                    >
                      <Plus className="w-4 h-4" />
                      Spawn
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={runAcfsDoctor}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium transition-all"
                  >
                    <Stethoscope className="w-4 h-4" />
                    Run Doctor
                  </button>
                </div>

                {/* Output */}
                {acfsOutput && (
                  <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-xs font-medium text-zinc-500 mb-2">Output</div>
                    <pre className="text-xs text-zinc-300 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
                      {acfsOutput}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="p-5 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Quick Actions</h2>
                  <p className="text-sm text-zinc-500">Common workflows</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <button
                onClick={() => {
                  setCcPrompt('add comprehensive unit tests to increase coverage to 80%');
                  setCcMaxRuns('10');
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
              >
                <div className="font-medium text-sm">Add Unit Tests</div>
                <div className="text-xs text-zinc-500 mt-1">Run Continuous Claude to add tests</div>
              </button>

              <button
                onClick={() => {
                  setAcTask('Refactor the codebase to follow clean architecture principles');
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
              >
                <div className="font-medium text-sm">Refactor Codebase</div>
                <div className="text-xs text-zinc-500 mt-1">Use Auto-Claude for architecture improvements</div>
              </button>

              <button
                onClick={() => {
                  setCcPrompt('fix all ESLint errors and warnings');
                  setCcMaxRuns('5');
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
              >
                <div className="font-medium text-sm">Fix Lint Issues</div>
                <div className="text-xs text-zinc-500 mt-1">Auto-fix code style issues</div>
              </button>

              <button
                onClick={() => {
                  setCcPrompt('update dependencies to latest stable versions and fix breaking changes');
                  setCcMaxRuns('15');
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
              >
                <div className="font-medium text-sm">Update Dependencies</div>
                <div className="text-xs text-zinc-500 mt-1">Upgrade packages with auto-fixing</div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Runs */}
        {runs.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Recent Runs</h2>
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="divide-y divide-zinc-800">
                {runs.map((run) => (
                  <div key={run.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <StatusBadge status={run.status} />
                      <div>
                        <div className="font-medium text-sm">{run.tool}</div>
                        <div className="text-xs text-zinc-500 truncate max-w-md">{run.prompt}</div>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {new Date(run.startedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <div>Agentic Dashboard v1.0.0</div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/AndyMik90/Auto-Claude" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
                Auto-Claude
              </a>
              <a href="https://github.com/AnandChowdhary/continuous-claude" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
                Continuous Claude
              </a>
              <a href="https://github.com/AutoMaker-Org/automaker" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
                Automaker
              </a>
              <a href="https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
                ACFS
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
