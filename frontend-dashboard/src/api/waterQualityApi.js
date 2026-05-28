const WATER_BASE_URL = 'http://localhost:8080/api/v1/waterquality';

export async function getLatestFlag() {
  const res = await fetch(`${WATER_BASE_URL}/latest-flag`);
  if (!res.ok) throw new Error('Failed to load latest safety flag');
  return res.json();
}

export async function getMonthlyAverages() {
  const res = await fetch(`${WATER_BASE_URL}/monthly-averages`);
  if (!res.ok) throw new Error('Failed to load monthly averages');
  return res.json();
}

export async function getAllRecords() {
  const res = await fetch(`${WATER_BASE_URL}/records`);
  if (!res.ok) throw new Error('Failed to fetch water quality records');
  return res.json();
}

export async function getRecordById(objectId) {
  const res = await fetch(`${WATER_BASE_URL}/records/${objectId}`);
  if (!res.ok) throw new Error(`Failed to load record ID ${objectId}`);
  return res.json();
}

export async function getLatestRecord() {
  const res = await fetch(`${WATER_BASE_URL}/records/latest`);
  if (!res.ok) throw new Error('Failed to load the latest record');
  return res.json();
}

export async function createRecord(recordData) {
  const res = await fetch(`${WATER_BASE_URL}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recordData),
  });
  if (!res.ok) throw new Error('Failed to create new record');
  return res.json();
}

export async function updateRecord(objectId, recordData) {
  const res = await fetch(`${WATER_BASE_URL}/records/${objectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recordData),
  });
  if (!res.ok) throw new Error(`Failed to update record ID ${objectId}`);
  return res.json();
}

export async function deleteRecord(objectId) {
  const res = await fetch(`${WATER_BASE_URL}/records/${objectId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete record ID ${objectId}`);
  return true;
}
