import { DEFAULT_LANG_STORE_NAME } from "@/constants/i18n";
import { ACTIVE_DAY, TIMESTAMP } from "@/app/(pages)/Home/constants/shared";
import { REQUESTED_CITIES } from "@/constants";

export type SubscriptionKeys =
  | typeof ACTIVE_DAY
  | typeof DEFAULT_LANG_STORE_NAME
  | typeof TIMESTAMP
  | typeof REQUESTED_CITIES;

export type SearchingCityStates = { status: "error" | "success" | "pending" };

export const payloadSchema = {
  [ACTIVE_DAY]: {} as string,
  [DEFAULT_LANG_STORE_NAME]: {} as string,
  [TIMESTAMP]: {} as number,
  [REQUESTED_CITIES]: {} as { status: "error" | "success" | "pending" },
} as const;

export type PayloadByKey = {
  [K in keyof typeof payloadSchema]: (typeof payloadSchema)[K];
};

export type Callback<K extends SubscriptionKeys> = (
  data: PayloadByKey[K],
) => void;

export type Ctx = {
  subscribe: <K extends SubscriptionKeys>(key: K, cb: Callback<K>) => void;
  unsubscribe: <K extends SubscriptionKeys>(key: K, cb: Callback<K>) => void;
  send: (data: unknown) => boolean;
};
