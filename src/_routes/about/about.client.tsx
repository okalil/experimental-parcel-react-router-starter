"use client";

import { type ClientLoaderFunctionArgs, useLoaderData } from "react-router";

import { Counter } from "../../counter";

import type { loader } from "./about";

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const res = await serverLoader<typeof loader>();

  return {
    client: true,
    ...res,
  };
}
clientLoader.hydrate = true;

export default function About() {
  const { client, message } = useLoaderData<typeof clientLoader>();

  return (
    <main>
      <h1>
        {message} {String(client)}
      </h1>
      <Counter />
    </main>
  );
}

export function ErrorBoundary() {
  return <h1>Oooops</h1>;
}
