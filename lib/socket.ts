"use client"

import { io } from "socket.io-client";

let socket = null;

if (typeof window !== "undefined") {
    const userId = localStorage.getItem("kUId") || null;

    socket = io(process.env.NEXT_PUBLIC_BE_URL, {
        auth: { userId },
    });
}

export default socket;