"use client";

import Link from "next/link";
import { Clock, Star, Handshake } from "lucide-react";
import { HelperProfile, User } from "@/lib/types";
import { CategoryBadge, RankBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getProgressToNextRank } from "@/lib/utils/ranks";

interface HelperCardProps {
  profile: HelperProfile;
  user: User;
}

export default function HelperCard({ profile, user }: HelperCardProps) {
  const progress = getProgressToNextRank(user.points);

  return (
    <div className="card p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar user={user} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{user.name}</h3>
            <RankBadge rank={user.rank} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {user.class
              ? `כיתה ${user.class}`
              : user.position ?? ""}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-semibold">
            <Star size={12} fill="currentColor" />
            {user.points} נקודות
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
        {profile.bio}
      </p>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5">
        {profile.categories.map((c) => (
          <CategoryBadge key={c} category={c} />
        ))}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {profile.skills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Availability */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        <Clock size={13} className="text-gray-400 flex-shrink-0" />
        <span className="line-clamp-1">{profile.availability}</span>
      </div>

      {/* Rank progress */}
      <div>
        <ProgressBar
          value={progress.progress}
          label={
            progress.next
              ? `${progress.pointsToNext} נקודות לדרגת ${progress.next}`
              : "דרגה מקסימלית!"
          }
          size="sm"
          color="bg-amber-400"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Handshake size={13} />
          עזר/ה {profile.helpCount} פעמים
        </span>
        <Link
          href={`/profile?userId=${user.id}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          צפה בפרופיל ←
        </Link>
      </div>
    </div>
  );
}
