import { Eye, Bookmark, AlertTriangle, UserCheck } from "lucide-react";
import { useT } from "@/app/[locale]/layout";

const STATS = [
  { key: "views_count",      icon: Eye,           bg: "rgba(37,99,235,.1)",   color: "#2563eb", label: "count.items.views" },
  { key: "saves_count",      icon: Bookmark,      bg: "rgba(26,158,95,.1)",   color: "#1a9e5f", label: "count.items.saves" },
  { key: "reports_count",    icon: AlertTriangle, bg: "rgba(220,38,38,.1)",   color: "#dc2626", label: "count.items.reports" },
  { key: "applicants_count", icon: UserCheck,     bg: "rgba(124,58,237,.1)",  color: "#7c3aed", label: "count.items.applicants" },
];

export default function JobCountCard({ job }: { job: any }) {
  const t = useT("jobs");

  return (
    <div className="rounded-2xl bg-white border border-[#efefec] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#efefec]">
        <h3 className="font-display font-semibold text-[#111110] text-[15px]">{t("count.title")}</h3>
      </div>
      <div className="grid grid-cols-2 gap-px bg-[#efefec]">
        {STATS.map(({ key, icon: Icon, bg, color, label }) => (
          <div key={key} className="bg-white flex flex-col items-center justify-center py-5 px-3 gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: bg }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <span className="font-display font-bold text-[#111110] text-2xl leading-none">
              {job[key] ?? 0}
            </span>
            <span className="text-[12px]" style={{ color: "rgba(17,17,16,.45)" }}>{t(label)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
