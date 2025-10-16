export function Loader({ text="",size = 8 }: {text?:string, size?: number }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      {/* Simple Tailwind spinner */}
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin">{text}</div>
    </div>
  );
}
