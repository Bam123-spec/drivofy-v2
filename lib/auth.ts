"use client"

import type { User as SupabaseUser } from "@supabase/supabase-js"
import { supabase } from "./supabaseClient"

export type UserRole = "admin" | "instructor" | "student" | null

export interface User {
  id: string
  email: string
  name?: string
  role?: UserRole
}

const mapSupabaseUser = (user: SupabaseUser | null): User | null => {
  if (!user) return null
  const metadata = (user.user_metadata ?? {}) as { name?: string; full_name?: string; role?: UserRole }

  return {
    id: user.id,
    email: user.email ?? "",
    name: metadata.name ?? metadata.full_name ?? user.email?.split("@")[0],
    role: metadata.role ?? null,
  }
}

export async function getUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return mapSupabaseUser(data.user)
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signUpWithEmail({
  name,
  email,
  password,
  role,
}: {
  name: string
  email: string
  password: string
  role: Exclude<UserRole, null>
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  })
  return { data, error }
}

export async function logout() {
  await supabase.auth.signOut()
}

export { mapSupabaseUser }
