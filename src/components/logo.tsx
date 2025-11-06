import { cn } from "@/lib/utils";
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-headline tracking-wider text-primary",
        className
      )}
    >
      <div className="hidden items-baseline gap-1.5 text-xl sm:flex">
        <span>BRA</span>
        <span className="text-foreground/80">DISCIPLINE</span>
      </div>
      <span className="sr-only">BRA DISCIPLINE</span>
    </Link>
  );
}
