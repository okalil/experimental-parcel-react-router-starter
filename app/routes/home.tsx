import { useLoaderData } from "react-router";

export default function Home() {
  const loaderData = useLoaderData();
  
  return (
    <main>
      <h1>Home</h1>
      <p>This is the home page.</p>
      <p>loaderData: {loaderData}</p>
    </main>
  );
}

export const loader = () => "Hello from server loader";
export const action = () => {};
