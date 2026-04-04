"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const AVATAR_OVERLAP_PX = 6.4;
const BADGE_PADDING_ESTIMATE = 16;
const BADGE_BORDER_WIDTH_PX = 4;

interface Contributor {
  username: string;
  name: string | null;
  avatar_url: string | null;
}

interface AvatarMosaicProps {
  contributors: Contributor[];
  totalCount: number;
}

export default function AvatarMosaic({
  contributors,
  totalCount,
}: AvatarMosaicProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(contributors.length);

  useEffect(() => {
    function calculateVisible() {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const isSm = window.matchMedia("(min-width: 640px)").matches;
      const avatarSize = isSm ? 36 : 32;
      const overlap = AVATAR_OVERLAP_PX;

      // Measure the actual badge width, or estimate it
      const badgeEl = badgeRef.current;
      const badgeWidth = badgeEl
        ? badgeEl.scrollWidth + BADGE_BORDER_WIDTH_PX // border
        : avatarSize + BADGE_PADDING_ESTIMATE; // fallback estimate for pill

      const firstAvatarWidth = avatarSize;
      const subsequentWidth = avatarSize - overlap;

      // Reserve space for the badge (it overlaps by the same amount)
      const availableForAvatars = containerWidth - badgeWidth + overlap;

      if (availableForAvatars <= firstAvatarWidth) {
        setVisibleCount(1);
        return;
      }

      const maxFit =
        1 +
        Math.floor((availableForAvatars - firstAvatarWidth) / subsequentWidth);
      const clamped = Math.min(maxFit, contributors.length);

      const allFitWidth =
        firstAvatarWidth + (contributors.length - 1) * subsequentWidth;
      const needsBadge = totalCount > contributors.length;

      if (!needsBadge && allFitWidth <= containerWidth) {
        setVisibleCount(contributors.length);
      } else {
        setVisibleCount(clamped);
      }
    }

    calculateVisible();

    let observer: ResizeObserver | null = null;
    if (containerRef.current) {
      observer = new ResizeObserver(calculateVisible);
      observer.observe(containerRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [contributors.length, totalCount]);

  const visible = contributors.slice(0, visibleCount);
  const extraCount = totalCount - visible.length;

  return (
    <div ref={containerRef} className="flex items-center">
      {visible.map((c, i) => (
        <Avatar
          key={c.username}
          className="size-8 sm:size-9 border-2 border-card shrink-0"
          style={{
            marginLeft: i === 0 ? 0 : `-${AVATAR_OVERLAP_PX / 16}rem`,
            zIndex: visible.length - i + 1,
          }}
        >
          <AvatarImage
            src={c.avatar_url || undefined}
            alt={c.name || c.username}
          />
          <AvatarFallback className="text-[10px]">
            {(c.name || c.username).substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {extraCount > 0 && (
        <div
          ref={badgeRef}
          className="h-8 sm:h-9 rounded-full bg-muted border-2 border-card flex items-center justify-center shrink-0 px-2.5 text-[10px] sm:text-xs font-medium text-muted-foreground"
          style={{ marginLeft: "-0.4rem", zIndex: 0 }}
        >
          <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
          {extraCount}
        </div>
      )}
    </div>
  );
}
