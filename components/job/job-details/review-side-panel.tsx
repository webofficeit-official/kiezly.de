import { Badge } from "@/components/ui/badge";
import { MoveLeft, X } from "lucide-react";
import { StarRating } from "./star-rating";

export function ReviewSidePanel({ onClose }: { onClose: () => void }) {
    const userRating = [
        {
            org_name: "Weboffice Infotech",
            rating: 4.2,
            comment: "Delivered quality work on time and maintained good communication throughout the project.",
            image: "http://localhost:4000/uploads/profile_pic/9f401e79-3e35-4e0c-a99e-69e7596c5fb7/1760329371019-220591644.jpeg"
        },
        {
            org_name: "Tata Consultancy Services",
            rating: 5,
            comment: "Exceptional performance. Very professional and exceeded expectations in every aspect.",
            image: "http://localhost:4000/uploads/profile_pic/9f401e79-3e35-4e0c-a99e-69e7596c5fb7/1760329371019-220591644.jpeg"
        },
        {
            org_name: "Infosys Ltd",
            rating: 4.6,
            comment: "Quick learner and handled responsibilities efficiently. Would definitely collaborate again.",
            image: "http://localhost:4000/uploads/profile_pic/9f401e79-3e35-4e0c-a99e-69e7596c5fb7/1760329371019-220591644.jpeg"
        },
        {
            org_name: "Wipro Technologies",
            rating: 3.8,
            comment: "Completed the work satisfactorily, though minor improvements in response time would help.",
            image: "http://localhost:4000/uploads/profile_pic/9f401e79-3e35-4e0c-a99e-69e7596c5fb7/1760329371019-220591644.jpeg"
        },
        {
            org_name: "Zoho Corporation",
            rating: 4.9,
            comment: "Highly dedicated and detail-oriented. The final output was polished and well-structured.",
            image: "http://localhost:4000/uploads/profile_pic/9f401e79-3e35-4e0c-a99e-69e7596c5fb7/1760329371019-220591644.jpeg"
        },
        {
            org_name: "Freshworks",
            rating: 4.4,
            comment: "Strong technical skills and clear communication. Met all deadlines successfully.",
            image: "http://localhost:4000/uploads/profile_pic/9f401e79-3e35-4e0c-a99e-69e7596c5fb7/1760329371019-220591644.jpeg"
        },
        {
            org_name: "HCL Technologies",
            rating: 3.9,
            comment: "Good effort and commitment shown throughout the engagement.",
            image: "http://localhost:4000/uploads/profile_pic/9f401e79-3e35-4e0c-a99e-69e7596c5fb7/1760329371019-220591644.jpeg"
        },
        {
            org_name: "Tech Mahindra",
            rating: 4.7,
            comment: "Proactive and solution-focused. Helped streamline several key tasks efficiently.",
            image: "http://localhost:4000/uploads/profile_pic/9f401e79-3e35-4e0c-a99e-69e7596c5fb7/1760329371019-220591644.jpeg"
        },
        {
            org_name: "Capgemini India",
            rating: 4.1,
            comment: "Very cooperative and adaptable. Delivered results aligned with our requirements.",
            image: "http://localhost:4000/uploads/profile_pic/9f401e79-3e35-4e0c-a99e-69e7596c5fb7/1760329371019-220591644.jpeg"
        },
        {
            org_name: "Cognizant Technology Solutions",
            rating: 4.8,
            comment: "Outstanding collaboration experience. Work quality and professionalism were top-notch.",
            image: "http://localhost:4000/uploads/profile_pic/9f401e79-3e35-4e0c-a99e-69e7596c5fb7/1760329371019-220591644.jpeg"
        }
    ];

    return (
        <>
            {/* Desktop Right Panel */}
            <div className="hidden md:block w-full h-full p-6 overflow-y-auto">

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-zinc-900">Reviews</h2>

                    <Badge
                      variant="outline"
                      className="rounded-full px-3 py-1 text-zinc-500 border-zinc-200"
                    >
                      {userRating.length} Total
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <MoveLeft className="h-6 w-6 text-black-300 border border-gray-200 cursor-pointer rounded-lg pl-1 pr-1" onClick={onClose} />
                  </div>
                </div>

                <div className="h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex flex-col gap-6">
                    {userRating?.map((ur, i) => (
                      <div key={i} className="group flex gap-4 border-b border-zinc-100 pb-6 last:border-0">
                        {/* Avatar - Smaller and cleaner */}
                        <div className="relative h-12 w-12 flex-shrink-0">
                          <img
                            src={ur.image}
                            alt={ur.org_name}
                            className="h-12 w-12 rounded-full object-cover grayscale transition group-hover:grayscale-0"
                          />
                          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm">
                            <span className="text-[10px] font-bold text-black">{ur.rating}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-zinc-900">{ur.org_name}</h3>
                            <StarRating rating={ur.rating} size={3} />
                          </div>

                          <div className="relative">
                            <p className="text-sm leading-relaxed text-zinc-600 italic">
                              "{ur.comment}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            <div className="md:hidden fixed inset-0 bg-white z-[60] p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-zinc-900">Reviews</h2>

                    <Badge
                      variant="outline"
                      className="rounded-full px-3 py-1 text-zinc-500 border-zinc-200"
                    >
                      {userRating.length} Total
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <X className="h-6 w-6 text-black-300 border border-gray-200 cursor-pointer rounded-lg" onClick={onClose} />
                  </div>
                </div>

                <div className="h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex flex-col gap-6">
                    {userRating?.map((ur, i) => (
                      <div key={i} className="group flex gap-4 border-b border-zinc-100 pb-6 last:border-0">
                        {/* Avatar - Smaller and cleaner */}
                        <div className="relative h-12 w-12 flex-shrink-0">
                          <img
                            src={ur.image}
                            alt={ur.org_name}
                            className="h-12 w-12 rounded-full object-cover grayscale transition group-hover:grayscale-0"
                          />
                          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm">
                            <span className="text-[10px] font-bold text-black">{ur.rating}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-zinc-900">{ur.org_name}</h3>
                            <StarRating rating={ur.rating} size={3} />
                          </div>

                          <div className="relative">
                            <p className="text-sm leading-relaxed text-zinc-600 italic">
                              "{ur.comment}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
        </>
    );
}
