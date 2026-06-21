"use client";
import React, { useEffect } from "react";
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
  useEffect(() => {
    return emitterSubscribe(key, cb as (value: any) => void);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, cb, ...deps]);
};

export const publish = <K extends SubscriptionKeys>(key: K, value: unknown) =>
  emitterEmit(key, value);
