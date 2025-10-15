export interface Notification {
  id: number;
  title: string;
  description: string;
  link: string;
  status: boolean; // true = viewed
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[]
  };
}