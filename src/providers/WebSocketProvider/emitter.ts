type Listener = (value: any) => void;

const listeners = new Map<string, Set<Listener>>();

export const emitterSubscribe = (key: string, cb: Listener): (() => void) => {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(cb);

  return () => {
    const s = listeners.get(key);
    if (!s) return;
    s.delete(cb);
    if (s.size === 0) listeners.delete(key);
  };
};

export const emitterEmit = (key: string, value: any): void => {
  const set = listeners.get(key);
  if (!set) return;
  set.forEach((cb) => {
    try {
      cb(value);
    } catch {}
  });
};
