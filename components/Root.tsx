"use client";
import { type PropsWithChildren } from "react";
import { useDidMount } from "@/hooks/useDidMount";

export function Root({ children }: PropsWithChildren) {
  const didMount = useDidMount();

  return didMount ? <>{children} </> : <div>Loading</div>;
}
