import { DomNode } from './dom-node';
import { Fiber, FiberType } from './fiber';
import { isEvent, isGone, isNew, isProperty } from './helper';

function fragment(props: any) {
  return props.children;
}

function toChildArray(children: any, out: any[]) {
  out = out || [];
  if (children == null || typeof children == 'boolean') {
  } else if (Array.isArray(children)) {
    children.some((child) => {
      toChildArray(child, out);
    });
  } else {
    out.push(children);
  }
  return out;
}

function createElement(type: string, props: any, ...children: any[]) {
  children = toChildArray(children, []);
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text: string) {
  return {
    type: FiberType.TextElement,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createDom(fiber: Fiber): DomNode {
  const dom =
    fiber.type == FiberType.TextElement
      ? document.createTextNode('')
      : document.createElement(fiber.type as unknown as FiberType);

  updateDom(dom, {}, fiber.props);
  return dom;
}

function updateDom(dom: DomNode, prevProps: any, nextProps: any) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name: string) => {
      (dom as any)[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      (dom as any)[name] = nextProps[name];
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
