import Link from "next/link";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center flex-1 h-full gap-6 py-20"
      style={{ background: "#f4f6fb" }}
    >
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
          }}
        >
          <AlertCircle size={28} color="white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">404</h1>
          <p className="text-lg font-semibold text-gray-700">Page not found</p>
          <p className="text-sm text-gray-500 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
          }}
        >
          <Home size={15} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
