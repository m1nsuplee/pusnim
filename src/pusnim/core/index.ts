import { DomNode, Fiber, PusnimElement } from './models';
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
  // React에서는 children이 null이거나 boolean일 경우 무시합니다.
  // 이 코드에서도 동일한 방식으로 처리하고 있습니다.
  if (children == null || typeof children === 'boolean') {
    return out;
  }

  // React에서는 children이 배열일 경우 각각의 요소를 자식 노드로 처리합니다.
  // 이 코드에서는 배열인 경우 각 요소에 대해 재귀적으로 toChildArray 함수를 호출하여
  // 모든 자식 요소를 단일 배열에 통합하고 있습니다.
  if (Array.isArray(children)) {
    children.some((child) => {
      toChildArray(child, out);
    });
  } else {
    // React에서는 children이 단일 요소일 경우 그대로 처리합니다.
    // 이 코드에서도 단일 요소는 그대로 out 배열에 추가하고 있습니다.
    out.push(children);
  }

  // 최종적으로 통합된 자식 요소 배열을 반환합니다.
  // React에서는 이와 유사하게 자식 요소들을 배열로 관리하고 있습니다.
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
  // React에서는 createElement 함수를 통해 React 요소를 생성합니다.
  // 이 함수는 타입(문자열 또는 컴포넌트), 속성 객체, 그리고 자식 요소들을 인자로 받습니다.

  // React에서는 자식 요소들을 배열로 관리합니다.
  // toChildArray 함수를 통해 자식 요소들을 단일 배열로 통합하고 있습니다.
  const childArray = toChildArray(children, []);

  return {
    // React 요소는 type, props, 그리고 key와 같은 속성을 가집니다.
    type,
    props: {
      // React에서는 props 객체를 그대로 사용합니다.
      ...props,
      // React에서는 children을 props의 일부로 취급합니다.
      // 또한, 자식 요소가 객체가 아닌 경우(createTextElement 함수의 반환값이 아닌 경우)에는
      // createTextElement 함수를 통해 텍스트 요소를 생성하고 있습니다.
      // 이는 React에서 텍스트 노드를 처리하는 방식과 유사합니다.
      children: childArray.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}
function updateDom(dom: DomNode, prevProps: any, nextProps: any) {
  // React에서는 이전 속성과 새로운 속성을 비교하여 변경사항을 찾습니다.
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(nextProps))
    .forEach((name) => {
      (dom as any)[name] = '';
    });

  // 새로운 속성을 순회하면서 이전 속성과 다른 항목을 찾아 업데이트합니다.
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

  // React에서는 이벤트 리스너를 관리하기 위해 SyntheticEvent를 사용합니다.
  // 이 코드에서는 이전 속성을 순회하면서 새로운 속성에 없거나 변경된 이벤트 리스너를 제거합니다.
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // React에서는 새로운 이벤트 리스너를 추가합니다.
  // 이 코드에서는 새로운 속성을 순회하면서 이전 속성과 다른 이벤트 리스너를 찾아 추가합니다.
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2); // 'on'을 제거합니다.
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
  // React에서는 렌더링 과정에서 삭제된 노드들을 별도로 관리하고,
  // 렌더링이 완료되면 이들을 실제 DOM에서 제거합니다.
  // 이 코드에서도 동일한 방식으로 처리하고 있습니다.
  pusnimAppState.deletions.forEach(commitWork);

  // React에서는 작업 중인 루트(wipRoot)의 자식 노드들을 렌더링합니다.
  if (pusnimAppState.wipRoot?.child) {
    commitWork(pusnimAppState.wipRoot.child);
    // 렌더링이 완료된 후에 작업 중인 루트를 현재 루트로 설정합니다.
    pusnimAppState.currentRoot = pusnimAppState.wipRoot;
  }

  // React에서는 렌더링이 완료된 후에 작업 중인 루트를 초기화합니다.
  pusnimAppState.wipRoot = undefined;
}

