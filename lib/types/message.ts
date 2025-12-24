import { Job } from "@/lib/types/job";
import { User } from "@/components/MyProfile";

export interface SendMessageData {
    body: string;
    recipient_id: string;
    jobId: string;
}

export interface SendMessageResponse {
    success: boolean;
    message: string;
    data: any;
}

export interface Messages {
    id: string
    job_id: string
    sender_id: string
    recipient_id: string
    body: string
    created_at: string
    job: Job
    sender: User
    recipient: User
}

export type MessageApiResponse = {
    status: boolean;
    message: string;
    data: {
        messages: {
            items: Messages[];
            page: number;
            page_size: number;
            total_items: number;
            total_pages: number;
        }
    };
};