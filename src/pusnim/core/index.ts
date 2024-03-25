import { PusnimModel } from '../model/pusnim.model';

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

function createTextElement(text: string): PusnimModel {
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
): PusnimModel {
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
