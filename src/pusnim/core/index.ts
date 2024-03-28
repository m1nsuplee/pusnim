import {
  DomNode,
  Fiber,
  PusnimElement,
  RequestIdleCallbackDeadline,
} from './models';
import { pusnimAppState } from './state';
import { isEvent, isGone, isNew, isProperty } from './utils';

function styleObjectToString(style: any) {
  return Object.keys(style).reduce(
    (acc, key) =>
      `${acc}${key
        .split(/(?=[A-Z])/)
        .join('-')
        .toLowerCase()}:${style[key]};`,
    ''
  );
}

function toChildArray(children: any, out: any[] = []): any[] {
  if (children == null || typeof children === 'boolean') {
    return out;
  }

  if (Array.isArray(children)) {
    children.some((child) => {
      toChildArray(child, out);
    });
  } else {
    out.push(children);
  }

  return out;
}

function createTextElement(text: string): PusnimElement {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(
  type: string,
  props: any,
  ...children: any[]
): PusnimElement {
  const childArray = toChildArray(children, []);

  return {
    type,
    props: {
      ...props,
      children: childArray.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}

function updateDom(dom: DomNode, prevProps: any, nextProps: any) {
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(nextProps))
    .forEach((name) => {
      (dom as any)[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      if (name === 'style') {
        (dom as any)[name] = styleObjectToString(nextProps[name]);
      } else {
        (dom as any)[name] = nextProps[name];
      }
    });

  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
  pusnimAppState.deletions.forEach(commitWork);

  if (pusnimAppState.wipRoot?.child) {
    commitWork(pusnimAppState.wipRoot.child);
    pusnimAppState.currentRoot = pusnimAppState.wipRoot;
  }

  pusnimAppState.wipRoot = undefined;
}

function commitWork(fiber?: Fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber?.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (
    fiber.effectTag === 'UPDATE' &&
    fiber.dom != null &&
    fiber.alternate
  ) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child as Fiber);
  commitWork(fiber.sibling as Fiber);
}

function commitDeletion(fiber: Fiber, domParent: DomNode) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else if (fiber?.child) {
    commitDeletion(fiber.child, domParent);
  }
}

function workLoop(deadline: RequestIdleCallbackDeadline) {
  let shouldYield = false;
  while (pusnimAppState.nextUnitOfWork && !shouldYield) {
    pusnimAppState.nextUnitOfWork = performUnitOfWork(
      pusnimAppState.nextUnitOfWork
    );
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!pusnimAppState.nextUnitOfWork && pusnimAppState.wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber: Fiber) {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent as Fiber;
  }
}

function updateFunctionComponent(fiber: Fiber) {
  pusnimAppState.wipFiber = fiber;
  pusnimAppState.hookIndex = 0;
  pusnimAppState.wipFiber.hooks = [];
  const children = [(fiber.type as Function)(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(wipFiber: Fiber, elements: any) {
  let index = 0;
  let oldFiber = wipFiber.alternate?.child;
  let prevSibling: Fiber | undefined = undefined;

  while (index < elements.length || oldFiber !== undefined) {
    const element = elements[index];
    let newFiber: Fiber | undefined = undefined;

    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber?.type,
        props: element.props,
        dom: oldFiber?.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: undefined,
        parent: wipFiber,
        alternate: undefined,
        effectTag: 'PLACEMENT',
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      pusnimAppState.deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (elements && prevSibling) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function createDom(fiber: Fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type as string);

  updateDom(dom, {}, fiber.props);
  return dom;
}

function render(container: DomNode): (element: any) => void {
  return (element: any) => {
    pusnimAppState.wipRoot = {
      dom: container,
      props: {
        children: [element],
      },
      alternate: pusnimAppState.currentRoot,
    };
    pusnimAppState.deletions = [];

    pusnimAppState.nextUnitOfWork = pusnimAppState.wipRoot;
  };
}

function createRoot(container: DomNode) {
  return {
    render: render(container),
  };
}

export { createElement, createRoot };
