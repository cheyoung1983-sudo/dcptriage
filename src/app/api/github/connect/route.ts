import { NextRequest, NextResponse } from 'next/server';
import {
  verifyGitHubUser,
  verifyGitHubRepo,
  saveStoredGitHubConfig,
  setupLocalGitRemote,
  getGitHubRepoCommits,
  getGitHubRepoIssues
} from '@/lib/github';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body?.token?.trim();
    const repo = body?.repo?.trim() || 'cheyoung1983-sudo/dcptriage';
    const branch = body?.branch?.trim() || 'main';

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Personal Access Token is required to connect repository' },
        { status: 400 }
      );
    }

    // 1. Verify User Credentials
    const user = await verifyGitHubUser(token);

    // 2. Verify Target Repository Access
    const repoDetails = await verifyGitHubRepo(token, repo);

    // 3. Configure local git remote with authenticated origin
    await setupLocalGitRemote(token, repo);

    // 4. Save configuration securely
    saveStoredGitHubConfig({
      token,
      repo: repoDetails.full_name || repo,
      branch: repoDetails.default_branch || branch,
      username: user.login
    });

    // 5. Query initial telemetry
    const [commits, issues] = await Promise.all([
      getGitHubRepoCommits(token, repo, 5).catch(() => []),
      getGitHubRepoIssues(token, repo, 5).catch(() => [])
    ]);

    return NextResponse.json({
      success: true,
      message: `Successfully connected to GitHub repository ${repoDetails.full_name}`,
      user,
      repo: repoDetails,
      commits,
      issues
    });
  } catch (err: any) {
    console.error('Error connecting to GitHub repo:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to authenticate and connect to GitHub repository'
      },
      { status: 400 }
    );
  }
}
