export default function JobSkeleton({ count = 3 }: { count?: number }) {
      
         
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ---- Left: Filter Sidebar Skeleton ---- */}
        <section className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 space-y-5 animate-pulse">
            {/* Search bar */}
            <div className="h-5 w-24 bg-gray-200 rounded" />
            <div className="h-9 bg-gray-200 rounded-xl" />

            {/* Filters */}
             {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 w-28 bg-gray-200 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-8 bg-gray-200 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}

            {/* Apply + Clear buttons */}
            <div className="flex gap-3 pt-4">
              <div className="h-8 w-20 bg-gray-200 rounded-xl" />
              <div className="h-8 w-16 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </section>

        {/* ---- Right: Job List Skeleton ---- */}
        <section className="lg:col-span-2 space-y-4">
          {/* Top controls */}
          <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between animate-pulse">
            <div className="h-6 w-24 bg-gray-200 rounded" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
          </div>

          {/* Job cards */}
          <div className="flex flex-col gap-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
              >
                {/* Left side: job content */}
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-2/3 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-5/6 bg-gray-200 rounded" />
                </div>

                {/* Right side: action buttons */}
                <div className="flex flex-col justify-between items-end space-y-3">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-8 w-16 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );


  
}
