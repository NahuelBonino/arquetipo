'use client';

import { useTransition } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import PageChange from "@/components/PageChange/PageChange.js";


/**
 * A custom Link component that wraps Next.js's next/link component.
 */
export function ImprovedLink({
  href,
  children,
  replace,
  ...rest
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (isPending) {

    return (
      <>
        <NextLink
          href={href}
          onClick={(e) => {
            e.preventDefault();
            startTransition(() => {
              const url = href.toString();
              if (replace) {
                router.replace(url);
              } else {
                router.push(url);
              }
            });
          }}
          {...rest}
        >
          {children}
        </NextLink>
        <div id="page-transition">
          <PageChange />
        </div>
      </>
    );
  }

  return (
    <NextLink
      href={href}
      onClick={(e) => {
        e.preventDefault();
        startTransition(() => {
          const url = href.toString();
          if (replace) {
            router.replace(url);
          } else {
            router.push(url);
          }
        });
      }}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
