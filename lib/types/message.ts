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