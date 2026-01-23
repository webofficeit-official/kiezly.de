import { MessageCircle, Send, X } from "lucide-react";
import { Applicant } from "../job/job-details/applicant-card/applicant-card";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useMemo, useRef, useState } from "react";
import { Job } from "@/lib/types/job";
import { User } from "../MyProfile";
import {
  useGetConversation,
  useSendMessage,
} from "@/lib/react-query/queries/message";
import socket from "@/lib/socket";
import { useT } from "@/app/[locale]/layout";

dayjs.extend(relativeTime);

type MessageProps = {
  title: string;
  subtitle: string;
  receiverId: string;
  jobId: string;
  isOpen: boolean;
  expired: boolean;
  expiredLabel: string;
  onClose: () => void;
};

type Message = {
  id: string;
  job_id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  job: Job;
  sender: User;
  recipient: User;
};

export default function Message({
  isOpen,
  onClose,
  receiverId,
  jobId,
  title,
  subtitle,
  expired,
  expiredLabel
}: MessageProps) {
  if (!isOpen) return null;
  const t = useT("messages");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  const filters = useMemo(() => ({ page, page_size: 10 }), [page]);

  const { data, isLoading } = useGetConversation(jobId, receiverId, filters, {
    enabled: !!jobId && !!receiverId,
  });

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isLoadingOlderRef = useRef(false);

  useEffect(() => {
    if (!receiverId || !isOpen) return;

    let mounted = true;

    const checkStatus = () => {
      socket.emit("check-user-online", receiverId, (online: boolean) => {
        if (mounted) setIsOnline(online);
      });
    };

    // 1️ Initial check
    checkStatus();

    // 2️ Live updates
    const handleOnline = ({ userId }) => {
      if (userId === receiverId) setIsOnline(true);
    };

    const handleOffline = ({ userId }) => {
      if (userId === receiverId) setIsOnline(false);
    };

    // 3️ CRITICAL: re-check after reconnect
    const handleReconnect = () => {
      checkStatus();
    };

    socket.on("user-online", handleOnline);
    socket.on("user-offline", handleOffline);
    socket.io.on("reconnect", handleReconnect);

    return () => {
      mounted = false;
      socket.off("user-online", handleOnline);
      socket.off("user-offline", handleOffline);
      socket.io.off("reconnect", handleReconnect);
    };
  }, [receiverId, isOpen]);

  useEffect(() => {
    if (!data?.data?.messages) return;

    const el = scrollContainerRef.current;
    const prevHeight = el?.scrollHeight ?? 0;

    const { items, page: currentPage, total_pages } = data.data.messages;
    setHasMore(currentPage < total_pages);

    setMessages((prev) => {
      if (currentPage === 1) return items;
      return [...items, ...prev]; // prepend
    });

    setLoadingMore(false);

    //  Preserve scroll ONLY when loading older
    if (isLoadingOlderRef.current && el) {
      requestAnimationFrame(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - prevHeight;
        isLoadingOlderRef.current = false;
      });
    }

    //  Initial load → scroll to bottom
    if (currentPage === 1) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      });
    }
  }, [data]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el || loadingMore || !hasMore) return;

    if (el.scrollTop <= 5) {
      isLoadingOlderRef.current = true; // THIS WAS MISSING
      setLoadingMore(true);
      setPage((p) => p + 1);
    }
  };

  const sendMsg = useSendMessage();

  const formatTime = (date: string) => {
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

  useEffect(() => {
    if (!jobId || !receiverId) return;

    const handleMessage = (msg) => {
      /* =========================
         1️ STRICT JOB FILTER
      ========================= */
      if (msg.job_id !== jobId) return;

      /* =========================
         2️ STRICT USER FILTER
      ========================= */
      const isSameUser =
        msg.sender_id === receiverId ||
        msg.recipient_id === receiverId;

      if (!isSameUser) return;

      /* =========================
         3️ SAFE APPEND
      ========================= */
      setMessages((prev) => [...prev, msg]);

      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [jobId, receiverId]);


  const sendMessage = (e) => {
    e.preventDefault();

    if (!message.trim()) return;
    sendMsg.mutate(
      {
        jobId: jobId,
        recipient_id: receiverId,
        body: message,
      },
      {
        onSuccess: () => {
          setMessage("");
        },
      }
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
          <div className="flex h-[560px] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">{title}</span>
                <span className="text-xs text-muted-foreground">
                  {subtitle}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span
                    className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                  />
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              <button onClick={onClose}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto bg-muted/40 p-4 space-y-4"
            >
              {messages.length === 0 ? (
                <>
                  <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 border-2 border-black rounded-full flex items-center justify-center bg-gray-50">
                      <MessageCircle className="h-8 w-8 text-black" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-black">
                        {t("chat.noMessages")}
                      </h4>
                      <p className="text-[10px] text-black/40 uppercase">
                        {t("chat.startChatting")}
                      </p>
                    </div>
                    {/* Decorative B&W line */}
                    <div className="w-12 h-[1px] bg-black/20" />
                  </div>
                </>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.recipient_id === receiverId
                      ? "justify-end"
                      : "justify-start"
                      }`}
                  >
                    <div className="max-w-[75%]">
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.recipient_id === receiverId
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-white border rounded-bl-sm"
                          }`}
                      >
                        {msg.body}
                      </div>
                      <p
                        className={`mt-1 text-[10px] text-muted-foreground ${msg.recipient_id === receiverId
                          ? "text-right"
                          : "text-left"
                          }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage}>
              <div className="border-t p-3">
                {expired ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 text-gray-600 text-sm py-3">
                    <span>🔒</span>
                    <span>{expiredLabel}</span>
                  </div>
                ) : (
                  <div className="border-t p-3 flex gap-2">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t("chat.messagePlaceholder")}
                      className="flex-1 rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-primary px-4 text-sm text-white hover:bg-primary/90"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
