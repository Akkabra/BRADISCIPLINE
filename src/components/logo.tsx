import { cn } from "@/lib/utils";
import Link from "next/link";

const TiwazRune = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2v20" />
    <path d="m5 7 7-5 7 5" />
  </svg>
);

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-headline tracking-wider text-primary",
        className
      )}
    >
      <TiwazRune className="h-5 w-5" />
      <div className="flex items-baseline gap-1.5 text-xl">
        <span>BRA</span>
        <span className="text-foreground/80">DISCIPLINE</span>
      </div>
    </Link>
  );
}
