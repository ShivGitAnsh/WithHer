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
    <header className="sticky top-0 z-50 bg-[linear-gradient(180deg,rgba(10,89,213,0.97),rgba(33,126,245,0.88)_60%,rgba(219,238,255,0)_100%)] pb-4 pt-3">
      <div className="page-shell">
        <div className="nav-shell flex flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="shrink-0">
              <SaraLogo />
            </Link>

            <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e1ebf8] bg-[#f8fbff] px-2 py-2 shadow-sm">
                {navItems.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm font-medium transition',
                        active
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-600 hover:bg-white hover:text-slate-950'
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
                <Avatar className="h-11 w-11 border border-[#d9e6f5] bg-white shadow-sm">
                  <AvatarFallback className="bg-white text-sm font-semibold text-slate-700">
                    You
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
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-950'
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
