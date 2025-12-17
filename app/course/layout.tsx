// app/course/layout.tsx
import React from "react";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  // IMPORTANT:
  // Navbar/Footer already rendered in AppShell (root layout).
  // So this layout should NOT render them again, otherwise double navbar appears.
  return <>{children}</>;
}
