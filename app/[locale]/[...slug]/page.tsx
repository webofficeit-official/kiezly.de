import { notFound } from "next/navigation";

export default function CatchAll() {
  notFound(); // triggers app/[locale]/not-found.tsx
}
