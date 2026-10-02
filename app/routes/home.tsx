import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { sendProposalAnswerEmail } from "../lib/notify-email";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Amy — a special question" },
    {
      name: "description",
      content: "Amy, will you go out with me?",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const answer = String(formData.get("answer") ?? "").trim().toLowerCase();

  if (answer !== "no" && answer !== "yes") {
    return { ok: false as const, error: "Invalid answer." };
  }

  try {
    await sendProposalAnswerEmail({ answer });
    return { ok: true as const };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send the email.";
    return { ok: false as const, error: message };
  }
}

export default function Home() {
  return <Welcome />;
}
