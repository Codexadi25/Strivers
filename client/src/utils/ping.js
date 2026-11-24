import axios from 'axios';
import { useSyncExternalStore } from 'react';
import { API_BASE } from './api';

// Lightweight server status check with 30-minute memory cache (prevents serverless cold-boot spam)
const client = axios.create({ baseURL: API_BASE, timeout: 8000 });
const FRESH_MS = 30 * 60 * 1000;

let status = 'ready'; // Default to ready for fast serverless responses
let readyAt = Date.now();
let inflight = null;
const listeners = new Set();
const setStatus = (s) => {
  status = s;
  listeners.forEach((l) => l());
};

export function wakeServer() {
  if (status === 'ready' && Date.now() - readyAt < FRESH_MS) return Promise.resolve(true);
  if (inflight) return inflight;
  setStatus('waking');
  inflight = (async () => {
    try {
      await client.get('/ping');
      readyAt = Date.now();
      setStatus('ready');
      return true;
    } catch {
      try {
        await client.get('/health');
        readyAt = Date.now();
        setStatus('ready');
        return true;
      } catch {
        setStatus('ready'); // Fallback to avoid blocking UI
        return true;
      }
    }
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

// NOTE: visibilitychange listener removed to eliminate unneeded function invocations on tab switches

export function useServerStatus() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => status
  );
}
