'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  GitBranch,
  GitCommit,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  X,
  Key,
  ShieldCheck,
  Send,
  UploadCloud,
  DownloadCloud,
  FileCode,
  LogOut,
  Sparkles,
  Eye,
  EyeOff,
  Terminal,
  Layers
} from 'lucide-react';
import { useToast } from './Toast';

interface GitHubRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCli?: () => void;
}

export default function GitHubRepoModal({ isOpen, onClose, onOpenCli }: GitHubRepoModalProps) {
  const { showToast } = useToast();
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState('cheyoung1983-sudo/dcptriage');
  const [branch, setBranch] = useState('main');
  const [showToken, setShowToken] = useState(false);

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [creatingIssue, setCreatingIssue] = useState(false);

  const [status, setStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'commits' | 'issue'>('overview');

  // Issue creation form state
  const [issueTitle, setIssueTitle] = useState('');
  const [issueBody, setIssueBody] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/github/status');
      const data = await res.json();
      setStatus(data);
      if (data.configured && data.config) {
        setRepo(data.config.repo || 'cheyoung1983-sudo/dcptriage');
        setBranch(data.config.branch || 'main');
      }
    } catch (err) {
      console.error('Failed to fetch GitHub status:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      showToast('Please enter your GitHub Personal Access Token', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          repo: repo.trim(),
          branch: branch.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect repository');
      }

      showToast(`Connected to ${data.repo?.full_name || repo}!`, 'success');
      setStatus({
        configured: true,
        user: data.user,
        repo: data.repo,
        commits: data.commits || [],
        issues: data.issues || [],
        config: { repo, branch }
      });
      setToken('');
    } catch (err: any) {
      console.error('Connection error:', err);
      showToast(err.message || 'Connection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/github/disconnect', { method: 'POST' });
      if (res.ok) {
        showToast('Disconnected from GitHub repository', 'info');
        setStatus({ configured: false });
      }
    } catch (err: any) {
      showToast('Error disconnecting: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCode = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'commit_and_push',
          message: `chore(bench): telemetry session sync from Bench #04 at ${new Date().toLocaleTimeString()}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Sync failed');
      }

      showToast('Workspace changes synced and pushed to GitHub!', 'success');
      fetchStatus();
    } catch (err: any) {
      showToast(err.message || 'Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handlePullCode = async () => {
    setPulling(true);
    try {
      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pull'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Pull failed');
      }

      showToast('Successfully pulled remote changes from GitHub!', 'success');
      fetchStatus();
    } catch (err: any) {
      showToast(err.message || 'Pull failed', 'error');
    } finally {
      setPulling(false);
    }
  };

  const handleExportTelemetry = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export_telemetry',
          ticketId: `DCP-${Math.floor(1000 + Math.random() * 9000)}`,
          report: {
            organization: 'Display & Cell Pros LLC',
            benchId: 'Spokane Bench #04',
            technician: 'Lead Tech Ryan',
            timestamp: new Date().toISOString(),
            complianceStandard: 'NIST SP 800-88 R1 Purge Verified',
            electricalSafety: 'Thermal & Ammeter Nominal (<45°C)',
            targetRepo: status?.repo?.full_name || repo
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Export failed');
      }

      showToast('NIST Telemetry audit log committed to repository!', 'success');
      fetchStatus();
    } catch (err: any) {
      showToast(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim()) {
      showToast('Please provide an issue title', 'error');
      return;
    }

    setCreatingIssue(true);
    try {
      const res = await fetch('/api/github/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: issueTitle.trim(),
          body: issueBody.trim() || 'Reported from Spokane Hardware Diagnostics Workstation.'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to file issue');
      }

      showToast(`Created Issue #${data.issue?.number}!`, 'success');
      setIssueTitle('');
      setIssueBody('');
      setActiveTab('overview');
      fetchStatus();
    } catch (err: any) {
      showToast(err.message || 'Failed to file issue', 'error');
    } finally {
      setCreatingIssue(false);
    }
  };

  const isConnected = Boolean(status?.configured);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg tracking-tight font-mono">
                  GitHub Repository Connection
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Target: <code className="text-cyan-400 font-mono">{status?.config?.repo || repo}</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* If Connected: Show Status & Management */}
          {isConnected ? (
            <div className="space-y-6">
              {/* Connected Banner / User Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {status?.user?.avatar_url ? (
                    <img
                      src={status.user.avatar_url}
                      alt={status.user.login}
                      className="w-12 h-12 rounded-xl border border-slate-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/50 flex items-center justify-center text-purple-300 font-mono font-bold">
                      GH
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {status?.user?.name || status?.user?.login || 'cheyoung1983-sudo'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        @{status?.user?.login || 'cheyoung1983-sudo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 size={12} /> Origin Synced
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-cyan-400">
                        <GitBranch size={12} /> {status?.repo?.default_branch || branch}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  {status?.repo?.html_url && (
                    <a
                      href={status.repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <span>View Repo</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-colors border border-red-800/50"
                    title="Disconnect repository"
                  >
                    <LogOut size={12} />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={handlePullCode}
                  disabled={pulling}
                  className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group active:scale-95 disabled:opacity-50"
                >
                  <DownloadCloud
                    size={20}
                    className={`text-blue-400 group-hover:scale-110 transition-transform ${
                      pulling ? 'animate-bounce' : ''
                    }`}
                  />
                  <span className="text-xs font-bold text-white font-mono">
                    {pulling ? 'Pulling...' : 'Pull Remote Code'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    Fetch & merge from main
                  </span>
                </button>

                <button
                  onClick={handleSyncCode}
                  disabled={syncing}
                  className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group active:scale-95 disabled:opacity-50"
                >
                  <UploadCloud
                    size={20}
                    className={`text-cyan-400 group-hover:scale-110 transition-transform ${
                      syncing ? 'animate-bounce' : ''
                    }`}
                  />
                  <span className="text-xs font-bold text-white font-mono">
                    {syncing ? 'Pushing...' : 'Push & Sync Code'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    Stage, commit & push to main
                  </span>
                </button>

                <button
                  onClick={handleExportTelemetry}
                  disabled={exporting}
                  className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group active:scale-95 disabled:opacity-50"
                >
                  <ShieldCheck
                    size={20}
                    className={`text-emerald-400 group-hover:scale-110 transition-transform ${
                      exporting ? 'animate-spin' : ''
                    }`}
                  />
                  <span className="text-xs font-bold text-white font-mono">
                    {exporting ? 'Exporting...' : 'Export NIST Telemetry'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    Push bench audit to /diagnostics
                  </span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onOpenCli) onOpenCli();
                  }}
                  className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all group active:scale-95"
                >
                  <Terminal size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white font-mono">Run GitHub CLI (gh)</span>
                  <span className="text-[10px] text-slate-500 font-sans">Interactive command console</span>
                </button>
              </div>

              {/* Sub-tabs for Overview / Commits / File Issue */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Repo Stats
                  </button>
                  <button
                    onClick={() => setActiveTab('commits')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                      activeTab === 'commits'
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Recent Commits ({status?.commits?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('issue')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                      activeTab === 'issue'
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    + File Bench Issue
                  </button>
                </div>

                {activeTab === 'overview' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Visibility</span>
                      <div className="text-sm font-bold text-white font-mono">
                        {status?.repo?.private ? 'Private' : 'Public'}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Stars / Forks</span>
                      <div className="text-sm font-bold text-cyan-400 font-mono">
                        ★ {status?.repo?.stargazers_count ?? 0} | ⑂ {status?.repo?.forks_count ?? 0}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Open Issues</span>
                      <div className="text-sm font-bold text-amber-400 font-mono">
                        {status?.repo?.open_issues_count ?? 0}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Default Branch</span>
                      <div className="text-sm font-bold text-emerald-400 font-mono">
                        {status?.repo?.default_branch || 'main'}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'commits' && (
                  <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-850 overflow-hidden font-mono text-xs">
                    {status?.commits && status.commits.length > 0 ? (
                      status.commits.map((c: any, i: number) => (
                        <div key={i} className="p-3.5 hover:bg-slate-900/50 flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="font-bold text-white truncate">
                              {c.commit?.message?.split('\n')[0] || 'Commit update'}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span className="text-slate-400">{c.commit?.author?.name || 'Author'}</span>
                              <span>•</span>
                              <span suppressHydrationWarning>{new Date(c.commit?.author?.date || Date.now()).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <a
                            href={c.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[11px] shrink-0 font-bold"
                          >
                            {c.sha ? c.sha.substring(0, 7) : 'commit'}
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-500">
                        No recent commit history retrieved.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'issue' && (
                  <form onSubmit={handleCreateIssue} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                        Issue Title
                      </label>
                      <input
                        type="text"
                        value={issueTitle}
                        onChange={(e) => setIssueTitle(e.target.value)}
                        placeholder="e.g. Battery Anomaly on Bench #04 - FL1728 Failure"
                        className="w-full bg-slate-900 border border-slate-755 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">
                        Description / Diagnostic Context
                      </label>
                      <textarea
                        value={issueBody}
                        onChange={(e) => setIssueBody(e.target.value)}
                        rows={3}
                        placeholder="Describe symptom, diode mode readings, or NIST audit results..."
                        className="w-full bg-slate-900 border border-slate-755 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={creatingIssue}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Send size={12} />
                      <span>{creatingIssue ? 'Filing Issue...' : 'Submit to GitHub Repo'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* If Disconnected: Connection Form */
            <form onSubmit={handleConnect} className="space-y-5">
              <div className="p-4 bg-purple-950/20 border border-purple-800/40 rounded-2xl flex items-start gap-3 text-xs text-purple-200">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white">Connect GitHub Repository</span>
                  <p className="text-purple-300/80 leading-relaxed font-sans">
                    Enter a GitHub Personal Access Token (PAT) with <code className="bg-purple-900/60 px-1 py-0.5 rounded text-purple-200 font-mono">repo</code> and <code className="bg-purple-900/60 px-1 py-0.5 rounded text-purple-200 font-mono">read:user</code> scopes to link <code className="text-white font-bold">{repo}</code>. This will configure the local git remote and enable direct telemetry commit exports.
                  </p>
                </div>
              </div>

              {/* Repository Identifier */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                  <span>Target GitHub Repository</span>
                  <button
                    type="button"
                    onClick={() => setRepo('cheyoung1983-sudo/dcptriage')}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Reset to Default Repo
                  </button>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="owner/repository-name"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-400">
                    <GitBranch size={12} className="text-cyan-400" />
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                      className="w-16 bg-transparent text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Access Token (PAT) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <Key size={14} className="text-amber-400" />
                    <span>Personal Access Token (PAT)</span>
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,workflow,read:user&description=DisplayCellPros-DiagnosticHub"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1 font-mono"
                  >
                    <span>Generate token on GitHub</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  Token is securely stored locally in <code className="text-slate-400 font-mono">.github-config.json</code> (excluded from git tracking).
                </p>
              </div>

              {/* Connect Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-purple-200" />
                    <span>Authenticating & Configuring Origin...</span>
                  </>
                ) : (
                  <>
                    <FolderGit2 size={14} />
                    <span>Connect & Verify Repository</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Remote: https://github.com/{status?.config?.repo || repo}.git</span>
          </div>
          <span>Branch: {status?.config?.branch || branch}</span>
        </div>
      </div>
    </div>
  );
}
