import clsx from "clsx";
import {
  RequestCategory,
  RequestStatus,
  UrgencyLevel,
  RankLevel,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  STATUS_COLORS,
  URGENCY_COLORS,
  RANK_COLORS,
  RANK_ICONS,
} from "@/lib/types";

interface CategoryBadgeProps {
  category: RequestCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={clsx(
        "badge",
        CATEGORY_COLORS[category],
        className
      )}
    >
      {CATEGORY_ICONS[category]} {category}
    </span>
  );
}

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const dot: Record<RequestStatus, string> = {
    פתוח: "bg-green-500",
    בטיפול: "bg-blue-500",
    הושלם: "bg-gray-400",
    נסגר: "bg-red-400",
  };

  return (
    <span
      className={clsx(
        "badge",
        STATUS_COLORS[status],
        className
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full inline-block", dot[status])} />
      {status}
    </span>
  );
}

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
}

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const icons: Record<UrgencyLevel, string> = {
    נמוכה: "🟢",
    בינונית: "🟡",
    גבוהה: "🟠",
    דחוף: "🔴",
  };

  return (
    <span className={clsx("text-xs font-semibold", URGENCY_COLORS[urgency])}>
      {icons[urgency]} {urgency}
    </span>
  );
}

interface RankBadgeProps {
  rank: RankLevel;
  showIcon?: boolean;
}

export function RankBadge({ rank, showIcon = true }: RankBadgeProps) {
  return (
    <span className={clsx("badge", RANK_COLORS[rank])}>
      {showIcon && RANK_ICONS[rank]} {rank}
    </span>
  );
}
