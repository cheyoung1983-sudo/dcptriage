import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  ExternalLink, 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  Cpu, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  FolderGit2,
  Sparkles,
  Command
} from 'lucide-react';
import { GitHubCLIExecResult, GitHubSourceInstallSection } from '../types';
import { useToast } from './Toast';
import GitHubRepoModal from './GitHubRepoModal';

interface GitHubCLISourceCenterProps {
  githubStatus?: { configured: boolean; user?: any; repo?: any } | null;
}

export default function GitHubCLISourceCenter({ githubStatus }: GitHubCLISourceCenterProps) {
  const { showToast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'unix' | 'windows' | 'cross'>('unix');
  const [docsData, setDocsData] = useState<{
    sourceUrl: string;
    installedVersion: string;
    isInstalled: boolean;
    prerequisites: string[];
    sections: GitHubSourceInstallSection[];
  } | null>(null);

  const [activeCliCommand, setActiveCliCommand] = useState<string>('gh --version');
  const [cliHistory, setCliHistory] = useState<GitHubCLIExecResult[]>([]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'terminal' | 'presets'>('terminal');
  const [isRepoModalOpen, setIsRepoModalOpen] = useState<boolean>(false);
  const [liveStatus, setLiveStatus] = useState<any>(githubStatus || null);

  const fetchLiveStatus = () => {
    fetch('/api/github/status')
      .then((res) => res.json())
      .then((data) => setLiveStatus(data))
      .catch(() => setLiveStatus({ configured: false }));
  };

  useEffect(() => {
    fetchLiveStatus();

    // Fetch GitHub CLI source installation metadata
    fetch('/api/github/cli/docs')
      .then(res => res.json())
      .then(data => {
        setDocsData(data);
      })
      .catch(err => {
        console.error('Failed to load GitHub CLI doc data:', err);
      });

    // Run initial version check in terminal
    runCliCommand('gh --version');
  }, []);

  const runCliCommand = async (cmdToRun?: string) => {
    const command = cmdToRun || activeCliCommand;
    if (!command.trim()) return;

    setIsExecuting(true);
    try {
      const res = await fetch('/api/github/cli/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data: GitHubCLIExecResult = await res.json();
      
      setCliHistory(prev => [data, ...prev.slice(0, 15)]);
      if (data.success) {
        showToast(`Executed: ${data.command}`, 'success');
      } else {
        showToast(`Command returned non-zero code (${data.exitCode})`, 'error');
      }
    } catch (err: any) {
      console.error('CLI execution error:', err);
      showToast('Failed to execute GitHub CLI process', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const commandPresets = [
    { label: 'Check Version', cmd: 'gh --version', icon: Terminal, desc: 'Verify local gh binary build release' },
    { label: 'Auth Status', cmd: 'gh auth status', icon: ShieldCheck, desc: 'Inspect current token & scope permissions' },
    { label: 'Repo Overview', cmd: 'gh repo view cheyoung1983-sudo/dcptriage', icon: FolderGit2, desc: 'Query repository README & metadata' },
    { label: 'Recent PRs', cmd: 'gh pr list --limit 5', icon: GitPullRequest, desc: 'List active and merged pull requests' },
    { label: 'Open Issues', cmd: 'gh issue list --limit 5', icon: AlertCircle, desc: 'Query open bug reports & bench tasks' },
    { label: 'Releases', cmd: 'gh release list', icon: Download, desc: 'Query tagged releases and changelog assets' },
    { label: 'Workflow Runs', cmd: 'gh run list --limit 5', icon: Layers, desc: 'Query GitHub Actions CI/CD telemetry' },
    { label: 'API User Query', cmd: 'gh api user', icon: Sparkles, desc: 'Query authenticated REST profile' }
  ];

  return (
    <div className="space-y-8">
      {/* GitHub CLI Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-700 text-emerald-400 rounded-full text-xs font-mono font-bold tracking-wider">
              <Terminal className="w-3.5 h-3.5" />
              <span>GitHub CLI • Source Implementation</span>
            </div>
            <h2 className="text-3xl font-playfair font-black tracking-tight text-white">
              GitHub CLI (<code className="text-emerald-400 font-mono">gh</code>) Tool Suite
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Official implementation of the GitHub CLI source compilation pipeline from{' '}
              <a 
                href="https://github.com/cli/cli/blob/trunk/docs/install_source.md" 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 underline font-mono text-xs inline-flex items-center gap-1"
              >
                docs/install_source.md <ExternalLink className="w-3 h-3 inline" />
              </a>.
              Includes real-time CLI terminal execution, cross-compilation reference, and repository telemetry.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                gh
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400">Binary Status</div>
                <div className="text-sm font-black text-white font-mono">
                  {docsData?.installedVersion || 'gh v2.67.0 Ready'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsRepoModalOpen(true)}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>{liveStatus?.configured ? 'Manage Repo' : 'Connect Repo'}</span>
            </button>

            <a
              href="https://github.com/cli/cli/blob/trunk/docs/install_source.md"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 border border-slate-700"
            >
              <span>Source Doc</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'terminal'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Interactive Terminal & Runner
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'guide'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Source Build Guide (install_source.md)
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'presets'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Command className="w-3.5 h-3.5" />
          Command Recipes ({commandPresets.length})
        </button>
      </div>

      {/* TAB 1: INTERACTIVE CLI TERMINAL */}
      {activeTab === 'terminal' && (
        <div className="space-y-6">
          {/* Quick Preset Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
            </span>
            {commandPresets.map((preset, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveCliCommand(preset.cmd);
                  runCliCommand(preset.cmd);
                }}
                disabled={isExecuting}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-mono font-medium rounded-lg shrink-0 transition-all shadow-2xs hover:border-slate-300 disabled:opacity-50"
              >
                {preset.cmd}
              </button>
            ))}
          </div>

          {/* CLI Input Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-xs shrink-0 pl-2">
              <span className="text-emerald-600 font-bold">$</span>
              <span className="font-bold text-slate-700">gh</span>
            </div>
            <input
              type="text"
              value={activeCliCommand.startsWith('gh ') ? activeCliCommand.slice(3) : activeCliCommand}
              onChange={(e) => setActiveCliCommand(`gh ${e.target.value}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isExecuting) {
                  runCliCommand();
                }
              }}
              placeholder="e.g. repo view, pr list, auth status, api user..."
              className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-900 font-mono text-sm placeholder:text-slate-400 outline-none"
            />
            <button
              onClick={() => runCliCommand()}
              disabled={isExecuting}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Command</span>
                </>
              )}
            </button>
          </div>

          {/* Live Terminal Output Console */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono">
            <div className="bg-slate-900/90 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-bold text-slate-400 ml-2">GitHub CLI Console (gh 2.67.0)</span>
              </div>
              <span className="text-[10px] text-slate-500">
                {cliHistory.length} execution{cliHistory.length === 1 ? '' : 's'} recorded
              </span>
            </div>

            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              {cliHistory.length === 0 ? (
                <div className="text-slate-500 text-xs py-8 text-center">
                  Run a GitHub CLI command above to view live execution logs and outputs.
                </div>
              ) : (
                cliHistory.map((item, idx) => (
                  <div key={idx} className="space-y-2 border-b border-slate-900 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">$</span>
                        <span className="text-white font-bold text-xs">{item.command}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.success ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          exit: {item.exitCode} {item.durationMs ? `(${item.durationMs}ms)` : ''}
                        </span>
                        <button
                          onClick={() => handleCopy(item.stdout || item.stderr, `cli-${idx}`)}
                          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                          title="Copy output"
                        >
                          {copiedCode === `cli-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {item.stdout && (
                      <pre className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {item.stdout}
                      </pre>
                    )}

                    {item.stderr && (
                      <pre className="text-xs text-amber-300 bg-amber-950/30 border border-amber-900/50 p-3.5 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {item.stderr}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOURCE BUILD & INSTALL GUIDE (install_source.md) */}
      {activeTab === 'guide' && (
        <div className="space-y-8">
          {/* Prerequisites Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Compilation Prerequisites</h3>
                <p className="text-xs text-slate-500">Requirements before building GitHub CLI from source</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">Go Compiler</div>
                <div className="text-sm font-bold text-slate-900 font-mono">Go 1.22+ or 1.26+</div>
                <p className="text-[11px] text-slate-500">Run <code className="text-slate-800">go version</code> to verify</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">VCS Tooling</div>
                <div className="text-sm font-bold text-slate-900 font-mono">Git 2.0+</div>
                <p className="text-[11px] text-slate-500">Required for cloning repository trunk</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">Toolchain</div>
                <div className="text-sm font-bold text-slate-900 font-mono">GNU Make & GCC</div>
                <p className="text-[11px] text-slate-500">Used for make install & man page builds</p>
              </div>
            </div>
          </div>

          {/* Platform Selector */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">Build & Installation Recipes</h3>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedPlatform('unix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPlatform === 'unix' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Linux / macOS
              </button>
              <button
                onClick={() => setSelectedPlatform('windows')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPlatform === 'windows' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Windows
              </button>
              <button
                onClick={() => setSelectedPlatform('cross')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPlatform === 'cross' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cross-Compilation
              </button>
            </div>
          </div>

          {/* Instruction Sections */}
          <div className="space-y-6">
            {docsData?.sections
              .filter(sec => selectedPlatform === 'all' || sec.platform === 'all' || sec.platform === selectedPlatform)
              .map((section) => (
                <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h4 className="font-bold text-slate-900 text-base">{section.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{section.description}</p>
                  </div>

                  <div className="p-6 space-y-4 bg-slate-950">
                    {section.commands.map((cmdItem, cIdx) => (
                      <div key={cIdx} className="space-y-1">
                        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                          <span># {cmdItem.comment}</span>
                          <button
                            onClick={() => handleCopy(cmdItem.command, `${section.id}-${cIdx}`)}
                            className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] font-sans font-bold transition-colors"
                          >
                            {copiedCode === `${section.id}-${cIdx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCode === `${section.id}-${cIdx}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="bg-slate-900 px-4 py-3 rounded-xl font-mono text-xs text-emerald-400 font-bold overflow-x-auto flex items-center justify-between">
                          <span>{cmdItem.command}</span>
                        </div>
                      </div>
                    ))}

                    {section.notes && section.notes.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 space-y-1">
                        {section.notes.map((note, nIdx) => (
                          <div key={nIdx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                            <span className="text-blue-400 font-bold">•</span>
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: COMMAND RECIPES */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commandPresets.map((preset, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <preset.icon className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-900 text-sm">{preset.label}</h4>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    CLI
                  </span>
                </div>
                <p className="text-xs text-slate-500">{preset.desc}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-emerald-400 flex items-center justify-between">
                <span className="truncate mr-2">{preset.cmd}</span>
                <button
                  onClick={() => {
                    setActiveTab('terminal');
                    setActiveCliCommand(preset.cmd);
                    runCliCommand(preset.cmd);
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-sans font-bold shrink-0 transition-colors"
                >
                  Run Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GitHub Repository Connection & CI/CD Modal */}
      <GitHubRepoModal
        isOpen={isRepoModalOpen}
        onClose={() => {
          setIsRepoModalOpen(false);
          fetchLiveStatus();
        }}
      />
    </div>
  );
}
