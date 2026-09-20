const { spawn } = require('child_process');

const cmd = `npx -y mcp-remote --header "X-Onboarding-Code: XUB4BDCU" https://api.autonoma.app/v1/mcp/onboarding`;

const mcp = spawn(cmd, [], { shell: true });

let outputBuffer = '';
let toolCalled = false;

function handleOutput(data) {
  const str = data.toString();
  outputBuffer += str;

  if (!toolCalled && str.includes('Proxy established successfully')) {
      mcp.stdin.write(JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
              name: "get_config",
              arguments: {
                  applicationId: "default"
              }
          }
      }) + '\n');
      toolCalled = true;
  }

  const matches = outputBuffer.match(/\{.*\}/g);
  if (matches) {
      for (const match of matches) {
          try {
              const json = JSON.parse(match);
              if (json.id === 1) {
                  console.log(JSON.stringify(json, null, 2));
                  process.exit(0);
              }
          } catch (e) {}
      }
  }
}

mcp.stdout.on('data', handleOutput);
mcp.stderr.on('data', handleOutput);

setTimeout(() => {
    process.exit(1);
}, 20000);
