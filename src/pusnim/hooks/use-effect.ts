import { isEqual } from 'lodash';
import { pusnimAppState } from '../core/state';

export function useEffect(callback: () => void, deps: any[]) {
  const oldHook =
    pusnimAppState.wipFiber?.alternate?.hooks?.[pusnimAppState.hookIndex];
  const hook = {
    deps,
  };

  if (oldHook) {
    if (!isEqual(oldHook.deps, hook.deps)) callback();
  } else {
    callback();
  }

  if (pusnimAppState.wipFiber.hooks) {
    pusnimAppState.wipFiber.hooks.push(hook);
    pusnimAppState.hookIndex++;
  }
}
