/* ─── JWT Auth Utilities ─── */
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

const JWT_SECRET = process.env.JWT_SECRET || "softly-golf-secret-key-2026";
const TOKEN_NAME = "softly_token";
const TOKEN_EXPIRY = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "subscriber" | "admin";
}

/** Hash a plaintext password */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Compare plaintext with hash */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Sign a JWT token */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/** Verify and decode a JWT token */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/** Set auth cookie */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/** Remove auth cookie */
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

/** Get current user from cookie — returns null if not authenticated */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;

  // Verify user still exists and fetch fresh data
  const db = createServerClient();
  const { data: user } = await db
    .from("users")
    .select("id, name, email, role, avatar, created_at")
    .eq("id", payload.userId)
    .single();

  if (!user) return null;

  // Fetch subscription
  const { data: subscription } = await db
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Fetch charity selection
  const { data: userCharity } = await db
    .from("user_charities")
    .select("charity_id, percentage")
    .eq("user_id", user.id)
    .single();

  return {
    ...user,
    subscription: subscription || null,
    charity: userCharity || null,
  };
}

/** Require authentication — throws if not logged in */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/** Require admin role */
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}
