// NO "use client" here
import NotFoundClient from "./not-found.client";

export default function NotFound() {
  // This file is wrapped by app/[locale]/layout.tsx, so Header/Footer render
  return <NotFoundClient />;
}
