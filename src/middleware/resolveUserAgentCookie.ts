import { NextRequest } from "next/server";
import { USER_AGENT } from "@/constants";

type UserAgentCookie = {
  name: typeof USER_AGENT;
  value: "mobile" | "desktop";
} | null;

export function resolveUserAgentCookie(req: NextRequest): UserAgentCookie {
  if (req.headers.get("sec-fetch-dest") !== "document") return null;

  const ua = req.headers.get("user-agent") ?? "";
  const device: "mobile" | "desktop" =
    /Mobile|Tablet|Android|iPhone|iPad|iPod/i.test(ua) ? "mobile" : "desktop";

  const existing = req.cookies.get(USER_AGENT)?.value;
  if (existing === device) return null;

  return { name: USER_AGENT, value: device };
}
