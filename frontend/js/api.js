// The one place that talks to the backend. Change API_BASE if you change the port.
const API_BASE = 'http://localhost:3000/api';

async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(API_BASE + path, options);
  } catch (err) {
    throw new Error('Cannot reach the cafe server. Start the backend with "npm start" and try again.');
  }

  let data = {};
  try { data = await response.json(); } catch (err) { /* empty body */ }

  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

function apiPost(path, body) {
  return apiRequest(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}
