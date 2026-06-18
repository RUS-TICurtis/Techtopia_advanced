/**
 * Audit Service — Techtopia CRM Hub
 *
 * Forwards mutation events to the backend audit ledger at POST /api/v1/audit/events.
 * Falls back to a localStorage queue when the backend is unreachable and retries
 * on the next successful track() call (fire-and-forget drain).
 *
 * Backend contract (expected payload):
 *   {
 *     action:   string,          // e.g. "Create Lead"
 *     module:   string,          // e.g. "CRM", "Finance", "HR"
 *     severity: "info"|"warning"|"critical",
 *     metadata: object|null      // optional extra context
 *   }
 *
 * The backend is responsible for stamping:
 *   - timestamp (server-side UTC)
 *   - actor     (resolved from the Bearer JWT)
 *   - ip        (extracted from X-Forwarded-For / remote address)
 */

import { apiClient } from '../../lib/api';

// ─── Constants ─────────────────────────────────────────────────────────────
const AUDIT_ENDPOINT = '/api/v1/audit/events';
const OFFLINE_QUEUE_KEY = 'crm_audit_offline_queue';
const MAX_QUEUE_SIZE = 200;

// ─── Internal helpers ───────────────────────────────────────────────────────

/** Return the current offline queue array from localStorage. */
function getQueue() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Persist the offline queue back to localStorage. */
function saveQueue(queue) {
  try {
    // cap to avoid unbounded growth
    const trimmed = queue.slice(-MAX_QUEUE_SIZE);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(trimmed));
  } catch {
    // quota exceeded — silently ignore
  }
}

/**
 * Attempt to POST a single event to the backend.
 * Returns true on success, false on failure.
 * @param {{ action: string, module: string, severity: string, metadata?: object }} event
 */
async function postEvent(event) {
  try {
    await apiClient.post(AUDIT_ENDPOINT, event);
    return true;
  } catch {
    return false;
  }
}

/**
 * Drain all offline-queued events to the backend.
 * Only called opportunistically — never throws.
 */
async function drainOfflineQueue() {
  const queue = getQueue();
  if (queue.length === 0) return;

  const remaining = [];
  for (const event of queue) {
    const sent = await postEvent(event);
    if (!sent) {
      remaining.push(event);
      // If one fails, stop trying (likely still offline).
      break;
    }
  }
  saveQueue(remaining);
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Track an auditable action.
 *
 * @param {string} action    - Human-readable action label (e.g. "Delete Lead")
 * @param {string} module    - Owning module (e.g. "CRM", "Finance", "HR", "Auth")
 * @param {'info'|'warning'|'critical'} [severity='info'] - Severity level
 * @param {object|null} [metadata=null] - Optional extra context
 */
export async function track(action, module, severity = 'info', metadata = null) {
  const event = { action, module, severity, ...(metadata ? { metadata } : {}) };

  // First, opportunistically drain any previous offline events.
  await drainOfflineQueue();

  const sent = await postEvent(event);
  if (!sent) {
    // Backend unavailable — queue for later retry.
    const queue = getQueue();
    queue.push(event);
    saveQueue(queue);
  }
}

/**
 * Convenience wrappers for common severities.
 */
export const auditTrack = {
  info: (action, module, metadata) => track(action, module, 'info', metadata),
  warning: (action, module, metadata) => track(action, module, 'warning', metadata),
  critical: (action, module, metadata) => track(action, module, 'critical', metadata),
};

export default auditTrack;
