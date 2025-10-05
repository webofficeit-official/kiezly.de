import { useEffect } from 'react';
import { addJobAsFavorite } from '../react-query/api-handler/job-save-api';

const LOCAL_STORAGE_KEY = 'saved-jobs';

export const useSyncFavoritesOnLogin = (user) => {
    useEffect(() => {
        if (user) {
            // User just logged in
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
                let localFavs: Array<{ id: string }> = [];
                try {
                    localFavs = JSON.parse(stored);
                } catch {
                    console.error('Invalid saved jobs format in localStorage');
                    return;
                }

                localFavs.forEach(job => console.log('job.id:', job.id));

                Promise.all(
                    localFavs.map(job => addJobAsFavorite({ jobId: job.id }))   // <- just the UUID string
                )
                    .then(() => {
                        localStorage.removeItem(LOCAL_STORAGE_KEY);
                    })
                    .catch(err => {
                        console.error('Failed to sync favorites', err);
                    });
            }
        }
    }, [user]);
};
