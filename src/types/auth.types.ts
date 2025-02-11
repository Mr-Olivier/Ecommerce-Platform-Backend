// // src/types/auth.types.ts
// export type UserRole = "ADMIN" | "CUSTOMER";

// export interface RegisterDTO {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   password: string;
//   confirmPassword: string;
//   role: UserRole;
// }

// export interface LoginDTO {
//   email: string;
//   password: string;
// }

// export interface ChangePasswordDTO {
//   currentPassword: string;
//   newPassword: string;
// }

// export interface AuthResponse {
//   token: string;
//   user: {
//     id: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//     phoneNumber: string;
//     role: UserRole;
//   };
// }

// src/types/auth.types.ts
export type UserRole = "ADMIN" | "CUSTOMER";

export type TokenType = "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "OTP";

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailDTO {
  token: string;
}

export interface MfaDTO {
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: UserRole;
    isEmailVerified: boolean;
    isMfaEnabled: boolean;
  };
}

export interface SessionInfo {
  id: string;
  device: string;
  location?: string;
  ip: string;
  lastUsed: Date;
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}
