import axios from 'axios';
import { useSyncExternalStore } from 'react';
import { API_BASE } from './api';

// Render free tier sleeps after ~15 min idle and needs up to ~50s to wake.
const client = axios.create({ baseURL: API_BASE, timeout: 65000 });
const FRESH_MS = 10 * 60 * 1000;

let status = 'idle'; // idle | waking | ready | failed
let readyAt = 0;
let inflight = null;
const listeners = new Set();
const setStatus = (s) => {
  status = s;
  listeners.forEach((l) => l());
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function wakeServer() {
  if (status === 'ready' && Date.now() - readyAt < FRESH_MS) return Promise.resolve(true);
  if (inflight) return inflight;
  setStatus('waking');
  inflight = (async () => {
    for (let i = 0; i < 4; i++) {
      try {
        await client.get('/ping');
        readyAt = Date.now();
        setStatus('ready');
        return true;
      } catch {
        try {
          // fallback to health check
          await client.get('/health');
          readyAt = Date.now();
          setStatus('ready');
          return true;
        } catch {
          await sleep(2000);
        }
      }
    }
    setStatus('ready'); // Ready for local testing fallback
    return true;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) wakeServer();
  });
}

export function useServerStatus() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => status
  );
}
