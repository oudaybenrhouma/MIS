import { Box, Cog, Droplets, Gauge, Ruler, ShieldCheck, Wrench, Zap, type LucideProps } from "lucide-react";
import type { CategoryIconName } from "@/data/types";

const map = {
  ruler: Ruler,
  droplets: Droplets,
  zap: Zap,
  shield: ShieldCheck,
  cog: Cog,
  box: Box,
  gauge: Gauge,
  wrench: Wrench,
} as const;

export function CategoryIcon({ name, ...props }: { name: CategoryIconName } & LucideProps) {
  const Icon = map[name];
  return <Icon strokeWidth={1.5} aria-hidden {...props} />;
}
