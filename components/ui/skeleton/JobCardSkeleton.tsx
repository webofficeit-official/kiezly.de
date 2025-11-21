export default function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 animate-pulse flex flex-col justify-between">
      <div>
        <div className="h-4 w-40 bg-gray-200 rounded mb-3"></div>

    
        <div className="h-3 w-24 bg-gray-200 rounded mb-3"></div>

   
        <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>

        <div className="flex gap-2 flex-wrap mt-2">
          <span className="h-5 w-16 bg-gray-200 rounded-full"></span>
          <span className="h-5 w-20 bg-gray-200 rounded-full"></span>
          <span className="h-5 w-14 bg-gray-200 rounded-full"></span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between mt-6 pt-4 border-t border-gray-100">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-200 rounded"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>

        <div className="h-9 w-24 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}
