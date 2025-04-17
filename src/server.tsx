import { createRequestListener } from "@mjackson/node-fetch-server";
import express from "express";
// @ts-expect-error - no types
import { renderToReadableStream as renderHTMLToReadableStream } from "react-dom/server.edge" with { env: "react-client" };
// @ts-expect-error
import { createFromReadableStream } from "react-server-dom-parcel/client.edge" with { env: "react-client" };
import {
  routeServerRequest,
  ServerStaticRouter,
} from "react-router" with { env: "react-client" };

import { callServer } from "./server-react" with { env: "react-server" };

const app = express();

app.use(express.static("dist"));

app.use(
  createRequestListener(async (request) => {
    return routeServerRequest(
      request,
      callServer,
      createFromReadableStream,
      async (payload) => {
        return await renderHTMLToReadableStream(
          <ServerStaticRouter payload={payload} />,
          {
            bootstrapScriptContent: (
              callServer as unknown as { bootstrapScript: string }
            ).bootstrapScript,
          }
        );
      }
    );
  })
);

app.listen(3000);
console.log("Server listening on port 3000 (http://localhost:3000)");
