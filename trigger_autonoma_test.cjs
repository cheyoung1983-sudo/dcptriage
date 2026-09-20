require('dotenv').config({ path: '.env.local' });

const CLIENT_ID = process.env.AUTONOMA_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTONOMA_SECRET_ID;
const TEST_ID = process.argv[2] || 'ui-testing-cyan-castle';
const APP_VERSION_ID = 'cm7dbowr80042waka7thyjhkq';

async function triggerTestRun(testId) {
  console.log(`Triggering Autonoma test run for ID: ${testId}...`);

  const response = await fetch(`https://api.autonoma.app/v1/test/${testId}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'autonoma-client-id': CLIENT_ID,
      'autonoma-client-secret': CLIENT_SECRET,
    },
    body: JSON.stringify({
      application_version_id: APP_VERSION_ID,
      source: 'api',
      runtime_metadata: {
        NAME: "DisplayCellPros",
        ENVIRONMENT: "staging"
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Test run triggered successfully:');
  console.log(JSON.stringify(data, null, 2));
  return data;
}

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: AUTONOMA_CLIENT_ID and AUTONOMA_SECRET_ID must be set in .env.local');
  process.exit(1);
}

triggerTestRun(TEST_ID).catch(err => {
  console.error('Failed to trigger test run:', err.message);
  process.exit(1);
});
