const { spawn } = require('child_process');
const code = 'GQRYB7QE';
const applicationId = 'cms0xch680dil0192y49oz12p';
const cmd = `npx -y mcp-remote --header "X-Onboarding-Code: ${code}" https://api.autonoma.app/v1/mcp/onboarding`;

const mcp = spawn(cmd, [], { shell: true });

function handleOutput(data) {
  const str = data.toString();
  if (str.includes('Proxy established successfully')) {
      mcp.stdin.write(JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
              name: "get_target_logs",
              arguments: {
                  applicationId,
                  target: "0",
                  source: "app"
              }
          }
      }) + '\n');
  }

  const matches = str.match(/\{.*\}/g);
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
setTimeout(() => process.exit(1), 20000);
