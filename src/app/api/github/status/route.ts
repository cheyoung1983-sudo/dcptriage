import { NextResponse } from 'next/server';
import {
  getStoredGitHubConfig,
  verifyGitHubUser,
  verifyGitHubRepo,
  getGitHubRepoCommits,
  getGitHubRepoIssues
} from '@/lib/github';

export async function GET() {
  try {
    const config = getStoredGitHubConfig();

    if (!config.isConfigured || !config.token) {
      return NextResponse.json({
        configured: false,
        repo: {
          name: config.repo,
          branch: config.branch
        },
        message: 'GitHub credentials not configured'
      });
    }

    // Verify user and repo details
    const [user, repoDetails, commits, issues] = await Promise.all([
      verifyGitHubUser(config.token).catch(err => {
        console.warn('GitHub user check warning:', err.message);
        return { login: config.username || 'cheyoung1983-sudo' };
      }),
      verifyGitHubRepo(config.token, config.repo).catch(err => {
        console.warn('GitHub repo check warning:', err.message);
        return {
          name: config.repo.split('/')[1] || config.repo,
          full_name: config.repo,
          default_branch: config.branch,
          private: true,
          html_url: `https://github.com/${config.repo}`
        };
      }),
      getGitHubRepoCommits(config.token, config.repo, 5).catch(() => []),
      getGitHubRepoIssues(config.token, config.repo, 5).catch(() => [])
    ]);

    return NextResponse.json({
      configured: true,
      user,
      repo: repoDetails,
      commits,
      issues,
      config: {
        repo: config.repo,
        branch: config.branch
      }
    });
  } catch (err: any) {
    console.error('Error querying GitHub status:', err);
    return NextResponse.json(
      {
        configured: false,
        error: err.message || 'Failed to query GitHub status'
      },
      { status: 500 }
    );
  }
}
