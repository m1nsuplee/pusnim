export interface PusnimElement {
  type: string; // 요소의 타입을 나타내는 문자열
  props: any; // 요소의 속성을 나타내는 임의의 객체
}

export type DomNode = HTMLElement | Text; // DOM 노드를 나타내는 타입으로 HTMLElement 또는 Text 타입을 가질 수 있음

export interface Fiber {
  type?: string | Function; // 컴포넌트의 타입을 나타내는 문자열 또는 함수
  props: {
    children: Fiber[]; // 자식 컴포넌트들을 나타내는 Fiber 배열
    [key: string]: any; // 임의의 속성을 가질 수 있는 객체
  };
  dom?: DomNode; // 컴포넌트에 대응하는 실제 DOM 노드
  parent?: Fiber; // 부모 컴포넌트에 대한 참조
  sibling?: Fiber; // 다음 형제 컴포넌트에 대한 참조
  child?: Fiber; // 첫 번째 자식 컴포넌트에 대한 참조
  alternate?: Fiber; // 이전 상태의 Fiber에 대한 참조
  effectTag?: string; // 컴포넌트에 적용되어야 하는 변경 사항을 나타내는 문자열
  hooks?: any[]; // 컴포넌트의 상태를 관리하는 훅 배열
}

export interface PusnimAppState {
  currentRoot: Fiber; // 현재 렌더링된 루트 컴포넌트에 대한 참조
  deletions: Fiber[]; // 삭제된 컴포넌트들에 대한 배열
  wipFiber: Fiber; // 현재 작업 중인 Fiber에 대한 참조
  nextUnitOfWork?: Fiber; // 다음 작업 단위로 처리해야 할 Fiber에 대한 참조
  wipRoot?: Fiber; // 현재 작업 중인 루트 컴포넌트에 대한 참조
  hookIndex: number; // 현재 훅의 인덱스
}
