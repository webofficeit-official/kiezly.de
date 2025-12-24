import { MessageCircle, Send, X } from "lucide-react";
import { Applicant } from "../job/job-details/applicant-card/applicant-card";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useMemo, useState } from "react";
import { Job } from "@/lib/types/job";
import { User } from "../MyProfile";
import { useGetConversation, useSendMessage } from "@/lib/react-query/queries/message";

dayjs.extend(relativeTime);

type MessageProps = {
    applicant: Applicant;
    isOpen: boolean
    onClose: () => void;
}

type Message = {
    id: string
    job_id: string
    sender_id: string
    recipient_id: string
    body: string
    created_at: string
    job: Job
    sender: User
    recipient: User
};

export default function Message({ applicant, isOpen, onClose }: MessageProps) {
    const [message, setMessage] = useState("");

    const jobId = applicant?.job_id ?? null;
    const helperId = applicant?.helper_id ?? null;

    const filters = useMemo(
        () => ({ page: 1, page_size: 10 }),
        []
    );

    const { data, isLoading } = useGetConversation(
        jobId,
        helperId,
        filters,
        { enabled: !!jobId && !!helperId }
    );
    const messages = data?.data?.messages?.items ?? [];    

    const sendMsg = useSendMessage();

    if (!isOpen) return null;

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

    const sendMessage = () => {
        if (!message.trim()) return;
        sendMsg.mutate({
            jobId: jobId,
            recipient_id: helperId,
            body: message
        }, {
            onSuccess: () => {
                setMessage("")
            }
        })
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
                    <div className="flex h-[560px] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">

                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">
                                    {applicant.user.first_name} {applicant.user.last_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {applicant.user.email}
                                </span>
                            </div>
                            <button onClick={onClose}>
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto bg-muted/40 p-4 space-y-4">
                            {messages.length === 0 ? (
                                <>
                                    <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
                                        <div className="h-16 w-16 border-2 border-black rounded-full flex items-center justify-center bg-gray-50">
                                            <MessageCircle className="h-8 w-8 text-black" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black uppercase text-black">
                                                No Messages Yet
                                            </h4>
                                            <p className="text-[10px] text-black/40 uppercase">
                                                Send a message to start the conversation
                                            </p>
                                        </div>
                                        {/* Decorative B&W line */}
                                        <div className="w-12 h-[1px] bg-black/20" />
                                    </div>
                                </>
                            ) : (messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.recipient_id === helperId
                                        ? "justify-end"
                                        : "justify-start"
                                        }`}
                                >
                                    <div className="max-w-[75%]">
                                        <div
                                            className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.recipient_id === helperId
                                                ? "bg-primary text-white rounded-br-sm"
                                                : "bg-white border rounded-bl-sm"
                                                }`}
                                        >
                                            {msg.body}
                                        </div>
                                        <p
                                            className={`mt-1 text-[10px] text-muted-foreground ${msg.recipient_id === helperId
                                                ? "text-right"
                                                : "text-left"
                                                }`}
                                        >
                                            {formatTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            )))}
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
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}