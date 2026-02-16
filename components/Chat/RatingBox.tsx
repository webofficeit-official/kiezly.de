import { useEffect, useState } from "react";
import { Star, Send, MessageSquare } from "lucide-react";
import { useT } from "@/app/[locale]/layout";
import { useGetReview, useSubmitReview } from "@/lib/react-query/queries/review";
import toast from "react-hot-toast";

export default function RatingBox({ jobId, revieweeId }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [review, setReview] = useState("");

    const t = useT("inbox")

    const { data, isLoading } = useGetReview(jobId, revieweeId, {
        enabled: !!jobId && !!revieweeId,
    });

    useEffect(() => {
        if (!data?.data?.review) return;

        setRating(data.data.review.rating)
        setReview(data.data.review.comment)
        setAlreadySubmitted(true)
    }, [data])

    const revSub = useSubmitReview();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!rating) return;
        revSub.mutate(
            {
                jobId,
                revieweeId,
                rating,
                comment: review
            },
            {
                onSuccess: () => {
                    setAlreadySubmitted(true)
                    toast.success(t("reviews.success"));
                },
            }
        );
    };

    return (
        <div className="bg-white">
            <form
                className="mx-auto max-w-2xl space-y-4"
            >
                {/* Top Row: Stars and Feedback Label */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                disabled={alreadySubmitted}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                className="transition-transform active:scale-90"
                            >
                                <Star
                                    className={`h-5 w-5 transition-all ${(hover || rating) >= star
                                        ? "fill-black text-black"
                                        : "fill-transparent text-zinc-300"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        {rating > 0 ? `${t("reviews.rating.title")}: ${rating}/5` : t("reviews.rating.empty")}
                    </span>
                </div>

                {/* Input Area: Designed to look like your chat input */}
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder={t("reviews.review.description")}
                            rows={1}
                            disabled={alreadySubmitted}
                            className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-4 pr-10 text-sm transition-all focus:border-black focus:bg-white focus:outline-none focus:ring-0"
                            style={{ minHeight: "44px" }}
                        />
                        <MessageSquare className="absolute right-3 top-3 h-4 w-4 text-zinc-300" />
                    </div>

                    {
                        !alreadySubmitted &&
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!rating}
                            className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white transition-all hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    }
                </div>

                {/* Optional: Minimalist hint */}
                {!rating && (
                    <p className="text-center text-[11px] text-zinc-400">
                        {t("reviews.description")}
                    </p>
                )}
            </form>
        </div>
    );
}