import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("date", "routes/date.tsx"),
  route("activity", "routes/activity.tsx"),
] satisfies RouteConfig;
