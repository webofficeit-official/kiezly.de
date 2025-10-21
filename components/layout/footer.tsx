import { useT } from '@/app/[locale]/layout';
import { useLocalizedRouter } from '@/lib/useLocalizedRouter';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function Footer() {
  const router = useRouter()
  const t = useT('footer');
  const { push } = useLocalizedRouter();

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-neutral-600 md:flex-row">
        <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /><span>Kiezly.de</span></div>
        <div className="flex flex-wrap items-center gap-4">
          <a className="hover:opacity-80 cursor-pointer" onClick={() => push("/impressum")}>{t("impressum")}</a>
          <a className="hover:opacity-80 cursor-pointer" onClick={() => push("/datenschutz")}>{t("privacy")}</a>
          <a className="hover:opacity-80 cursor-pointer" onClick={() => push("/terms")}>{t("terms")}</a>
        </div>
      </div>
    </footer>
  );
}
