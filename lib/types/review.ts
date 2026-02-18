import { UserProfile } from "@/components/MyProfile";
import { Job } from "./job";

export interface Review {
  id: number;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  visibility: boolean;
  created_at: Date;
  reviewee: UserProfile;
  reviewer: UserProfile;
  job: Job;
}

export interface SubmitReviewData {
    comment: string;
    rating: number;
    jobId: string;
    revieweeId: string;
}

export interface SubmitReviewResponse {
    success: boolean;
    message: string;
    data: any;
}

export type ReviewApiResponse = {
    status: boolean;
    message: string;
    data: {
        review?: Review
    };
};

export type UserReviewApiResponse = {
    status: boolean;
    message: string;
    data: {
        items?: Review[]
        rating?: number
        page?: number
        page_size?: number
        total_items?: number
        total_pages?: number
    };
};