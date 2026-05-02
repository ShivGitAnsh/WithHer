'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ForHerModeSwitch } from '@/components/sara/forher-mode-provider';
import { SaraLogo } from '@/components/sara/sara-logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Explore' },
  { href: '/my-trips', label: 'My Trips' },
  { href: '/safety', label: 'Safety' },
  { href: '/guardians', label: 'Guardians' }
];

export function SaraNavigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 pt-4 sm:pt-5">
      <div className="page-shell">
        <div className="nav-shell flex flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="shrink-0">
              <SaraLogo />
            </Link>

            <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/82 px-2 py-2 shadow-sm">
                {navItems.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm font-medium transition',
                        active
                          ? 'bg-[linear-gradient(97deg,#0a58ca_0%,#008cff_100%)] text-white shadow-[0_10px_18px_rgba(0,140,255,0.22)]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="flex items-center gap-3">
              <ForHerModeSwitch />
              <Link href="/profile" className="shrink-0">
                <Avatar className="h-11 w-11 border border-white/80 bg-white shadow-[0_10px_24px_rgba(7,31,62,0.12)]">
                  <AvatarFallback className="bg-white text-sm font-semibold text-slate-700">
                    SR
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>

          <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 lg:hidden">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-[linear-gradient(97deg,#0a58ca_0%,#008cff_100%)] text-white shadow-[0_10px_18px_rgba(0,140,255,0.22)]'
                      : 'bg-white/82 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }

  if (href === '/my-trips') {
    return pathname === '/my-trips' || pathname.startsWith('/trips/');
  }

  return pathname === href;
}
