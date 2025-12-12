"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
  period: "week" | "month" | "year";
  initialUpdatedAt: number;
  intervalMs?: number; // default 20000
};

export default function AutoRefresh({ period, initialUpdatedAt, intervalMs = 20000 }: Props) {
  const router = useRouter();
  const latest = useRef<number>(initialUpdatedAt);

  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch(`/api/leaderboard/${period}?head=1`, { cache: "no-store" });
        if (!res.ok) return;
        const j = await res.json();
        const at = Number(j?.updatedAt ?? 0);
        if (at > latest.current) {
          latest.current = at;
          router.refresh(); // re-render with fresh server data
        }
      } catch {}
    };

    void tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [period, intervalMs, router]);

  return null;
}
