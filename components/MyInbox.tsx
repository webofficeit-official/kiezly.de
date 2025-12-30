"use client";
import { useEffect, useMemo, useRef, useState } from "react";
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

dayjs.extend(relativeTime);

// Mock Data Types
type UserType = "client" | "helper";

export default function MyInbox() {
  const t = useT("inbox");
  const { user } = useAuth();
  // 1. Determine user type (In a real  app, get this from your Auth/Context)
  const userType: UserType = user?.role; // from auth context

  const {
    data: jobs,
    isLoading: jobLoading,
    error,
    isFetching,
  } = myJobs({}, { enabled: userType === "client" });

  const { data: inbox } = myInbox({ enabled: userType === "helper" });

  const dataSource =
    userType === "client" ? jobs?.data?.items ?? [] : inbox?.data ?? [];
  console.log("inbox data", dataSource);

  // 2. Selection State
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const { data: applicants, isLoading } = useJobApplicants({
    jobId: selectedJobId?.toString(),
    page: 1,
    pageSize: 10,
    status: "",
    sort: "asc",
    enabled: user?.role === "client", // <-- include here if your hook supports it
  });
  const jobApplicants = applicants?.applicants ?? [];

  const [selectedApplicantion, setSelectedApplicantion] =
    useState<Application | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const filters = useMemo(() => ({ page, page_size: 10 }), [page]);
  const [recipientId, setRecipientId] = useState<string | null>(null);

  const { data, isLoading: messageLoading } = useGetConversation(
    selectedJobId,
    recipientId,
    filters,
    { enabled: !!selectedJobId && !!recipientId }
  );

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isLoadingOlderRef = useRef(false);

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

    // ✅ Initial load → scroll to bottom
    if (currentPage === 1) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 0);
    }
  }, [data]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el || loadingMore || !hasMore) return;

    if (el.scrollTop <= 5) {
      isLoadingOlderRef.current = true; // 🔥 THIS WAS MISSING
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
    if (!selectedJobId) return;

    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);

      const el = scrollContainerRef.current;
      if (!el) return;

      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 150;

      if (isNearBottom) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 0);
      }
    });

    return () => socket.off("message");
  }, [selectedJobId]);

  useEffect(() => {
    if (!selectedJobId || !selectedApplicantion) return;

    setMessages([]);
    setPage(1);
    setHasMore(true);
    isLoadingOlderRef.current = false;
  }, [selectedJobId,selectedApplicantion, recipientId]);

  const sendMessage = (e) => {
    e.preventDefault();

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
  };

  /* =========================
     CLIENT APPLICANT CLICK
  ========================== */
  const handleClientApplicantSelect = (app: Application) => {
    setSelectedJobId(app.job_id);
    setSelectedApplicantion(app);
    setRecipientId(app.user.id);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* <h1 className="text-3xl font-semibold tracking-tight mb-6">{t("title")}</h1> */}

      <div className="flex h-[700px] w-full overflow-hidden bg-white shadow-sm">
        {/* --- COLUMN 1: Job List (Both Roles) --- */}
        <div className="w-1/4 flex-shrink-0 border-r border-gray-100 bg-white">
          <div className="p-4 border-b font-medium text-sm text-black uppercase tracking-wider">
            My Jobs
          </div>
          <div className="overflow-y-auto h-full">
            {dataSource.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  if (userType === "helper") {
                    handleHelperJobSelect(d);
                  } else {
                    setSelectedJobId(d.id);
                    setSelectedApplicantion(null);
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
              Applicants
            </div>
            {selectedJobId ? (
              <div className="overflow-y-auto h-full">
                {jobApplicants.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-6 text-center text-gray-400 text-sm">
                    No applicants yet for this job
                  </div>
                ) : (
                  jobApplicants?.map((a: Application, i) => (
                    <button
                      key={a.id}
                      onClick={() => handleClientApplicantSelect(a)}
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
                Select a job to view applicants
              </div>
            )}
          </div>
        )}

        {/* --- COLUMN 3: Chat Window (Dynamic Width) --- */}
        <div  key={`${selectedJobId}-${recipientId}`} className="flex-grow flex flex-col bg-white">
          {(userType === "helper" && selectedJobId) ||
          (userType === "client" && selectedApplicantion) ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {userType === "client"
                      ? `${selectedApplicantion.user.first_name} ${selectedApplicantion.user.last_name} / ${selectedApplicantion.proposed_rate}`
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
                </div>
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
              </div>

              {/* Chat Messages */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50/30"
              >
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
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={sendMessage}>
                <div className="border-t p-3 flex gap-2">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 text-sm text-white hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </button>
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
                  ? "Select an applicant to start chatting"
                  : "Select a job to view your messages"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
