export default function JobSkeleton({ count = 3 }: { count?: number }) {
  return (
    <section className="lg:col-span-2 space-y-4">
      {" "}
      {/* Job cards */}
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-3">
            <div className="h-5 w-2/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
        </div>
        {Array.from({ length: count }).map((_, i) => (
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
  );
}
