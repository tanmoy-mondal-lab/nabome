import type { AuthUser, LoginCredentials, CustomerRegisterData, VendorRegisterData, AuthResult, PasswordValidation, Role } from "../types/auth";

const STORAGE_KEY = "nabome-auth-users";
const SESSION_KEY = "nabome-auth-session";

interface StoredUser {
  id: string;
  email: string;
  phone: string;
  name: string;
  passwordHash: string;
  role: Role;
  vendorStatus?: "pending" | "approved" | "rejected" | "suspended";
  createdAt: string;
}

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return "mock_" + Math.abs(hash).toString(36);
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function generateId(): string {
  return "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);
}

let adminSeeded = false;

export function seedAdmin() {
  if (adminSeeded) return;
  const users = getUsers();
  const existing = users.find((u) => u.role === "admin");
  if (!existing) {
    users.push({
      id: "admin_default",
      email: "nabome@admin.com",
      phone: "0000000000",
      name: "Super Admin",
      passwordHash: hashPassword("Admin@123"),
      role: "admin",
      createdAt: new Date().toISOString(),
    });
    saveUsers(users);
  }
  adminSeeded = true;
}

export function getAllUsers(): StoredUser[] {
  return getUsers();
}

export function loginMock(credentials: LoginCredentials): AuthResult {
  const users = getUsers();
  const user = users.find((u) => {
    if (credentials.email) return u.email.toLowerCase() === credentials.email.toLowerCase();
    if (credentials.phone) return u.phone === credentials.phone;
    return false;
  });

  if (!user) {
    return { success: false, error: "No account found with that email or phone." };
  }

  const inputHash = hashPassword(credentials.password);
  if (user.passwordHash !== inputHash) {
    return { success: false, error: "Incorrect password. Try again." };
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    role: user.role,
    vendorStatus: user.vendorStatus,
    createdAt: user.createdAt,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
  return { success: true, user: authUser };
}

export function registerCustomerMock(data: CustomerRegisterData): AuthResult {
  const users = getUsers();

  const phoneExists = users.find((u) => u.phone === data.phone);
  if (phoneExists) {
    return { success: false, error: "Phone number already registered." };
  }

  const emailVal = data.email;
  const emailExists = emailVal ? users.find((u) => u.email.toLowerCase() === emailVal.toLowerCase()) : undefined;
  if (emailExists) {
    return { success: false, error: "Email already registered." };
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.valid) {
    return { success: false, error: passwordResult.errors.join(" ") };
  }

  const newUser: StoredUser = {
    id: generateId(),
    email: data.email || `${data.phone}@placeholder.nabome`,
    phone: data.phone,
    name: data.name,
    passwordHash: hashPassword(data.password),
    role: "customer",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const authUser: AuthUser = {
    id: newUser.id,
    email: newUser.email,
    phone: newUser.phone,
    name: newUser.name,
    role: "customer",
    createdAt: newUser.createdAt,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
  return { success: true, user: authUser };
}

export function registerVendorMock(data: VendorRegisterData): AuthResult {
  const users = getUsers();

  const emailExists = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (emailExists) {
    return { success: false, error: "Email already registered." };
  }

  const phoneExists = users.find((u) => u.phone === data.phone);
  if (phoneExists) {
    return { success: false, error: "Phone number already registered." };
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.valid) {
    return { success: false, error: passwordResult.errors.join(" ") };
  }

  const newUser: StoredUser = {
    id: generateId(),
    email: data.email,
    phone: data.phone,
    name: data.ownerName,
    passwordHash: hashPassword(data.password),
    role: "vendor",
    vendorStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const authUser: AuthUser = {
    id: newUser.id,
    email: newUser.email,
    phone: newUser.phone,
    name: newUser.name,
    role: "vendor",
    vendorStatus: "pending",
    createdAt: newUser.createdAt,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
  return { success: true, user: authUser };
}

export function logoutMock() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function forgotPasswordMock(email: string): boolean {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return false;

  const token = "reset_" + Math.random().toString(36).substring(2, 10);
  localStorage.setItem("nabome-reset-token", JSON.stringify({ email: user.email, token, expires: Date.now() + 3600000 }));
  return true;
}

export function resetPasswordMock(token: string, newPassword: string): boolean {
  const stored = localStorage.getItem("nabome-reset-token");
  if (!stored) return false;

  try {
    const data = JSON.parse(stored);
    if (data.token !== token || Date.now() > data.expires) {
      localStorage.removeItem("nabome-reset-token");
      return false;
    }

    const users = getUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (idx === -1) return false;

    users[idx].passwordHash = hashPassword(newPassword);
    saveUsers(users);
    localStorage.removeItem("nabome-reset-token");
    return true;
  } catch {
    return false;
  }
}

export function changePasswordMock(userId: string, oldPassword: string, newPassword: string): boolean {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;

  if (users[idx].passwordHash !== hashPassword(oldPassword)) {
    return false;
  }

  users[idx].passwordHash = hashPassword(newPassword);
  saveUsers(users);
  return true;
}

export function updateProfileMock(userId: string, data: Partial<Pick<AuthUser, "name" | "phone">>): boolean {
  const session = getSession();
  if (!session || session.id !== userId) return false;

  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;

  if (data.name) users[idx].name = data.name;
  if (data.phone) users[idx].phone = data.phone;
  saveUsers(users);

  const updated = { ...session, ...data };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return true;
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("At least 8 characters.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("One uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("One lowercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("One number.");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("One special character.");
  }

  const score = [password.length >= 8, password.length >= 12, /[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const strength: "weak" | "medium" | "strong" | "very-strong" = score <= 2 ? "weak" : score <= 3 ? "medium" : score <= 5 ? "strong" : "very-strong";

  return { valid: errors.length === 0, errors, strength };
}

seedAdmin();
