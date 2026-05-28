const AUTH_BASE_URL = 'http://localhost:8085/api/v1';

export async function listUsers() {
  const res = await fetch(`${AUTH_BASE_URL}/users`);
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

export async function createUser(username, password) {
  const res = await fetch(`${AUTH_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Failed to create user');
}

export async function deleteUser(username) {
  const res = await fetch(`${AUTH_BASE_URL}/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete user');
}

export async function changePassword(username, newPassword) {
  const res = await fetch(
    `${AUTH_BASE_URL}/users/${encodeURIComponent(username)}/password`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    },
  );
  if (!res.ok) throw new Error('Failed to change password');
}

