"use client";

import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type Message = {
  text: string;
  sender: "user" | "other";
  createdAt: Date;
};

type ChatModalProps = {
  canOpen: boolean;
  recipientName: string;
  recipientEmail: string;
};

export default function ChatModal({
  canOpen,
  recipientName,
  recipientEmail,
}: ChatModalProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  // Dummy messages
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi, I saw your job post and I'm interested.",
      sender: "other",
      createdAt: dayjs().subtract(1, "day").toDate(),
    },
    {
      text: "Hello! Thanks for reaching out.",
      sender: "user",
      createdAt: dayjs().subtract(1, "day").add(5, "minute").toDate(),
    },
    {
      text: "Can you share your experience related to this job?",
      sender: "other",
      createdAt: dayjs().subtract(1, "day").add(15, "minute").toDate(),
    },
    {
      text: "Sure, I have over 3 years of experience working on similar projects.",
      sender: "user",
      createdAt: dayjs().subtract(1, "day").add(30, "minute").toDate(),
    },
    {
      text: "That sounds great. Are you available to start this week?",
      sender: "other",
      createdAt: new Date(),
    },
  ]);

  if (!canOpen) return null;

  const formatTime = (date: Date) => {
    const now = dayjs();
    const msgDate = dayjs(date);

    if (msgDate.isSame(now, "day")) {
      return `Today ${msgDate.format("hh:mm A")}`;
    }
    if (msgDate.isSame(now.subtract(1, "day"), "day")) {
      return `Yesterday ${msgDate.format("hh:mm A")}`;
    }
    return msgDate.format("DD MMM YYYY");
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        text: message,
        sender: "user",
        createdAt: new Date(),
      },
    ]);
    setMessage("");
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-white shadow-xl hover:bg-primary/90"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Chat</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
          <div className="flex h-[560px] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">
                  {recipientName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {recipientEmail}
                </span>
              </div>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-muted/40 p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="max-w-[75%]">
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        msg.sender === "user"
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-white border rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p
                      className={`mt-1 text-[10px] text-muted-foreground ${
                        msg.sender === "user"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t p-3 flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={sendMessage}
                className="rounded-xl bg-primary px-4 text-sm text-white hover:bg-primary/90"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
