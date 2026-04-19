import { ReactNode } from "react";
import { DemoMenu } from "./DemoMenu";

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-start md:items-center justify-center p-0 md:p-6 bg-mesh relative overflow-hidden">
      <div className="hidden md:block absolute top-10 left-10 w-72 h-72 rounded-full bg-aether-violet/30 blur-3xl animate-blob pointer-events-none" />
      <div className="hidden md:block absolute bottom-10 right-10 w-80 h-80 rounded-full bg-aether-pink/30 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "3s" }} />
      <div className="w-full max-w-[420px] md:rounded-[2.75rem] md:border md:border-white/40 md:shadow-glow bg-mesh min-h-screen md:h-[860px] overflow-hidden relative flex flex-col z-10">
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-foreground/90 rounded-b-2xl z-30 pointer-events-none" />
        {children}
        <DemoMenu />
      </div>
    </div>
  );
}
