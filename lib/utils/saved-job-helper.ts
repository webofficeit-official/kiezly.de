'use client';

import { useEffect, useRef, useMemo } from 'react';
import { addJobAsFavorite } from '../react-query/api-handler/job-save-api';
import apiClient from '@/lib/config/axios-client';
import { useSavedJobsWhileLogin } from '../react-query/queries/useJob';

const LOCAL_STORAGE_KEY = 'saved-jobs';

type SavedJob = { id: string };
type UserLike = { id?: string; role?: string } | null | undefined;

// Helper: best-effort check for a token in a few common places
function hasAccessToken(): boolean {
  // 1) axios default Authorization header
  const authHeader = apiClient?.defaults?.headers?.common?.Authorization;
  if (typeof authHeader === 'string' && authHeader.trim().toLowerCase().startsWith('bearer ')) {
    return true;
  }

  // 2) localStorage (if you store it there)
  try {
    const lsToken = localStorage.getItem('accessToken');
    if (lsToken && lsToken.length > 0) return true;
  } catch {}

  // 3) cookie (if you store it there; httpOnly cookies won’t be readable on client)
  try {
    const cookie = document.cookie || '';
    if (cookie.split('; ').some((c) => c.startsWith('accessToken='))) return true;
  } catch {}

  return false;
}

export const useSyncFavoritesOnLogin = (user: UserLike) => {
  // Only allow syncing when we have a token AND a role AND a user
  const canSync = useMemo(() => Boolean(user && user.role && hasAccessToken()), [user]);

  // Only fetch saved jobs when we actually can sync (prevents unauthorized calls)
  const { data: savedJobsData, isSuccess } = useSavedJobsWhileLogin({ enabled: canSync });

  // Avoid syncing twice for the same user id in one session
  const syncedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!canSync || !isSuccess || !user?.id) return;
    if (syncedForUser.current === user.id) return; // already synced this user once
    syncedForUser.current = user.id;

    // 1) Read and parse localStorage
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return;

    let localFavs: SavedJob[] = [];
    try {
      localFavs = JSON.parse(stored);
    } catch {
      console.error('Invalid saved jobs format in localStorage');
      return;
    }
    if (!Array.isArray(localFavs) || localFavs.length === 0) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return;
    }

    // 2) Compute which are already saved in backend
    const backendIds = new Set<string>(
      (savedJobsData?.jobs ?? []).map((j: { id: string }) => j.id)
    );

    const alreadySaved = localFavs.filter((j) => backendIds.has(j.id));
    const toSync = localFavs.filter((j) => !backendIds.has(j.id));

    // 3) Remove duplicates immediately from localStorage
    if (alreadySaved.length > 0) {
      if (toSync.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toSync));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }

    // If nothing left to sync after removing duplicates, we're done
    if (toSync.length === 0) return;

    // 4) Sync remaining jobs to backend with partial success handling
    (async () => {
      const results = await Promise.allSettled(
        toSync.map((job) => addJobAsFavorite({ jobId: job.id }))
      );

      // Treat conflicts/duplicates as success if your API may respond 409 for already-added
      // If addJobAsFavorite throws structured errors, you can inspect and decide here.

      const failed: SavedJob[] = [];
      results.forEach((res, idx) => {
        if (res.status === 'rejected') {
          // Keep only the ones that actually failed
          failed.push(toSync[idx]);
        }
      });

      // 5) Update localStorage:
      // - If all succeeded, remove the key
      // - If some failed, keep only the failed ones for retry later
      if (failed.length === 0) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(failed));
      }
    })().catch((err) => {
      // In case the whole batch blew up unexpectedly, keep current toSync for a later retry
      console.error('Failed to sync favorites (batch)', err);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toSync));
    });
  }, [canSync, isSuccess, savedJobsData, user]);
};
