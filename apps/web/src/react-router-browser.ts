import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  type RouteObject,
} from "react-router";
import { RouterProvider } from "react-router/dom";

const basename =
  import.meta.env.BASE_URL === "./"
    ? "/"
    : import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export { Navigate, Outlet, RouterProvider, useNavigate, useParams };

export function createHashRouter(routes: RouteObject[]) {
  return createBrowserRouter(routes, { basename });
}
