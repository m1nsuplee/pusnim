import { DomNode } from '../dom-node/dom-node.model';

export enum FiberType {
  TextElement = 'TEXT_ELEMENT',
}

export interface Fiber {
  props: any;
  alternate?: Fiber;
  dom?: DomNode;
  type?: FiberType | Function;
  effectTag?: FiberEffectTag;
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  hooks?: any[];
}

export enum FiberEffectTag {
  Deletion = 'DELETION',
  Update = 'UPDATE',
  Placement = 'PLACEMENT',
}
