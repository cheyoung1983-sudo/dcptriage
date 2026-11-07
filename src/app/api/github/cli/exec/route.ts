import { NextRequest, NextResponse } from 'next/server';
import { executeSafeGitCli } from '@/lib/github';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const command = body?.command;

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        {
          command: '',
          stdout: '',
          stderr: 'No command provided',
          exitCode: 1,
          success: false,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const result = await executeSafeGitCli(command);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        command: '',
        stdout: '',
        stderr: err.message || 'Execution error',
        exitCode: 1,
        success: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
