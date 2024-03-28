import Pusnim from './pusnim';
import { useState } from './pusnim';

export function App() {
  const [count, setCount] = useState<number>(0);

  const increase = () => setCount((prev) => prev + 1);
  const decrease = () => setCount((prev) => prev - 1);

  return (
    <div>
      <span>{count}</span>
      <button onClick={increase}>Increase</button>
      <button onClick={decrease}>Decrease</button>
    </div>
  );
}