function commitWork(fiber?: Fiber) {
  // React에서는 fiber가 없는 경우 작업을 종료합니다.
  if (!fiber) {
    return;
  }

  // React에서는 fiber의 부모 노드를 찾아 DOM에 추가합니다.
  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber?.parent;
  }
  const domParent = domParentFiber.dom;

  // React에서는 새로 추가된 노드를 DOM에 추가합니다.
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (
    // React에서는 변경된 노드를 업데이트합니다.
    fiber.effectTag === 'UPDATE' &&
    fiber.dom != null &&
    fiber.alternate
  ) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (
    // React에서는 삭제된 노드를 DOM에서 제거합니다.
    fiber.effectTag === 'DELETION'
  ) {
    commitDeletion(fiber, domParent);
  }

  // React에서는 fiber의 자식과 형제 노드에 대해서도 동일한 작업을 수행합니다.
  commitWork(fiber.child as Fiber);
  commitWork(fiber.sibling as Fiber);
}

function commitDeletion(fiber: Fiber, domParent: DomNode) {
  // React에서는 삭제된 노드를 DOM에서 제거합니다.
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else if (
    // React에서는 자식 노드가 있는 경우, 자식 노드에 대해서도 동일한 작업을 수행합니다.
    fiber?.child
  ) {
    commitDeletion(fiber.child, domParent);
  }
}

function workLoop(deadline: IdleDeadline) {
  // React에서는 작업을 수행할 때, 브라우저의 메인 스레드가 다른 중요한 작업(예: 사용자 입력 처리)을 수행할 수 있도록
  // 작업을 중단할지 여부를 결정하는 shouldYield 플래그를 사용합니다.
  let shouldYield = false;
  while (pusnimAppState.nextUnitOfWork && !shouldYield) {
    // React에서는 작업 단위를 수행하는 performUnitOfWork 함수를 호출합니다.
    pusnimAppState.nextUnitOfWork = performUnitOfWork(
      pusnimAppState.nextUnitOfWork
    );
    // React에서는 deadline의 timeRemaining 메서드를 사용하여 남은 시간을 확인하고,
    // 남은 시간이 1ms 미만인 경우 작업을 중단합니다.
    shouldYield = deadline.timeRemaining() < 1;
  }

  // React에서는 모든 작업 단위가 완료되면 (nextUnitOfWork가 null이면) commit 단계를 수행합니다.
  if (!pusnimAppState.nextUnitOfWork && pusnimAppState.wipRoot) {
    commitRoot();
  }

  // React에서는 requestIdleCallback을 사용하여 브라우저가 유휴 상태일 때 작업을 수행하도록 합니다.
  requestIdleCallback(workLoop);
}

// React에서는 requestIdleCallback을 사용하여 브라우저가 유휴 상태일 때 작업을 수행하도록 합니다.
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
  // 이 함수는 fiber를 인자로 받아 해당 컴포넌트를 업데이트합니다.

  // React에서는 함수형 컴포넌트의 업데이트를 위해 useState와 같은 훅을 사용합니다.
  // useState와 같은 훅을 사용하기 위해 필요한 상태 변수들을 초기화합니다.
  pusnimAppState.wipFiber = fiber;
  pusnimAppState.hookIndex = 0;
  pusnimAppState.wipFiber.hooks = [];

  // React에서는 함수형 컴포넌트의 자식 요소들을 계산합니다.
  // 이 코드에서는 함수형 컴포넌트를 호출하여 자식 요소들을 계산합니다.
  const children = [(fiber.type as Function)(fiber.props)];

  // React에서는 계산된 자식 요소들을 fiber에 연결합니다.
  // 이 코드에서는 reconcileChildren 함수를 호출하여 fiber에 자식 요소들을 연결합니다.
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: Fiber) {
  // React에서는 호스트 컴포넌트를 업데이트하는 함수입니다.
  // *호스트 컴포넌트는 실제 DOM 요소를 나타냅니다. *div, input, button 등 HTML element에 대응하는 컴포넌트

  // 만약 fiber에 연결된 DOM 요소가 없다면, 새로운 DOM 요소를 생성합니다.
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // React에서는 호스트 컴포넌트의 자식 요소들을 조정합니다.
  // 이 코드에서는 reconcileChildren 함수를 호출하여 자식 요소들을 조정합니다.
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

    // 비교 대상인 요소가 있고, 타입이 다른 경우
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

/**
 * React 내부에서 Render 단계는 더 좁은 의미로,
 * JSX 또는 React.createElement()로 작성된 코드를 React 엘리먼트로 변경하는 작업만을 의미한다.
 * React 엘리먼트는 클래스가 아닌 일반 객체로,
 * 사용자가 작성한 컴포넌트 또는 엘리먼트 타입과 어트리뷰트, 자식에 관한 정보를 담고 있는 객체이다.
 */
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
