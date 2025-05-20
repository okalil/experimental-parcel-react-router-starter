import { pull } from "@ryanflorence/async-provider";
import { createCookie, Form, redirect } from "react-router";

import { Route } from "./+types/home";
import { stringContext } from "../context";

import { sayHello } from "./home.actions.ts";
import { PendingButton } from "./home.client.tsx";

const cookie = createCookie("my_cookie");

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");
  return {
    message: pull(stringContext),
    name: name || "Unknown",
    cookie: await cookie.parse(request.headers.get("cookie")),
  };
}

export function ServerComponent({ loaderData }: Route.ComponentProps) {
  return (
    <main className="container my-8 px-8 mx-auto">
      <article className="paper prose max-w-none">
        <h1>Home</h1>
        <p>This is the home page.</p>
        <h2>loaderData</h2>
        <pre>
          <code>{JSON.stringify(loaderData)}</code>
        </pre>
        <h2>Server Action</h2>
        <form
          className="no-prose grid gap-6"
          action={sayHello.bind(null, loaderData.name)}
        >
          <div className="grid gap-1">
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              className="input"
              id="name"
              type="text"
              name="name"
              placeholder={loaderData.name}
            />
          </div>
          <div>
            <PendingButton />
          </div>
        </form>

        <h2>Route Action</h2>
        <Form method="POST" replace>
          <button>Submit Route Action</button>
        </Form>
      </article>
    </main>
  );
}

export async function action({ request }: Route.ActionArgs) {
  const value = Math.random().toString(36);
  return redirect(".", {
    headers: [["set-cookie", await cookie.serialize(value)]],
  });
}
