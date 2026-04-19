import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

export function ScreenHeader({
  title,
  subtitle,
  back = "/dashboard",
  right,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mx-4 mt-2 mb-4 rounded-3xl bg-card shadow-card px-4 py-3 flex items-center gap-3">
      <Link to={back} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition">
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
