"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/app/[locale]/layout";
import { myJobs } from "@/lib/react-query/queries/useJob";
import { Filters } from "./job/myJob";
import { useJobApplicants } from "@/lib/react-query/queries/apply-job";
import { Application } from "@/lib/types/apply-job";
import {
  myInbox,
  useGetConversation,
  useSendMessage,
} from "@/lib/react-query/queries/message";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import socket from "@/lib/socket";
import { Send } from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { Job } from "@/lib/types/job";

dayjs.extend(relativeTime);

// Mock Data Types
type UserType = "client" | "helper";

export default function MyInbox() {
  const t = useT("inbox");
  const { user } = useAuth();
  // 1. Determine user type (In a real app, get this from your Auth/Context)
  const userType: UserType = user?.role; // from auth context
  const [inboxItems, setInboxItems] = useState<any[]>([]);

  const {
    data: jobs,
    isLoading: jobLoading,
    error,
    isFetching,
  } = myJobs({}, { enabled: userType === "client" });

  const { data: inbox } = myInbox({ enabled: userType === "helper" });

  // const dataSource =
  //   userType === "client" ? jobs?.data?.items ?? [] : inbox?.data ?? [];
  useEffect(() => {
    if (userType === "client") {
      setInboxItems(jobs?.data?.items ?? []);
    } else {
      setInboxItems(inbox?.data ?? []);
    }
  }, [jobs, inbox, userType]);

  // 2. Selection State
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: applicants, isLoading } = useJobApplicants({
    jobId: selectedJobId?.toString(),
    page: 1,
    pageSize: 10,
    status: "",
    sort: "asc",
    enabled: user?.role === "client", // <-- include here if your hook supports it
  });
  let jobApplicants = applicants?.applicants ?? [];
  jobApplicants = jobApplicants.filter((a) => {
    return a.status === "shortlisted";
  });

  const [selectedApplicantion, setSelectedApplicantion] =
    useState<Application | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const filters = useMemo(() => ({ page, page_size: 10 }), [page]);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [isRecipientOnline, setIsRecipientOnline] = useState<boolean>(false);

  const { data, isLoading: messageLoading } = useGetConversation(
    selectedJobId,
    recipientId,
    filters,
    {
      enabled:
        userType === "helper"
          ? !!selectedJobId && !!recipientId
          : !!selectedJobId && !!recipientId && !!selectedApplicantion,
    }
  );

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  //   const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isLoadingOlderRef = useRef(false);

  useEffect(() => {
    if (!recipientId) return;

    let mounted = true;

    //  Always ask server for truth (fixes stale state)
    socket.emit("check-user-online", recipientId, (online: boolean) => {
      if (mounted) setIsRecipientOnline(online);
    });

    //  Live online event
    const handleOnline = ({ userId }) => {
      if (userId === recipientId) {
        setIsRecipientOnline(true);
      }
    };

    //  Live offline event
    const handleOffline = ({ userId }) => {
      if (userId === recipientId) {
        setIsRecipientOnline(false);
      }
    };

    //  Re-check after reconnect (VERY IMPORTANT)
    const handleReconnect = () => {
      socket.emit("check-user-online", recipientId, (online: boolean) => {
        if (mounted) setIsRecipientOnline(online);
      });
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
  }, [recipientId]);

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

    // 🧠 Preserve scroll ONLY when loading older
    if (isLoadingOlderRef.current && el) {
      requestAnimationFrame(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - prevHeight;
        isLoadingOlderRef.current = false;
      });
    }
  }, [data]);

  // Remove the handleScroll function since we're not using auto-load anymore

  /* =========================
   ✅ SAFE SCROLL HELPER
   (scrolls messages ONLY)
========================= */
  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
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

  const isJobExpired = (expires_at: string | null): boolean => {
    if (!expires_at) return false;
    return new Date(expires_at).getTime() <= Date.now();
  };

  
//   useEffect(() => {
//   if (!selectedJobId) return;

//   const handleMessage = (msg) => {
//     /* =========================
//        1️ UPDATE OPEN CHAT
//     ========================= */
//     setMessages((prev) => [...prev, msg]);

//     /* =========================
//        2️ UPDATE INBOX ORDER
//        (latest job moves to top)
//     ========================= */
//     setInboxItems((prev) => {
//       const index = prev.findIndex(
//         (item) => item.id === msg.job_id
//       );

//       if (index === -1) return prev;

//       const updatedItem = {
//         ...prev[index],
//         last_message: msg.body,
//         last_message_at: msg.created_at,
//       };

