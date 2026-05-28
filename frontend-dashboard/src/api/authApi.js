const AUTH_BASE_URL = 'http://localhost:8085/api/v1';

export async function login(username, password) {
  const res = await fetch(`${AUTH_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error('Login failed');
  }

  return res.json();
}

