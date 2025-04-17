import * as fsp from "node:fs/promises";
import * as path from "node:path";

import oxc from "oxc-parser";
import oxcTransform from "oxc-transform";

import { Resolver } from "@parcel/plugin";
import type { Config } from "@react-router/dev/config";
import {
  type RouteConfig,
  type RouteConfigEntry,
} from "@react-router/dev/routes";
import { createJiti } from "jiti";

import { generate, parse } from "./babel/babel";
import { removeExports } from "./babel/remove-exports";

const loader = createJiti(import.meta.url);

const SERVER_ONLY_ROUTE_EXPORTS = [
  "loader",
  "action",
  "unstable_middleware",
  "headers",
];
const SERVER_ONLY_ROUTE_EXPORTS_SET = new Set(SERVER_ONLY_ROUTE_EXPORTS);
const CLIENT_NON_COMPONENT_EXPORTS = [
  "clientAction",
  "clientLoader",
  "unstable_clientMiddleware",
  "handle",
  "meta",
  "links",
  "shouldRevalidate",
];
const CLIENT_ROUTE_EXPORTS = [
  ...CLIENT_NON_COMPONENT_EXPORTS,
  "default",
  "ErrorBoundary",
  "HydrateFallback",
  "Layout",
];
const CLIENT_ROUTE_EXPORTS_SET = new Set(CLIENT_ROUTE_EXPORTS);

export default new Resolver({
  async loadConfig({ config, options }) {
    const configPath = path.resolve(
      options.projectRoot,
      "react-router.config.ts"
    );

    config.invalidateOnFileChange(configPath);
    config.invalidateOnFileCreate({
      filePath: configPath,
    });

    const rrConfig = await loader
      .import(configPath)
      .then((mod) => (mod as { default: Config }).default)
      .catch((): Config => {
        console.warn("No react-router.config.ts found, using defaults");
        return {};
      });

    const appDirectory = path.resolve(
      options.projectRoot,
      rrConfig.appDirectory || "app"
    );
    const routesPath = path.join(appDirectory, "routes.ts");

    config.invalidateOnFileChange(routesPath);
    config.invalidateOnFileCreate({
      filePath: routesPath,
    });

    const routes = await loader
      .import(routesPath)
      .then((mod) => (mod as { default: RouteConfig }).default)
      .catch(() => {
        console.warn("No routes.ts found, using empty routes.");
        return [];
      });

    return { appDirectory, routes };
  },
  async resolve({ config, options, specifier }) {
    if (specifier === "virtual:react-router/routes") {
      let code = "export default [";

      const closeRouteSymbol = Symbol("CLOSE_ROUTE");
      let stack: Array<typeof closeRouteSymbol | RouteConfigEntry> = [
        ...config.routes,
      ];
      while (stack.length > 0) {
        const route = stack.pop();
        if (!route) break;
        if (route === closeRouteSymbol) {
          code += "},";
          continue;
        }

        code += "{";
        code += `lazy: () => import(${JSON.stringify(
          "virtual-route-module:" +
            path.resolve(config.appDirectory, route.file)
        )}),`;
        if (typeof route.id === "string") {
          code += `id: ${JSON.stringify(route.id)},`;
        }
        if (typeof route.path === "string") {
          code += `path: ${JSON.stringify(route.path)},`;
        }
        if (route.index) {
          code += `index: true,`;
        }
        if (route.caseSensitive) {
          code += `caseSensitive: true,`;
        }
        if (route.children) {
          stack.push(closeRouteSymbol);
          stack.push(...route.children);
        } else {
          code += "},";
        }
      }

      code += "];\n";

      console.log(code);

      return {
        filePath: path.join(process.cwd(), "routes.ts"),
        code,
      };
    }

    const parseExports = async (filePath: string, source: string) => {
      const parsed = await oxc.parseAsync(filePath, source);

      const routeExports = [];
      for (const staticExport of parsed.module.staticExports) {
        for (const entry of staticExport.entries) {
          if (entry.exportName.name) {
            routeExports.push(entry.exportName.name);
          } else {
            routeExports.push("default");
          }
        }
      }
      return routeExports;
    };

    // "?client-route-module"
    // "?server-route-module"
    if (specifier.startsWith("virtual-route-module:")) {
      const filePath = path.resolve(
        config.appDirectory,
        specifier.slice("virtual-route-module:".length)
      );
      const routeSource = await fsp.readFile(filePath, "utf-8");
      const staticExports = await parseExports(filePath, routeSource);

      let code = "";
      for (const staticExport of staticExports) {
        if (staticExport) {
          if (CLIENT_ROUTE_EXPORTS_SET.has(staticExport)) {
            code += `export { ${staticExport} } from ${JSON.stringify("virtual-client-route-module:" + filePath)};\n`;
          } else {
            code += `export { ${staticExport} } from ${JSON.stringify("virtual-server-route-module:" + filePath)};\n`;
          }
        } else {
          code += `export { default } from ${JSON.stringify("virtual-client-route-module:" + filePath)};\n`;
        }
      }

      return {
        filePath,
        code,
        invalidateOnFileChange: [filePath],
      };
    }

    if (specifier.startsWith("virtual-client-route-module:")) {
      const filePath = path.resolve(
        config.appDirectory,
        specifier.slice("virtual-client-route-module:".length)
      );

      const routeSource = await fsp.readFile(filePath, "utf-8");
      const staticExports = await parseExports(filePath, routeSource);

      // TODO: Add sourcemaps.....
      // TODO: Maybe pass TSConfig in here?
      const transformed = oxcTransform.transform(filePath, routeSource);
      const ast = parse(transformed.code, {
        sourceType: "module",
      });
      removeExports(ast, SERVER_ONLY_ROUTE_EXPORTS);

      let code = '"use client";\n' + generate(ast).code;

      return {
        filePath:
          path.dirname(filePath) +
          path.basename(filePath) +
          ".___client-route-module___" +
          path.extname(filePath),
        code,
        invalidateOnFileChange: [filePath],
      };
    }

    if (specifier.startsWith("virtual-server-route-module:")) {
      const filePath = path.resolve(
        config.appDirectory,
        specifier.slice("virtual-server-route-module:".length)
      );
      const routeSource = await fsp.readFile(filePath, "utf-8");
      const staticExports = await parseExports(filePath, routeSource);

      // TODO: Add sourcemaps.....
      // TODO: Maybe pass TSConfig in here?
      const transformed = oxcTransform.transform(filePath, routeSource);
      const ast = parse(transformed.code, {
        sourceType: "module",
      });
      removeExports(ast, CLIENT_ROUTE_EXPORTS);

      let code = generate(ast).code;
      for (const staticExport of staticExports) {
        if (CLIENT_ROUTE_EXPORTS_SET.has(staticExport)) {
          code += `export { ${staticExport} } from ${JSON.stringify("virtual-client-route-module:" + filePath)};\n`;
        }
      }

      return {
        filePath:
          path.dirname(filePath) +
          path.basename(filePath) +
          ".___server-route-module___" +
          path.extname(filePath),
        code: "",
        invalidateOnFileChange: [filePath],
      };
    }
  },
});
