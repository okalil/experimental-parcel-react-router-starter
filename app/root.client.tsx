"use client";

import {
  isRouteErrorResponse,
  useNavigation,
  useRouteError,
} from "react-router";

export function GlobalNavigationLoadingBar() {
  const navigation = useNavigation();

  if (navigation.state === "idle") return null;

  return (
    <div className="h-1 w-full bg-pink-100 overflow-hidden fixed top-0 left-0 z-50 opacity-50">
      <div className="animate-progress origin-[0%_50%] w-full h-full bg-pink-500" />
    </div>
  );
}

export function ErrorReporter() {
  let error = useRouteError();
  return (
    <p>
      {isRouteErrorResponse(error)
        ? `${error.status} ${JSON.stringify(error.data)}`
        : error instanceof Error
          ? error.message
          : "Unknown Error"}
    </p>
  );
}
