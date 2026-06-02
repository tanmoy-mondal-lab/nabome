export type Role = "customer" | "vendor" | "admin";

export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

export type AuthUser = {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: Role;
  vendorStatus?: VendorStatus;
  createdAt: string;
};

export type LoginCredentials = {
  email?: string;
  phone?: string;
  password: string;
};

export type CustomerRegisterData = {
  name: string;
  phone: string;
  email?: string;
  gender: string;
  password: string;
};

export type VendorRegisterData = {
  ownerName: string;
  businessName: string;
  shopName: string;
  shopCategory: string;
  phone: string;
  email: string;
  password: string;
  businessAddress: string;
};

export type AuthResult = {
  success: boolean;
  user?: AuthUser;
  error?: string;
};

export type PasswordValidation = {
  valid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong" | "very-strong";
};
