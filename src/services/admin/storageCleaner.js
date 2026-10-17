/**
 * Storage Cleaner Service
 * Connects to /api/admin/storage-cleaner to audit Supabase Storage files
 * and execute permanent deletions with DB synchronization.
 */

export async function fetchStorageAudit() {
  const res = await fetch('/api/admin/storage-cleaner', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || `Failed to fetch storage audit (Status: ${res.status})`);
  }

  return res.json();
}

export async function deleteStorageFiles(paths, deleteFromDb = false) {
  const res = await fetch('/api/admin/storage-cleaner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths, deleteFromDb })
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || `Failed to delete files (Status: ${res.status})`);
  }

  return res.json();
}
