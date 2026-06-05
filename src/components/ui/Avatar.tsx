import clsx from "clsx";
import { User } from "@/lib/types";

interface AvatarProps {
  user: Pick<User, "avatarInitials" | "avatarColor" | "name">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

export function Avatar({ user, size = "md", className }: AvatarProps) {
  return (
    <div
      className={clsx(
        "rounded-full flex items-center justify-center text-white font-bold flex-shrink-0",
        sizes[size],
        user.avatarColor,
        className
      )}
      title={user.name}
    >
      {user.avatarInitials}
    </div>
  );
}
