"use server-entry";

// @ts-expect-error
import { renderToReadableStream } from "react-server-dom-parcel/server.edge";
import { matchServerRequest } from "react-router/server";
import "virtual:react-router/routes";

import "./client";
// import { routes } from "./routes";
// @ts-expect-error
import routes from "virtual:react-router/routes";

routes[0].lazy().then((mod) => console.log(mod));

export async function callServer(request: Request) {
  const match = await matchServerRequest({ request, routes });
  if (match instanceof Response) {
    return match;
  }

  return new Response(renderToReadableStream(match.payload), {
    status: match.statusCode,
    headers: match.headers,
  });
}
