import { Link, Outlet } from "react-router";

import { GlobalNavigationLoadingBar } from "./root.client.tsx";
import "./styles.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Neucha&family=Patrick+Hand+SC&display=swap"
          rel="stylesheet"
        />
        <title>React Router Parcel</title>
      </head>
      <body>
        <header className="container px-8 my-8 mx-auto">
          <nav className="paper paper-border">
            <ul className="flex gap-4 flex-wrap">
              <li className="flex gap-4 not-last:after:block not-last:after:content-['|']">
                <Link to="/">Home</Link>
              </li>
              <li className="flex gap-4 not-last:after:block not-last:after:content-['|']">
                <Link to="/about">About</Link>
              </li>
            </ul>
          </nav>
        </header>
        <GlobalNavigationLoadingBar />
        {children}
      </body>
    </html>
  );
}

export function ServerComponent() {
  return (
    <div id="root">
      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  return <h1>Oooops</h1>;
}
