import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { USER_AGENT } from "@/constants";

export async function applyUserAgentHeaders(
  request: NextRequest,
): Promise<void> {
  const savedUA = (await cookies()).get("user-agent")?.value;
  const currentUA = request.headers.get("user-agent");

  if (!savedUA || savedUA !== currentUA) {
    (await cookies()).set(
      USER_AGENT,
      /Mobile|Android|iPhone|iPad|iPod/i.test(currentUA) ? "mobile" : "desktop",
      { maxAge: 365 * 24 * 60 * 60 },
    );
  }
}
