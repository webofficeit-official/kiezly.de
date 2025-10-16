"use client";
import React from "react";

export default function OverlayLoader() {
  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20 rounded-2xl">
      <div className="h-6 w-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
    </div>
  );
}
