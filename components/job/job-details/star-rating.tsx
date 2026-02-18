import { Star } from "lucide-react";

export function StarRating({ rating, size = 4 }: { rating: number, size: number }) {
  return (
    <div className="flex items-center gap-1 text-yellow-500">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = rating >= star;

        const decimal = rating - Math.floor(rating);
        const isPartial =
          rating < star && rating > star - 1;

        const widthPercentage = Math.round(decimal * 5) * 20;

        return (
          <div key={star} className="relative">
            {/* Empty Star */}
            <Star className={`h-${size} w-${size} text-gray-300`} />

            {/* Full Star */}
            {isFull && (
              <Star className={`absolute top-0 left-0 h-${size} w-${size} fill-yellow-500 text-yellow-500`} />
            )}

            {/* Partial Star */}
            {isPartial && decimal > 0 && (
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: `${widthPercentage}%` }}
              >
                <Star className={`h-${size} w-${size} fill-yellow-500 text-yellow-500`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
