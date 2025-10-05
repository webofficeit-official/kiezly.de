'use client'

import { useEffect } from 'react';
import { addJobAsFavorite } from '../react-query/api-handler/job-save-api';
import { useSavedJobs } from '../react-query/queries/useJob';

const LOCAL_STORAGE_KEY = 'saved-jobs';

export const useSyncFavoritesOnLogin = (user) => {
    const { data: savedJobsData, isSuccess } = useSavedJobs();

    useEffect(() => {
        if (!user || !isSuccess) return;

        // Get local jobs from localStorage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!stored) return;

        let localFavs: Array<{ id: string }> = [];
        try {
            localFavs = JSON.parse(stored);
        } catch {
            console.error('Invalid saved jobs format in localStorage');
            return;
        }

        if (localFavs.length === 0) return;

        // Filter jobs that already exist in backend
        const jobsAlreadySaved = localFavs.filter(localJob =>
            savedJobsData?.jobs?.some(saved => saved.id === localJob.id)
        );

        // Remove duplicates immediately from localStorage
        let remainingJobs = localFavs.filter(
            localJob => !savedJobsData?.jobs?.some(saved => saved.id === localJob.id)
        );

        if (remainingJobs.length === 0) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            return; // nothing left to sync
        }

        // Save remaining jobs back to localStorage before syncing
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remainingJobs));

        // Sync remaining jobs to backend
        Promise.all(
            remainingJobs.map(job => addJobAsFavorite({ jobId: job.id }))
        )
        .then(() => {
            // Successfully synced: remove from localStorage
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        })
        .catch(err => {
            console.error('Failed to sync favorites', err);
            // Failed jobs remain in localStorage
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remainingJobs));
        });

    }, [user, isSuccess, savedJobsData]);
};
