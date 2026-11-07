import { NextResponse } from 'next/server';
import { removeStoredGitHubConfig } from '@/lib/github';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function POST() {
  try {
    removeStoredGitHubConfig();
    // Reset git remote credentials to clean URL without embedded token
    try {
      await execAsync('git remote set-url origin https://github.com/cheyoung1983-sudo/dcptriage.git || true');
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: 'GitHub repository configuration disconnected'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
