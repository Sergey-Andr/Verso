"use client";
import React, { useEffect, useRef } from "react";
import { Callback, SubscriptionKeys } from "@/types/subscriptions";
import {
  emitterEmit,
  emitterSubscribe,
} from "@/providers/WebSocketProvider/emitter";

export const useSubscription = <K extends SubscriptionKeys>(
  key: K,
  cb: Callback<K>,
  deps: React.DependencyList = [],
) => {
  // cb держим в ref, чтобы инлайн-колбэк не вызывал отписку/переподписку на каждый рендер.
  const cbRef = useRef(cb);
  cbRef.current = cb;

  useEffect(() => {
    return emitterSubscribe(key, (value) => cbRef.current(value as any));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...deps]);
};

export const publish = <K extends SubscriptionKeys>(key: K, value: unknown) =>
  emitterEmit(key, value);
