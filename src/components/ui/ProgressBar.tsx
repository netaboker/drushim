import clsx from "clsx";

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  color = "bg-blue-500",
  size = "md",
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={clsx("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-gray-600">{label}</span>}
          {showLabel && (
            <span className="text-xs font-semibold text-gray-700">
              {value}%
            </span>
          )}
        </div>
      )}
      <div
        className={clsx(
          "w-full bg-gray-200 rounded-full overflow-hidden",
          heights[size]
        )}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500",
            color
          )}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
