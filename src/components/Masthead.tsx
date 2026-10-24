import { Logo } from './Logo';
import { activeConfig } from '../config/active';

/** Masthead: SA logo top-left; edition + step indicator top-right. */
export function Masthead({ stepLabel }: { stepLabel: string }) {
  return (
    <header className="masthead">
      <Logo />
      <div className="masthead__right">
        <span className="masthead__edition">{activeConfig.displayName} Edition</span>
        <div className="masthead__step" aria-live="polite">
          {stepLabel}
        </div>
      </div>
    </header>
  );
}
