import { Loader } from "@/components/ui/loader";

export default function GlobalLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader />
    </div>
  );
}
