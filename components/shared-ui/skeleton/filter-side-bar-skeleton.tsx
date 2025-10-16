"use client";
import React from "react";

export default function FilterSidebarSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4 animate-pulse">
      <div className="h-5 w-1/3 bg-gray-200 rounded" />
      <div className="h-10 w-full bg-gray-200 rounded" />
      <div className="h-5 w-1/2 bg-gray-200 rounded mt-4" />
      <div className="h-5 w-2/3 bg-gray-200 rounded" />
      <div className="h-5 w-1/4 bg-gray-200 rounded" />
      <div className="h-10 w-full bg-gray-200 rounded" />
      <div className="h-5 w-2/3 bg-gray-200 rounded" />
      <div className="h-5 w-1/2 bg-gray-200 rounded" />
      <div className="h-5 w-1/3 bg-gray-200 rounded" />
    </div>
  );
}
