import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    sourceUrl: 'https://github.com/cli/cli/blob/trunk/docs/install_source.md',
    installedVersion: 'gh v2.67.0 (Source Ready)',
    isInstalled: true,
    prerequisites: [
      'Go 1.22+ or 1.26+ installed and available in PATH',
      'Git 2.0+ revision control toolchain',
      'GNU Make & standard C compiler (gcc or clang)'
    ],
    sections: [
      {
        id: 'unix-source',
        title: 'Linux & macOS Source Compilation',
        platform: 'unix',
        description: 'Standard compilation using GNU Make and official cli/cli trunk branch.',
        commands: [
          {
            command: 'git clone https://github.com/cli/cli.git gh-cli && cd gh-cli',
            comment: 'Clone the official GitHub CLI source repository'
          },
          {
            command: 'make',
            comment: 'Compile binary to ./bin/gh with embedded man pages'
          },
          {
            command: 'sudo make install',
            comment: 'Install gh into /usr/local/bin and install manual pages'
          }
        ],
        notes: [
          'Binary will be placed in /usr/local/bin by default.',
          'To set custom prefix: make prefix=/opt/gh install'
        ]
      },
      {
        id: 'windows-source',
        title: 'Windows Source Compilation',
        platform: 'windows',
        description: 'Native build instructions using PowerShell or Windows Command Prompt.',
        commands: [
          {
            command: 'git clone https://github.com/cli/cli.git gh-cli; cd gh-cli',
            comment: 'Clone repository into local Windows workspace'
          },
          {
            command: 'go run script/build.go',
            comment: 'Execute Go cross-platform build script'
          },
          {
            command: 'Move-Item bin\\gh.exe $env:LOCALAPPDATA\\Programs\\gh\\',
            comment: 'Move compiled executable to local user path'
          }
        ],
        notes: [
          'Requires Git for Windows and PowerShell 5.1 or newer.',
          'Add directory to your User PATH variable.'
        ]
      },
      {
        id: 'cross-compile',
        title: 'Multi-Arch Cross-Compilation Matrix',
        platform: 'cross',
        description: 'Cross-compile for ARM64, AMD64, Linux, Darwin, and Windows embedded targets.',
        commands: [
          {
            command: 'GOOS=linux GOARCH=arm64 go build -o bin/gh-linux-arm64 ./cmd/gh',
            comment: 'Compile for Linux ARM64 (Raspberry Pi & modern servers)'
          },
          {
            command: 'GOOS=darwin GOARCH=arm64 go build -o bin/gh-darwin-arm64 ./cmd/gh',
            comment: 'Compile for Apple Silicon (M1/M2/M3/M4 Macs)'
          },
          {
            command: 'GOOS=windows GOARCH=amd64 go build -o bin/gh.exe ./cmd/gh',
            comment: 'Compile 64-bit Windows binary'
          }
        ],
        notes: [
          'No CGO dependencies required for pure Go cross compilation.',
          'Enables automated building in GitHub Actions CI workflows.'
        ]
      }
    ]
  });
}
