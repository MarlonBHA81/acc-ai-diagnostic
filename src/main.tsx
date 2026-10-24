import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QuizProvider } from './state/QuizContext';
import { activeConfig } from './config/active';
import { App } from './App';
import { SharedResult } from './screens/SharedResult';
import './styles/global.css';

// Tag the document with the active vertical so the scoped per-vertical theme
// (e.g. the accounting "ledger" look in styles/theme-accounting.css) applies.
document.documentElement.setAttribute('data-vertical', activeConfig.slug);

// Minimal path routing: /r/:id renders a shared, read-only results page;
// everything else is the diagnostic app.
const sharedMatch = window.location.pathname.match(/^\/r\/([0-9a-fA-F-]{36})\/?$/);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {sharedMatch ? (
      <SharedResult id={sharedMatch[1]} />
    ) : (
      <QuizProvider config={activeConfig}>
        <App />
      </QuizProvider>
    )}
  </StrictMode>,
);
