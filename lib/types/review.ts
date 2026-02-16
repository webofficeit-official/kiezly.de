export interface Review {
  id: number;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  visibility: boolean;
  created_at: Date;
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