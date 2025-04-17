// import { data } from "react-router";

import { type ClientLoaderFunctionArgs, useLoaderData } from "react-router";

import { Counter } from "../../counter";

export function loader() {
  // throw new Error("oops");
  // throw data("This is a test error", 404);
  return {
    message: "Hello About!",
  };
}

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
