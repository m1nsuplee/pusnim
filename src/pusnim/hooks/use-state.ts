import { pusnimAppState } from '../core/state';

export function useState<T>(
  initial: T
): [T, (action: (prevState: T) => T) => void] {
  const oldHook =
    pusnimAppState.wipFiber.alternate?.hooks?.[pusnimAppState.hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [] as any[],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action: any) => {
    hook.state = action(hook.state);
  });

  const setState = (action: any) => {
    if (typeof action === 'function') {
      hook.queue.push(action);
    } else {
      hook.queue.push(() => action);
    }

    pusnimAppState.wipRoot = {
      dom: pusnimAppState.currentRoot.dom,
      props: pusnimAppState.currentRoot.props,
      alternate: pusnimAppState.currentRoot,
    };
    pusnimAppState.nextUnitOfWork = pusnimAppState.wipRoot;
    pusnimAppState.deletions = [];
  };

  if (pusnimAppState.wipFiber.hooks) {
    pusnimAppState.wipFiber.hooks.push(hook);
    pusnimAppState.hookIndex++;
  }

  return [hook.state, setState];
}
