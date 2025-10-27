"use client"

import { io } from "socket.io-client";

const userId = localStorage.getItem("kUId") || null;

const socket = io(process.env.NEXT_PUBLIC_BE_URL, {
    auth: {
        userId
    }
}); // backend URL

export default socket;
