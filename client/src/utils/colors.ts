export interface ChunkColor {
  bg: string;
  bgActive: string;
  border: string;
  text: string;
  badge: string;
  hex: string;
}

export const CHUNK_COLORS: ChunkColor[] = [
  {
    bg: "bg-indigo-500/15",
    bgActive: "bg-indigo-500/35",
    border: "border-indigo-400",
    text: "text-indigo-300",
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    hex: "#6366f1",
  },
  {
    bg: "bg-emerald-500/15",
    bgActive: "bg-emerald-500/35",
    border: "border-emerald-400",
    text: "text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    hex: "#10b981",
  },
  {
    bg: "bg-amber-500/15",
    bgActive: "bg-amber-500/35",
    border: "border-amber-400",
    text: "text-amber-300",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    hex: "#f59e0b",
  },
  {
    bg: "bg-rose-500/15",
    bgActive: "bg-rose-500/35",
    border: "border-rose-400",
    text: "text-rose-300",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    hex: "#f43f5e",
  },
  {
    bg: "bg-cyan-500/15",
    bgActive: "bg-cyan-500/35",
    border: "border-cyan-400",
    text: "text-cyan-300",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    hex: "#06b6d4",
  },
  {
    bg: "bg-violet-500/15",
    bgActive: "bg-violet-500/35",
    border: "border-violet-400",
    text: "text-violet-300",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    hex: "#8b5cf6",
  },
  {
    bg: "bg-orange-500/15",
    bgActive: "bg-orange-500/35",
    border: "border-orange-400",
    text: "text-orange-300",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    hex: "#f97316",
  },
  {
    bg: "bg-fuchsia-500/15",
    bgActive: "bg-fuchsia-500/35",
    border: "border-fuchsia-400",
    text: "text-fuchsia-300",
    badge: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
    hex: "#d946ef",
  },
  {
    bg: "bg-lime-500/15",
    bgActive: "bg-lime-500/35",
    border: "border-lime-400",
    text: "text-lime-300",
    badge: "bg-lime-500/20 text-lime-300 border-lime-500/30",
    hex: "#84cc16",
  },
  {
    bg: "bg-sky-500/15",
    bgActive: "bg-sky-500/35",
    border: "border-sky-400",
    text: "text-sky-300",
    badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    hex: "#0ea5e9",
  },
  {
    bg: "bg-pink-500/15",
    bgActive: "bg-pink-500/35",
    border: "border-pink-400",
    text: "text-pink-300",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    hex: "#ec4899",
  },
  {
    bg: "bg-teal-500/15",
    bgActive: "bg-teal-500/35",
    border: "border-teal-400",
    text: "text-teal-300",
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    hex: "#14b8a6",
  },
];

export function getChunkColor(index: number): ChunkColor {
  return CHUNK_COLORS[index % CHUNK_COLORS.length];
}
