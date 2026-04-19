import { useEffect, useState } from "react";

export type Role = "Student" | "Faculty" | "Admin";

export function useRole(): { role: Role; user: string } {
  const [role, setRole] = useState<Role>("Student");
  const [user, setUser] = useState<string>("priyank.s");

  useEffect(() => {
    try {
      const r = localStorage.getItem("aether.role") as Role | null;
      const u = localStorage.getItem("aether.user");
      if (r === "Student" || r === "Faculty" || r === "Admin") setRole(r);
      if (u) setUser(u);
    } catch {}
  }, []);

  return { role, user };
}
