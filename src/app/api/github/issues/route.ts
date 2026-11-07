import { NextRequest, NextResponse } from 'next/server';
import {
  getStoredGitHubConfig,
  getGitHubRepoIssues,
  createGitHubIssue
} from '@/lib/github';

export async function GET(req: NextRequest) {
  try {
    const config = getStoredGitHubConfig();
    if (!config.isConfigured || !config.token) {
      return NextResponse.json({ issues: [], configured: false });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit') || 10);
    const issues = await getGitHubRepoIssues(config.token, config.repo, limit);

    return NextResponse.json({ issues, configured: true, repo: config.repo });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, issues: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const config = getStoredGitHubConfig();
    if (!config.isConfigured || !config.token) {
      return NextResponse.json(
        { success: false, error: 'GitHub credentials not configured' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, body: issueBody, labels } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Issue title is required' }, { status: 400 });
    }

    const issue = await createGitHubIssue(
      config.token,
      config.repo,
      title,
      issueBody || 'Reported from Display Cell Pros Diagnostic Hub',
      labels
    );

    return NextResponse.json({ success: true, issue });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
