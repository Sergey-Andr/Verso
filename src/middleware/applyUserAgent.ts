import { NextRequest, NextResponse } from "next/server";
import { USER_AGENT } from "@/constants";

export function applyUserAgentHeaders(req: NextRequest, res: NextResponse) {
  if (req.headers.get("sec-fetch-dest") !== "document") return;

  const ua = req.headers.get("user-agent") ?? "";
  const device = /Mobile|Tablet|Android|iPhone|iPad|iPod/i.test(ua)
    ? "mobile"
    : "desktop";
  if (req.cookies.get(USER_AGENT)?.value !== device) {
    res.cookies.set(USER_AGENT, device, {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
  }
}
