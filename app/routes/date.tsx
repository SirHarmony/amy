import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { env } from "cloudflare:workers";

import {
  pickDateFromSearchParams,
  saveSelectedDate,
} from "../lib/date-plan";
import type { Route } from "./+types/date";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Amy — Pick a date" },
    {
      name: "description",
      content: "Choose the day for our cute little plan.",
    },
  ];
}

export function loader() {
  const calendlyUrl = env.calendly?.trim();

  if (!calendlyUrl) {
    throw new Response(
      "Missing calendly URL. Set `calendly` in .dev.vars for local, or as a Worker secret for production.",
      { status: 500 },
    );
  }

  return { calendlyUrl };
}

export default function DatePage({ loaderData }: Route.ComponentProps) {
  const { calendlyUrl } = loaderData;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const embedUrl = `${calendlyUrl}${calendlyUrl.includes("?") ? "&" : "?"}hide_gdpr_banner=1`;

  useEffect(() => {
    const fromQuery = pickDateFromSearchParams(searchParams);
    if (fromQuery) {
      saveSelectedDate(fromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.data?.event !== "calendly.event_scheduled") return;

      const payload = event.data?.payload as
        | {
            event?: { start_time?: string };
            invitee?: { timezone?: string };
          }
        | undefined;

      const startTime = payload?.event?.start_time;
      if (typeof startTime === "string" && startTime.length > 0) {
        saveSelectedDate(startTime);
      }

      navigate("/activity");
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate]);

  return (
    <main className="proposal-page date-page">
      <div className="proposal-glow" aria-hidden />

      <div className="date-card">
        <div className="date-card-header">
          <div className="date-card-icons" aria-hidden>
            <span className="date-calendar-badge">
              <span className="date-calendar-month">JUL</span>
              <span className="date-calendar-day">♥</span>
            </span>
            <span className="date-float-heart date-float-heart-lg">♥</span>
            <span className="date-float-heart date-float-heart-sm">♥</span>
          </div>

          <h1 className="date-card-title">Pick a date</h1>
          <p className="date-card-subtitle">
            Choose the day for our cute little plan.
          </p>
        </div>

        <div className="date-card-scheduler">
          <p className="date-scheduler-label">Select a day</p>
          <div className="calendly-embed-wrap">
            <iframe
              title="Book a date on Calendly"
              src={embedUrl}
              className="calendly-embed"
              loading="lazy"
            />
          </div>
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary date-open-calendly"
          >
            Open Calendly
          </a>
          <Link to="/activity" className="btn-yes btn-continue date-open-calendly">
            I&apos;ve picked a time — continue
          </Link>
        </div>

        <Link to="/" className="date-back-link">
          ← Back home
        </Link>
      </div>
    </main>
  );
}
