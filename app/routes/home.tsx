import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Amy — a special question" },
    {
      name: "description",
      content: "Amy, will you go out with me?",
    },
  ];
}

export default function Home() {
  return <Welcome />;
}
