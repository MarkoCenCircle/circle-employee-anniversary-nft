export interface SignUpRequest {
  email: string;
  joinDate: number;
  position?: string;
}

export interface SignUpResponse {
  userId: number;
  email: string;
  walletAddress: string;
  joinDate: number;
  isEmailAlreadyVerified: boolean;
}
