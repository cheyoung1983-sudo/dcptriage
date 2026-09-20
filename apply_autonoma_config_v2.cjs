const { spawn } = require('child_process');

const code = 'GQRYB7QE';
const applicationId = 'cms0xch680dil0192y49oz12p';
const cmd = `npx -y mcp-remote --header "X-Onboarding-Code: ${code}" https://api.autonoma.app/v1/mcp/onboarding`;

const document = {
  version: 1,
  apps: [
    {
      name: "ui-testing-cyan-castle",
      path: ".",
      build: {
        framework: "runtime",
        runtime: "node",
        version: "22",
        build_script: "npm install && npm run build --v=1.0.5",
        entrypoint: "npm start",
        build_context: "app"
      },
      build_secrets: [
        "VITE_RECAPTCHA_SITE_KEY",
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_AUTH_DOMAIN",
        "VITE_FIREBASE_PROJECT_ID",
        "VITE_FIREBASE_STORAGE_BUCKET",
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        "VITE_FIREBASE_APP_ID",
        "VITE_FIREBASE_MEASUREMENT_ID",
        "VITE_APP_URL"
      ],
      port: 3000,
      connections: [
        { key: "IS_AUTONOMA", value: "true" },
        { key: "PGHOST", value: "{{db.host}}" },
        { key: "PGPORT", value: "{{db.port}}" },
        { key: "PGUSER", value: "{{db.user}}" },
        { key: "PGDATABASE", value: "{{db.database}}" },
        { key: "PGPASSWORD", value: "{{db.password}}" }
      ],
      health_check: "/api/health",
      primary: true,
      resources: {
        cpu: "250m",
        memoryRequest: "512Mi",
        memoryLimit: "1Gi"
      }
    }
  ],
  services: [
    {
      name: "db",
      recipe: "postgres",
      version: "16",
      options: {},
      setup_tasks: [],
      resources: {
        cpu: "100m",
        memoryRequest: "256Mi",
        memoryLimit: "1Gi"
      }
    }
  ],
  addons: [],
  hooks: {
    pre_deploy: [],
    post_deploy: []
  }
};

const mcp = spawn(cmd, [], { shell: true });

let outputBuffer = '';

function handleOutput(data) {
  const str = data.toString();
  outputBuffer += str;

  if (str.includes('Proxy established successfully')) {
      mcp.stdin.write(JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
              name: "apply_config",
              arguments: {
                  applicationId,
                  document,
                  description: "Reverting path to root (.) after build error"
              }
          }
      }) + '\n');
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
    console.log("Timeout. Buffer:");
    console.log(outputBuffer);
    process.exit(1);
}, 20000);
