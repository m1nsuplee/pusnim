import { App } from './app';
import Pusnim from './pusnim';

Pusnim.createRoot(document.getElementById('app') as HTMLElement).render(
  <App />
);
