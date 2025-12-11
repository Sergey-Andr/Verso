"use client";
import { HUNDRED_YEARS_STORE } from "@/constants";

export const getStoredData = (
  name: string,
  option: "session" | "locale" = "locale",
): any | null => {
  let data;
  if (option === "locale") data = localStorage.getItem(name);
  else data = sessionStorage.getItem(name);

  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

export const setStoredData = (
  name: string,
  data: any,
  option: "session" | "locale" = "locale",
) => {
  if (option === "locale") localStorage.setItem(name, JSON.stringify(data));
  else sessionStorage.setItem(name, JSON.stringify(data));
};

export function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name, value) {
  const expires = new Date(Date.now() + HUNDRED_YEARS_STORE).toUTCString();

  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

export function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
