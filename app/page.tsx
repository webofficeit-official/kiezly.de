"use client"

import { redirect } from "next/navigation";

const locale = localStorage.getItem("locale")

export default function Page() {
  
  redirect(locale ? `/${locale}` : "/en");
}
