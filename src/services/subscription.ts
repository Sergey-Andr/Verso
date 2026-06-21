"use client";
import { SubscriptionKeys } from "@/types/subscriptions";
import { emitterEmit } from "@/providers/WebSocketProvider/emitter";

// Раньше это был POST на /api/notify с серверной рассылкой по WS (глобальной для всех
// клиентов). Теперь — локальная публикация в пределах вкладки: мгновенно, без сервера
// и без утечки состояния между пользователями. Сигнатура сохранена, чтобы не трогать
// места вызова.
export function subscription({
  key,
  value,
}: {
  key: SubscriptionKeys;
  value: any;
  fetchUrl?: string;
}) {
  emitterEmit(key, value);
  return true;
}
