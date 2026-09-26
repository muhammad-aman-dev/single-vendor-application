import { Suspense } from "react";
import TrackOrderPage from "./TrackOrderPage";

function TrackOrderLoading() {
  return (
    <main className="w-full bg-neutral-950 text-neutral-200 min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-neutral-300 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-neutral-400">
          Loading order tracking...
        </p>
      </div>
    </main>
  ); 
}

export default function Page() {
  return (
    <Suspense fallback={<TrackOrderLoading />}>
      <TrackOrderPage />
    </Suspense>
  );
}
