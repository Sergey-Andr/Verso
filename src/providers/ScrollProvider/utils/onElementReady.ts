export function onElementReady(
  targetId: string,
  opts: {
    attr?: string;
    value?: string;
    onReady: (el: HTMLElement) => void;
    once?: boolean;
    timeout?: number;
    root?: ParentNode;
  },
): () => void {
  const { attr, value, onReady, root = document.body } = opts;
  const once = opts.once !== false;

  const test = (el: Element): boolean => {
    if (!attr) return true;
    if (value === undefined) return el.hasAttribute(attr);
    return el.getAttribute(attr) === value;
  };

  let stopped = false;
  let mountObs: MutationObserver | null = null;
  let attrObs: MutationObserver | null = null;
  let tm: number | undefined;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    mountObs?.disconnect();
    attrObs?.disconnect();
    if (tm !== undefined) clearTimeout(tm);
  };

  const fire = (el: HTMLElement) => {
    requestAnimationFrame(() => onReady(el));
    if (once) stop();
  };

  const watchAttr = (el: HTMLElement) => {
    if (!attr) return fire(el);
    if (test(el)) return fire(el);
    attrObs?.disconnect();
    attrObs = new MutationObserver(() => {
      if (test(el)) fire(el);
    });
    attrObs.observe(el, {
      attributes: true,
      attributeFilter: [attr],
    });
  };

  let el = document.getElementById(targetId) as HTMLElement | null;
  if (el) {
    watchAttr(el);
  } else {
    mountObs = new MutationObserver((muts) => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (!(n instanceof Element)) continue;
          let found: HTMLElement | null = null;
          if (n.id === targetId) found = n as HTMLElement;
          else found = n.querySelector<HTMLElement>(`#${CSS.escape(targetId)}`);
          if (found) {
            mountObs!.disconnect();
            el = found;
            watchAttr(found);
            return;
          }
        }
      }
    });
    mountObs.observe(root as Node, { childList: true, subtree: true });
  }

  if (opts.timeout) tm = window.setTimeout(stop, opts.timeout);
  return stop;
}
