import { cn } from "@acme/ui";

interface TodoCardSkeletonProps {
  pulse?: boolean;
}

export default function TodoCardSkeleton({
  pulse = true,
}: TodoCardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted flex items-center gap-4 rounded-lg p-4",
        pulse && "animate-pulse",
      )}
    >
      <span className="bg-muted-foreground/20 size-5 shrink-0 rounded-full" />
      <div className="grow">
        <div className="bg-muted-foreground/20 h-5 w-2/3 rounded" />
        <div className="bg-muted-foreground/20 mt-2 h-3 w-1/4 rounded" />
      </div>
      <span className="bg-muted-foreground/20 h-5 w-12 shrink-0 rounded-full" />
    </div>
  );
}