//       const newList = [...prev];
//       newList.splice(index, 1); // remove old position
//       return [updatedItem, ...newList]; // move to top
//     });

//     /* =========================
//        3️ SCROLL SAFELY
//     ========================= */
//     const el = scrollContainerRef.current;
//     if (!el) return;

//     const isNearBottom =
//       el.scrollHeight - el.scrollTop - el.clientHeight < 150;

//     if (isNearBottom && el.scrollHeight > el.clientHeight) {
//       scrollToBottom("smooth");
//     }
//   };

//   socket.on("message", handleMessage);

//   return () => {
//     socket.off("message", handleMessage);
//   };
// }, [selectedJobId]);

useEffect(() => {
  if (!selectedJobId || !recipientId) return;

  const handleMessage = (msg) => {
    /* =========================
       1️⃣ ALWAYS UPDATE INBOX
       (job moves to top)
    ========================= */
    setInboxItems((prev) => {
      const index = prev.findIndex((item) => item.id === msg.job_id);
      if (index === -1) return prev;

      const updatedItem = {
        ...prev[index],
        last_message: msg.body,
        last_message_at: msg.created_at,
      };

      const newList = [...prev];
      newList.splice(index, 1);
      return [updatedItem, ...newList];
    });

    /* =========================
       2️⃣ ONLY UPDATE OPEN CHAT
       (STRICT CHECK)
    ========================= */
    const isSameJob = msg.job_id === selectedJobId;

    const isSameUser =
      msg.sender_id === recipientId ||
      msg.recipient_id === recipientId;

    if (!isSameJob || !isSameUser) {
      // ❌ Message belongs to another job/chat
      return;
    }

    setMessages((prev) => [...prev, msg]);

    /* =========================
       3️⃣ SAFE SCROLL
    ========================= */
    const el = scrollContainerRef.current;
    if (!el) return;

    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 150;

    if (isNearBottom && el.scrollHeight > el.clientHeight) {
      scrollToBottom("smooth");
    }
  };

  socket.on("message", handleMessage);

  return () => {
    socket.off("message", handleMessage);
  };
}, [selectedJobId, recipientId]);

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;

    // Only scroll on FIRST page load
    if (!el || page !== 1) return;

    // Wait for DOM paint
    requestAnimationFrame(() => {
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: "auto",
        });
      }
    });
  }, [messages, page]);

  useEffect(() => {
    if (!selectedJobId || !selectedApplicantion) return;

    setMessages([]);
    setPage(1);
    setHasMore(true);
    isLoadingOlderRef.current = false;
  }, [selectedJobId, selectedApplicantion, recipientId]);

  const sendMessage = (e) => {
    e.preventDefault();

    if (isJobExpired(selectedJob?.expires_at)) return;
    if (!message.trim()) return;
    sendMsg.mutate(
      {
        jobId: selectedJobId,
        recipient_id: recipientId,
        body: message,
      },
      {
        onSuccess: () => {
          setMessage("");
        },
      }
    );
  };

  /* =========================
      HELPER JOB CLICK HANDLER
  ========================== */
  const handleHelperJobSelect = (job) => {
    setSelectedApplicantion(null);
    setSelectedJobId(job.id);
    setRecipientId(job.client_id);
    setSelectedJob(job);
    setMessages([]);
    setPage(1);
    setHasMore(true);
    isLoadingOlderRef.current = false;
  };

  /* =========================
     CLIENT APPLICANT CLICK
  ========================== */
  const handleClientApplicantSelect = (app: Application) => {
    setSelectedJob(null);
    setSelectedJobId(app.job_id);
    setSelectedApplicantion(app);
    setRecipientId(app.user.id);
    setMessages([]);
    setPage(1);
    setHasMore(true);
    isLoadingOlderRef.current = false;
  };

  /* =========================
     LOAD OLDER MESSAGES HANDLER
  ========================== */
  const handleLoadOlderMessages = () => {
    if (loadingMore || !hasMore) return;

    isLoadingOlderRef.current = true;
    setLoadingMore(true);
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* <h1 className="text-3xl font-semibold tracking-tight mb-6">{t("title")}</h1> */}

      <div className="flex h-[700px] w-full overflow-hidden bg-white shadow-sm">
        {/* --- COLUMN 1: Job List (Both Roles) --- */}
        <div className="w-1/4 flex-shrink-0 border-r border-gray-100 bg-white">
          <div className="p-4 border-b font-medium text-sm text-black uppercase tracking-wider">
            {t("inbox_header")}
          </div>
          <div className="overflow-y-auto h-full">
            {inboxItems.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  if (selectedJobId !== d.id) {
                    if (userType === "helper") {
                      handleHelperJobSelect(d);
                    } else {
                      setSelectedJobId(d.id);
                      setSelectedApplicantion(null);
                      setRecipientId(null);
                    }
                  }
                }}
                className={`w-full p-4 text-left border-b transition-colors ${
                  selectedJobId === d.id
                    ? "bg-gray-50 border-r-4 border-r-gray-500"
                    : "hover:bg-gray-100"
                }`}
              >
                <p className="font-semibold text-gray-900">{d.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {[d.city, d.state, d.countries?.name]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* --- COLUMN 2: Applicants (CLIENT ONLY) --- */}
        {userType === "client" && (
          <div className="w-1/4 flex-shrink-0 border-r border-gray-100">
            <div className="p-4 border-b font-medium text-sm text-black uppercase tracking-wider">
              {t("applications_header")}
            </div>
            {selectedJobId ? (
              <div className="overflow-y-auto h-full">
                {jobApplicants.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-6 text-center text-gray-400 text-sm">
                    {t("empty_inbox.no_applicants.title")}
                  </div>
                ) : (
                  jobApplicants?.map((a: Application, i) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        if (a.id !== selectedApplicantion?.id) {
                          handleClientApplicantSelect(a);
                        }
                      }}
                      className={`w-full p-4 text-left border-b transition-colors ${
                        selectedApplicantion?.id === a.id
                          ? "bg-gray-100 border-r-4 border-r-gray-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold">
                          {a.user.first_name.charAt(0)}
                          {a.user.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {a.user.first_name} {a.user.last_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {a.user.email}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-gray-400 text-sm">
                {t("select_job_message")}
              </div>
            )}
          </div>
        )}

        {/* --- COLUMN 3: Chat Window (Dynamic Width) --- */}
        <div
          key={`${selectedJobId}-${recipientId}`}
          className="flex-grow flex flex-col bg-white"
          // style={{ height: "85%" }}
        >
          {(userType === "helper" && selectedJobId) ||
          (userType === "client" && selectedApplicantion) ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {userType === "client"
                      ? `${selectedApplicantion.user.first_name} ${selectedApplicantion.user.last_name} / ${selectedApplicantion.proposed_rate}`
                      : userType === "helper"
                      ? selectedJob?.title
                      : "Client"}
                  </h3>
                  {userType === "client" && (
                    <div
                      className="font-medium text-xs text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: selectedApplicantion.cover_note,
                      }}
                    />
                  )}
                  {userType === "helper" && (
                    <p className="text-xs text-gray-500 mt-1">
                      {[
                        selectedJob.city,
                        selectedJob.state,
                        selectedJob.countries?.name,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>

                {recipientId && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isRecipientOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    {isRecipientOnline ? "Online" : "Offline"}
                  </div>
                )}
              </div>

              {/* Chat Messages */}
              <div
                ref={scrollContainerRef}
                className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50/30"
                // Removed onScroll handler since we're using button now
              >
                {/* Load Older Messages Button */}
                {hasMore && (
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={handleLoadOlderMessages}
                      disabled={loadingMore}
                      className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore
                        ? t("chat.loading_older")
                        : t("chat.load_older")}
                    </button>
                  </div>
                )}

                {/* Messages List */}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.recipient_id === recipientId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div className="max-w-[75%]">
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          msg.recipient_id === recipientId
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-white border rounded-bl-sm"
                        }`}
                      >
                        {msg.body}
                      </div>
                      <p
                        className={`mt-1 text-[10px] text-muted-foreground ${
                          msg.recipient_id === recipientId
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={sendMessage}>
                <div className="border-t p-3 flex gap-2">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      isJobExpired(selectedJob?.expires_at)
                        ? t("chat.job_expired")
                        : t("chat.message_placeholder")
                    }
                    className="flex-1 rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isJobExpired(selectedJob?.expires_at)}
                  />
                  {!isJobExpired(selectedJob?.expires_at) && (
                    <button
                      type="submit"
                      className="rounded-xl bg-primary px-4 text-sm text-white hover:bg-primary/90"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <svg
                className="w-12 h-12 mb-4 opacity-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p>
                {userType === "client"
                  ? `${t("chat.select_applicant")}`
                  : `${t("chat.select_job")}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
