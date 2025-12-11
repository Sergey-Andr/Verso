"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function BodyPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);
  return host ? createPortal(children, host) : null;
}
