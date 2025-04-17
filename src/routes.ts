import type { ServerRouteObject } from "react-router/server";

export const routes = [
  {
    id: "root",
    path: "",
    lazy: () => import("./_routes/root/root"),
    children: [
      {
        id: "home",
        index: true,
        lazy: () => import("./_routes/home/home"),
      },
      {
        id: "about",
        path: "about",
        lazy: () => import("./_routes/about/about"),
      },
    ],
  },
] satisfies ServerRouteObject[];
