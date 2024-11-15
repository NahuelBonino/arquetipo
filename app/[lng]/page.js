"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Index({ params: { lng } }) {

  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push(`/${lng}/p/inicio`);
    } else {
      router.push(`/${lng}/auth/login`);
    }
  })

  return <div />;
}
