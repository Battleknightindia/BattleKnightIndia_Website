export type TeamStatus = "pending" | "approved" | "no_referral";

export const statusClass: Record<TeamStatus, string> = {
  pending: "bg-amber-500",
  approved: "bg-emerald-500",
  no_referral: "bg-gray-400 cursor-not-allowed",
};