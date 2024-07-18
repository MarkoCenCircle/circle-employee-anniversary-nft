export interface SignUpRequest {
  email: string;
  joinDate: number;
  position?: string;
}

export interface SignUpResponse {
  userId: number;
  email: string;
  joinDate: number;
  firstName: string;
  lastName: string;
  position?: string;

  walletAddress: string;
  isEmailAlreadyVerified: boolean;
}
