import { Route } from "./+types/home";

export function loader({}: Route.LoaderArgs) {
  return "hello, world";
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main>
      <h1>Home</h1>
      <p>This is the home page.</p>
      <p>loaderData: {loaderData}</p>
    </main>
  );
}
