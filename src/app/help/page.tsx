'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Terminal,
  GitBranch,
  Cpu,
  Layers,
  Wrench,
  Zap,
  BookOpen,
  ExternalLink,
  Command,
  Monitor,
  Server,
  HelpCircle,
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Help & Documentation</h1>
                  <p className="text-sm text-zinc-500">Complete guide to the Agentic Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Quick Start
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="font-semibold mb-2">1. Access Dashboard</h3>
              <p className="text-sm text-zinc-400">
                Open <code className="bg-zinc-800 px-2 py-0.5 rounded">https://intelliagent.site</code>
              </p>
            </div>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="font-semibold mb-2">2. Choose a Tool</h3>
              <p className="text-sm text-zinc-400">
                Each card controls a different AI coding tool. Click to expand.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="font-semibold mb-2">3. Configure & Run</h3>
              <p className="text-sm text-zinc-400">
                Fill in the prompts/settings and click the action button.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="font-semibold mb-2">4. Monitor Output</h3>
              <p className="text-sm text-zinc-400">
                Watch progress in the output panel. Stop anytime if needed.
              </p>
            </div>
          </div>
        </section>

        {/* Tools Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Command className="w-6 h-6 text-blue-500" />
            The 4 Tools
          </h2>

          {/* Continuous Claude */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Continuous Claude</h3>
                <p className="text-sm text-zinc-500">PR Loop Automation</p>
              </div>
            </div>
            <p className="text-zinc-400 mb-4">
              Runs Claude Code in a loop to iteratively improve your codebase. Each run creates commits or PRs until the task is complete.
            </p>
            <div className="bg-zinc-950 rounded-lg p-4 mb-4">
              <div className="text-xs text-zinc-500 mb-2">Example Prompts:</div>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>&bull; &quot;add unit tests until coverage reaches 80%&quot;</li>
                <li>&bull; &quot;fix all ESLint errors and warnings&quot;</li>
                <li>&bull; &quot;add TypeScript types to all JavaScript files&quot;</li>
                <li>&bull; &quot;update dependencies to latest stable versions&quot;</li>
              </ul>
            </div>
            <div className="text-sm text-zinc-500">
              <strong>Best for:</strong> Incremental improvements, test coverage, lint fixes, dependency updates
            </div>
          </div>

          {/* Auto-Claude */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Auto-Claude</h3>
                <p className="text-sm text-zinc-500">Multi-Agent Framework</p>
              </div>
            </div>
            <p className="text-zinc-400 mb-4">
              Uses multiple AI agents (Planner, Coder, QA Reviewer, QA Fixer) to build features from specifications with human review checkpoints.
            </p>
            <div className="bg-zinc-950 rounded-lg p-4 mb-4">
              <div className="text-xs text-zinc-500 mb-2">The Phases:</div>
              <ol className="text-sm text-zinc-300 space-y-1 list-decimal list-inside">
                <li>Project Discovery - Scans codebase</li>
                <li>Requirements Gathering - Understands needs</li>
                <li>Complexity Assessment - SIMPLE/MEDIUM/COMPLEX</li>
                <li>Quick Spec - Creates detailed specification</li>
                <li>Validation - Verifies completeness</li>
                <li>Human Review - Waits for approval</li>
              </ol>
            </div>
            <div className="text-sm text-zinc-500">
              <strong>Best for:</strong> New features, major refactoring, complex implementations
            </div>
          </div>

          {/* Automaker */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Automaker</h3>
                <p className="text-sm text-zinc-500">Visual Kanban Agent Studio</p>
              </div>
            </div>
            <p className="text-zinc-400 mb-4">
              Provides a visual Kanban-style interface for managing AI agent tasks. Great for organizing multiple tasks and tracking progress.
            </p>
            <div className="bg-zinc-950 rounded-lg p-4 mb-4">
              <div className="text-xs text-zinc-500 mb-2">How to Access:</div>
              <ol className="text-sm text-zinc-300 space-y-1 list-decimal list-inside">
                <li>Click &quot;Start Server&quot; in the Automaker card</li>
                <li>Click &quot;Open UI&quot; or use SSH tunnel:</li>
              </ol>
              <code className="block mt-2 text-xs bg-zinc-800 p-2 rounded">
                ssh -L 3007:localhost:3007 root@intelliagent.site
              </code>
            </div>
            <div className="text-sm text-zinc-500">
              <strong>Best for:</strong> Visual task management, parallel workflows
            </div>
          </div>

          {/* ACFS */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">ACFS</h3>
                <p className="text-sm text-zinc-500">Agentic Coding Flywheel Setup</p>
              </div>
            </div>
            <p className="text-zinc-400 mb-4">
              Environment management showing installed tools, active NTM sessions, and system health checks.
            </p>
            <div className="bg-zinc-950 rounded-lg p-4 mb-4">
              <div className="text-xs text-zinc-500 mb-2">Installed Tools:</div>
              <div className="grid grid-cols-3 gap-2 text-sm text-zinc-300">
                <span>bun</span><span>cargo</span><span>go</span>
                <span>uv</span><span>claude</span><span>ntm</span>
                <span>bat</span><span>rg</span><span>fd</span>
              </div>
            </div>
            <div className="text-sm text-zinc-500">
              <strong>Best for:</strong> System health, NTM sessions, tool verification
            </div>
          </div>
        </section>

        {/* SSH Commands */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-green-500" />
            SSH Commands
          </h2>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-zinc-500 mb-1">Connect to server:</div>
                <code className="block bg-zinc-950 p-3 rounded-lg text-sm">
                  ssh root@intelliagent.site
                </code>
              </div>
              <div>
                <div className="text-sm text-zinc-500 mb-1">Connect as ubuntu (for ACFS):</div>
                <code className="block bg-zinc-950 p-3 rounded-lg text-sm">
                  ssh ubuntu@intelliagent.site
                </code>
              </div>
              <div>
                <div className="text-sm text-zinc-500 mb-1">Spawn NTM multi-agent session:</div>
                <code className="block bg-zinc-950 p-3 rounded-lg text-sm">
                  ntm spawn myproject --cc=2 --cod=1<br />
                  ntm attach myproject
                </code>
              </div>
              <div>
                <div className="text-sm text-zinc-500 mb-1">Check system health:</div>
                <code className="block bg-zinc-950 p-3 rounded-lg text-sm">
                  acfs doctor
                </code>
              </div>
              <div>
                <div className="text-sm text-zinc-500 mb-1">Quick agent shortcuts:</div>
                <code className="block bg-zinc-950 p-3 rounded-lg text-sm">
                  cc   # Claude Code<br />
                  cod  # Codex CLI<br />
                  gmi  # Gemini CLI
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* Workflows */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Monitor className="w-6 h-6 text-purple-500" />
            Common Workflows
          </h2>
          <div className="space-y-4">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="font-semibold mb-2">Add Unit Tests</h3>
              <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
                <li>Open Continuous Claude card</li>
                <li>Prompt: &quot;add unit tests until coverage reaches 80%&quot;</li>
                <li>Set max runs: 15</li>
                <li>Click &quot;Start Loop&quot;</li>
              </ol>
            </div>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="font-semibold mb-2">Build a New Feature</h3>
              <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
                <li>Open Auto-Claude card</li>
                <li>Describe feature: &quot;Add user settings page with theme toggle&quot;</li>
                <li>Click &quot;Create Spec&quot;</li>
                <li>Review spec via SSH, then run implementation</li>
              </ol>
            </div>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="font-semibold mb-2">Multi-Agent Development</h3>
              <ol className="text-sm text-zinc-400 space-y-1 list-decimal list-inside">
                <li>SSH: <code className="bg-zinc-800 px-1 rounded">ssh ubuntu@intelliagent.site</code></li>
                <li>Spawn: <code className="bg-zinc-800 px-1 rounded">ntm spawn myproject --cc=2</code></li>
                <li>Attach: <code className="bg-zinc-800 px-1 rounded">ntm attach myproject</code></li>
                <li>Work with multiple AI agents in tmux panes</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-red-500" />
            Troubleshooting
          </h2>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-zinc-200">Dashboard not loading?</h4>
                <code className="block bg-zinc-950 p-2 rounded text-xs mt-1">
                  ssh root@intelliagent.site<br />
                  pm2 restart agentic-dashboard<br />
                  pm2 logs agentic-dashboard
                </code>
              </div>
              <div>
                <h4 className="font-medium text-zinc-200">Tool shows error?</h4>
                <p className="text-sm text-zinc-400">Check the output panel in the card for error details.</p>
              </div>
              <div>
                <h4 className="font-medium text-zinc-200">ACFS Doctor shows failures?</h4>
                <p className="text-sm text-zinc-400">Run the suggested fix commands, then re-run doctor.</p>
              </div>
              <div>
                <h4 className="font-medium text-zinc-200">NTM session won&apos;t spawn?</h4>
                <code className="block bg-zinc-950 p-2 rounded text-xs mt-1">
                  mkdir -p /data/projects/myproject<br />
                  ntm spawn myproject --cc=1
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* External Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Server className="w-6 h-6 text-zinc-500" />
            Resources
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="https://github.com/AndyMik90/Auto-Claude"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-zinc-500" />
              <span>Auto-Claude GitHub</span>
            </a>
            <a
              href="https://github.com/AnandChowdhary/continuous-claude"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-zinc-500" />
              <span>Continuous Claude GitHub</span>
            </a>
            <a
              href="https://github.com/AutoMaker-Org/automaker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-zinc-500" />
              <span>Automaker GitHub</span>
            </a>
            <a
              href="https://github.com/Dicklesworthstone/agentic_coding_flywheel_setup"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-zinc-500" />
              <span>ACFS GitHub</span>
            </a>
          </div>
        </section>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center text-sm text-zinc-500">
            Agentic Dashboard v1.0.0 - All tools working together
          </div>
        </div>
      </footer>
    </div>
  );
}
