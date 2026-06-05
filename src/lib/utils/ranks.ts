import {
  RankLevel,
  RANK_ORDER,
  RANK_THRESHOLDS,
} from "@/lib/types";

export function getRankForPoints(points: number): RankLevel {
  let rank: RankLevel = "מתחיל/ה";
  for (const level of RANK_ORDER) {
    if (points >= RANK_THRESHOLDS[level]) {
      rank = level;
    }
  }
  return rank;
}

export function getNextRank(current: RankLevel): RankLevel | null {
  const idx = RANK_ORDER.indexOf(current);
  if (idx === RANK_ORDER.length - 1) return null;
  return RANK_ORDER[idx + 1];
}

export function getProgressToNextRank(points: number): {
  current: RankLevel;
  next: RankLevel | null;
  progress: number; // 0-100
  pointsNeeded: number;
  pointsToNext: number;
} {
  const current = getRankForPoints(points);
  const next = getNextRank(current);

  if (!next) {
    return {
      current,
      next: null,
      progress: 100,
      pointsNeeded: RANK_THRESHOLDS[current],
      pointsToNext: 0,
    };
  }

  const currentThreshold = RANK_THRESHOLDS[current];
  const nextThreshold = RANK_THRESHOLDS[next];
  const range = nextThreshold - currentThreshold;
  const earned = points - currentThreshold;
  const progress = Math.round((earned / range) * 100);

  return {
    current,
    next,
    progress: Math.min(progress, 100),
    pointsNeeded: nextThreshold,
    pointsToNext: nextThreshold - points,
  };
}
