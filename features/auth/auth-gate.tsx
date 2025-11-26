'use client';

import type { ReactNode } from "react";

export type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  // Supabase auth has been removed; this component now simply
  // renders its children without any gating.
  return <>{children}</>;
}
