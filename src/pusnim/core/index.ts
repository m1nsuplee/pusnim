import { DomNode, Fiber, PusnimElement } from './models';
import { pusnimAppState } from './models/state';
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
