import { Link } from 'react-router-dom';
import { Logo } from './Logo';


export function AuthLayout({ children, title, subtitle, footer }) {
  return (
    <div className="min-h-screen">


      {/* Right — form */}
      <main className="w-full flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 py-5 lg:px-10">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="hidden lg:block" />
          {footer?.headerLink}
        </header>

        <div className="w-full flex items-center justify-center px-6 pb-12 lg:px-10">
          <div className="w-full max-w-[400px] animate-rise">
            <div className="auth-card rounded-2xl p-7 sm:p-8">
              <div className="mb-7">
                <h1 className="text-[1.375rem] font-semibold tracking-[-0.02em] text-[#fafafa]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1.5 text-sm text-[#a1a1aa] leading-relaxed">{subtitle}</p>
                )}
              </div>

              {children}
            </div>

            {footer?.bottom && (
              <p className="mt-6 text-center text-sm text-[#71717a] lg:hidden">{footer.bottom}</p>
            )}
          </div>
        </div>

        <footer className="px-6 py-5 text-center lg:text-left lg:px-10">
          <p className="text-xs text-[#52525b]">
            &copy; {new Date().getFullYear()} TTTD Inc.{' '}
            <span className="mx-1.5 text-[#3f3f46]">·</span>
            <a href="/privacy" className="hover:text-[#a1a1aa] transition-colors">
              Privacy
            </a>
            <span className="mx-1.5 text-[#3f3f46]">·</span>
            <a href="/terms" className="hover:text-[#a1a1aa] transition-colors">
              Terms
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

export function AuthLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-[#fafafa] hover:text-[#fb7185] transition-colors"
    >
      {children}
    </Link>
  );
}

export function Divider({ label = 'or' }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[rgba(255,255,255,0.08)]" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#0c0c0c] px-3 text-xs text-[#52525b] font-mono">{label}</span>
      </div>
    </div>
  );
}
