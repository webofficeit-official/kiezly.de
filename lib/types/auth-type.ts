export type ForgotPasswordData = { email: string };
export type ForgotPasswordResponse = { success: boolean; message: string };

export type VerifyResetParams = { id: string | number; token: string };
export type VerifyResetResponse = { success: boolean; message: string };

export type ResetPasswordData = { id: string | number; token: string; password: string };
export type ResetPasswordResponse = { success: boolean; message: string };