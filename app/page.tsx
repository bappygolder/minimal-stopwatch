"use client";

import StopwatchApp from "@/features/stopwatch/components/stopwatch-app";
import { AuthGate } from "@/features/auth/auth-gate";

export default function Page() {
  return (
    <AuthGate>
      {({ user }) => <StopwatchApp userId={user?.id ?? null} />}
    </AuthGate>
  );
}
