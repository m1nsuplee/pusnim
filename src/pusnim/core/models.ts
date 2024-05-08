export interface PusnimElement {
  type: string; // 요소의 타입을 나타내는 문자열
  props: any; // 요소의 속성을 나타내는 임의의 객체
}

export type DomNode = HTMLElement | Text; // DOM 노드를 나타내는 타입으로 HTMLElement 또는 Text 타입을 가질 수 있음

/**
 * Fiber 타입은 React의 Fiber 아키텍처를 구현하기 위한 인터페이스
 * React의 Fiber 아키텍처는 가상 DOM을 효율적으로 관리하기 위한 방법으로
 * Fiber라는 개념을 도입하고 있습니다.
 * Fiber는 컴포넌트의 상태, 속성, 자식 컴포넌트 등을 관리하는 객체로
 * 컴포넌트 트리를 효율적으로 업데이트하고 렌더링하기 위해 사용됩니다.
 * Fiber는 컴포넌트 트리를 순회하면서 각 컴포넌트에 대한 정보를 담고 있으며,
 * 필요한 경우 컴포넌트의 상태를 변경하거나 DOM 노드를 생성하고 업데이트합니다.
 * Fiber는 React의 내부에서 사용되는 개념이지만, 이를 직접 구현함으로써
 * React의 동작 방식을 이해하고 가상 DOM을 효율적으로 관리하는 방법을 익힐 수 있다.
 * 파이버는 단순히 작업을 chunk로 분리하여 실행 시간만을 관리하는 것이 아니라 작업의 유형에 따라 우선순위를 부여하고,
 * 기존에 수행 중인 작업보다 더 우선순위가 높은 작업이 인입될 경우 기존의 작업을 일시 중단하고 인입된 작업을 처리 후 다시 돌아오는 기능이 있다.
 * @see https://d2.naver.com/helloworld/2690975
 * @see https://github.com/acdlite/react-fiber-architecture
 */
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
