import { Fiber } from '../fiber';

export interface State {
  wipRoot?: Fiber;
  currentRoot: Fiber;
  deletions: Fiber[];
  wipFiber: Fiber;
  nextUnitOfWork?: Fiber;
  hookIndex: number;
}
