import { env } from "cloudflare:workers";

export type DatePlanEmailInput = {
  activity: string;
  activityId: string;
  date?: string;
};

export async function sendDatePlanEmail(input: DatePlanEmailInput) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const to = env.NOTIFY_EMAIL?.trim() || "harmonymukolwe@gmail.com";
  const from = env.FROM_EMAIL?.trim() || "Amy Date <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error(
      "Missing RESEND_API_KEY. Add it to .dev.vars (local) or as a Worker secret (production).",
    );
  }

  const dateLine = input.date?.trim()
    ? input.date.trim()
    : "not captured yet (check Calendly)";

  const subject = `Amy locked in: ${input.activity}`;
  const text = [
    "Amy locked in a date plan.",
    "",
    `Activity: ${input.activity}`,
    `Activity id: ${input.activityId}`,
    `Date: ${dateLine}`,
    "",
    "— amy.date plan notifier",
  ].join("\n");

  const html = `
    <div style="font-family: Georgia, serif; color: #5c3a4a; line-height: 1.5;">
      <h1 style="color: #e91e8c; font-size: 22px;">Amy locked in a date plan</h1>
      <p><strong>Activity:</strong> ${escapeHtml(input.activity)}</p>
      <p><strong>Date:</strong> ${escapeHtml(dateLine)}</p>
      <p style="color: #9a7a88; font-size: 13px;">Activity id: ${escapeHtml(input.activityId)}</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend failed (${response.status}): ${details}`);
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
