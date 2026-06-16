import React, { createContext, useContext, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter as useNextRouter, useParams as useNextParams, usePathname, useSearchParams as useNextSearchParams } from 'next/navigation';

// 1. Link component mapping
export const Link = React.forwardRef(({ to, ...props }, ref) => {
  return <NextLink ref={ref} href={to || '#'} {...props} />;
});
Link.displayName = 'Link';

// 2. useNavigate mapping
export function useNavigate() {
  const router = useNextRouter();
  return (to, options) => {
    if (to === -1) {
      router.back();
    } else if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

// 3. useParams mapping
export function useParams() {
  const params = useNextParams();
  return params || {};
}

// 4. useLocation mapping
export function useLocation() {
  const pathname = usePathname() || '';
  const searchParams = useNextSearchParams();
  return {
    pathname,
    search: searchParams ? `?${searchParams.toString()}` : '',
    hash: '',
    state: null,
  };
}

// 5. useSearchParams mapping
export function useSearchParams() {
  const searchParams = useNextSearchParams();
  const router = useNextRouter();
  const pathname = usePathname();

  const setSearchParams = (nextParams) => {
    const params = new URLSearchParams(nextParams);
    router.push(`${pathname}?${params.toString()}`);
  };

  return [searchParams || new URLSearchParams(), setSearchParams];
}

// 6. Outlet Layout mapping
const OutletContext = createContext(null);

export function OutletProvider({ children, value }) {
  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
}

export function Outlet() {
  const context = useContext(OutletContext);
  return context || null;
}

// 7. Navigate component mapping
export function Navigate({ to, replace = true }) {
  const router = useNextRouter();
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);
  return null;
}

// 8. Dummies for root router declarations (prevent compilation crash if referenced)
export const BrowserRouter = ({ children }) => <>{children}</>;
export const Routes = ({ children }) => <>{children}</>;
export const Route = () => null;
