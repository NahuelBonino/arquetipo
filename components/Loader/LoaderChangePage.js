"use client"
import { useEffect, useState } from "react";
import { useTransition } from 'react';
import { useRouter } from "next/navigation";
import PageChange from "components/PageChange/PageChange.js";

const LoaderChangePage = () => {
  const router = useRouter();
  
  const [url, setUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
   /*  router.events.on("routeChangeStart", (url) => {
      setUrl(url);
      document.body.classList.add("body-page-transition");
      setIsLoading(true);
    });

    router.events.on("routeChangeComplete", () => {
      setIsLoading(false);
      document.body.classList.remove("body-page-transition");
    });

    router.events.on("routeChangeError", () => {
      setIsLoading(false);
      document.body.classList.remove("body-page-transition");
    }); */
  }, []);

  console.log("ISPENDING: " + isPending);

  return (
    <>
      {isPending && (
        <div id="page-transition">
          <PageChange path={url} />
        </div>
      )}
    </>
  );
};

export default LoaderChangePage;
