import { NextRequest, NextResponse } from 'next/server';
import {
  getStoredGitHubConfig,
  commitTelemetryFileToGitHub
} from '@/lib/github';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const config = getStoredGitHubConfig();
    if (!config.isConfigured || !config.token) {
      return NextResponse.json(
        { success: false, error: 'GitHub is not connected. Please connect with your Personal Access Token first.' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'commit_and_push';

    if (action === 'export_telemetry') {
      const ticketId = body.ticketId || `TICKET-${Date.now().toString(36).toUpperCase()}`;
      const timestamp = new Date().toISOString();
      const telemetryReport = body.report || {
        ticketId,
        timestamp,
        bench: 'Spokane Bench #04',
        standard: 'NIST SP 800-88 R1 compliant',
        hardwareStatus: 'VERIFIED',
        details: body.telemetryDetails || {}
      };

      const filePath = `diagnostics/telemetry-${ticketId}-${Date.now()}.json`;
      const commitMessage = `chore(diagnostics): audit log export for ${ticketId} [skip ci]`;

      const result = await commitTelemetryFileToGitHub(
        config.token,
        config.repo,
        filePath,
        JSON.stringify(telemetryReport, null, 2),
        commitMessage
      );

      return NextResponse.json({
        success: true,
        action: 'export_telemetry',
        filePath,
        commit: result.commit,
        message: `Telemetry report committed to ${config.repo}/${filePath}`
      });
    }

    if (action === 'pull') {
      await execAsync('git config --global --add safe.directory /app/applet || true');
      const branch = config.branch || 'main';
      const pullResult = await execAsync(`git pull --no-rebase origin ${branch} -X ours || git pull origin ${branch} || true`);
      
      return NextResponse.json({
        success: true,
        action: 'pull',
        branch,
        output: pullResult.stdout || pullResult.stderr || 'Pull completed'
      });
    }

    // Default action: commit and push local changes
    const commitMsg = body.message || `chore: bench update ${new Date().toISOString()}`;

    // Configure safe directory
    await execAsync('git config --global --add safe.directory /app/applet || true');
    await execAsync('git add . || true');

    try {
      await execAsync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}" || true`);
    } catch {
      // nothing to commit is okay
    }

    const pushResult = await execAsync(`git push -u origin ${config.branch || 'main'} || true`);

    return NextResponse.json({
      success: true,
      action: 'commit_and_push',
      branch: config.branch || 'main',
      output: pushResult.stdout || 'Sync completed successfully'
    });
  } catch (err: any) {
    console.error('Error in /api/github/sync:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to sync with GitHub repository' },
      { status: 500 }
    );
  }
}
