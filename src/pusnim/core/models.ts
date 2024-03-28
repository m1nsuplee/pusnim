export interface RequestIdleCallbackDeadline {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
}

export interface PusnimElement {
  type: string;
  props: any;
}

export type DomNode = HTMLElement | Text;

export interface Fiber {
  type?: string | Function;
  props: {
    children: Fiber[];
    [key: string]: any;
  };
  dom?: DomNode;
  parent?: Fiber;
  sibling?: Fiber;
  child?: Fiber;
  alternate?: Fiber;
  effectTag?: string;
  hooks?: any[];
}

export interface PusnimAppState {
  currentRoot: Fiber;
  deletions: Fiber[];
  wipFiber: Fiber;
  nextUnitOfWork?: Fiber;
  wipRoot?: Fiber;
  hookIndex: number;
}
