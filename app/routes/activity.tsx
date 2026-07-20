import { useEffect, useMemo, useState } from "react";
import { Link, useFetcher, useSearchParams } from "react-router";

import {
  pickDateFromSearchParams,
  readSelectedDate,
  saveSelectedDate,
} from "../lib/date-plan";
import { sendDatePlanEmail } from "../lib/notify-email";
import type { Route } from "./+types/activity";

type ActivityId = "dinner" | "movie" | "coffee" | "picnic" | "custom";

type ActivityOption = {
  id: ActivityId;
  label: string;
  emoji: string;
};

const ACTIVITIES: ActivityOption[] = [
  { id: "dinner", label: "Dinner date", emoji: "🍝" },
  { id: "movie", label: "Movie night", emoji: "🍿" },
  { id: "coffee", label: "Coffee", emoji: "☕" },
  { id: "picnic", label: "Picnic", emoji: "🌸" },
  { id: "custom", label: "My own idea…", emoji: "✍️" },
];

const ACTIVITY_IDS = new Set<string>(ACTIVITIES.map((activity) => activity.id));

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Amy — Pick an activity" },
    {
      name: "description",
      content: "What would you like to do on our date?",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const activityId = String(formData.get("activityId") ?? "").trim();
  const activity = String(formData.get("activity") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();

  if (!ACTIVITY_IDS.has(activityId) || !activity) {
    return { ok: false as const, error: "Pick an activity first." };
  }

  try {
    await sendDatePlanEmail({
      activityId,
      activity,
      date: date || undefined,
    });
    return { ok: true as const };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send the email.";
    return { ok: false as const, error: message };
  }
}

export default function ActivityPage() {
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher<typeof action>();
  const [selectedId, setSelectedId] = useState<ActivityId | null>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [lockedLabel, setLockedLabel] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fromQuery = pickDateFromSearchParams(searchParams);
    if (fromQuery) {
      saveSelectedDate(fromQuery);
      setSelectedDate(fromQuery);
      return;
    }

    setSelectedDate(readSelectedDate());
  }, [searchParams]);

  const selectedActivity = useMemo(
    () => ACTIVITIES.find((activity) => activity.id === selectedId) ?? null,
    [selectedId],
  );

  const canLock =
    selectedId !== null &&
    (selectedId !== "custom" || customIdea.trim().length > 0);

  const isSubmitting = fetcher.state !== "idle";
  const submitOk = fetcher.data?.ok === true;
  const submitError =
    fetcher.data && fetcher.data.ok === false ? fetcher.data.error : null;

  function handleLockIn() {
    if (!selectedActivity || !canLock || isSubmitting) return;

    const activityLabel =
      selectedActivity.id === "custom"
        ? customIdea.trim()
        : `${selectedActivity.label} ${selectedActivity.emoji}`;

    setLockedLabel(activityLabel);

    fetcher.submit(
      {
        activityId: selectedActivity.id,
        activity: activityLabel,
        date: selectedDate ?? "",
      },
      { method: "post" },
    );
  }

  return (
    <main className="proposal-page activity-page">
      <div className="proposal-glow" aria-hidden />

      <div className="activity-card">
        <div className="activity-card-icons" aria-hidden>
          <span>🍿</span>
          <span>🍝</span>
          <span>🌸</span>
        </div>

        <h1 className="activity-card-title">What would you like to do?</h1>

        <div
          className="activity-grid"
          role="listbox"
          aria-label="Date activities"
        >
          {ACTIVITIES.map((activity) => {
            const isSelected = selectedId === activity.id;
            return (
              <button
                key={activity.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`activity-option${isSelected ? " is-selected" : ""}`}
                onClick={() => {
                  setSelectedId(activity.id);
                  setLockedLabel(null);
                }}
              >
                <span>
                  {activity.label} {activity.emoji}
                </span>
              </button>
            );
          })}
        </div>

        {selectedId === "custom" && (
          <label className="activity-custom">
            <span className="activity-custom-label">What&apos;s the plan?</span>
            <input
              type="text"
              className="activity-custom-input"
              placeholder="e.g. sunset walk + ice cream"
              value={customIdea}
              onChange={(event) => {
                setCustomIdea(event.target.value);
                setLockedLabel(null);
              }}
              maxLength={80}
            />
          </label>
        )}

        <button
          type="button"
          className="btn-yes btn-continue activity-lock-btn"
          onClick={handleLockIn}
          disabled={!canLock || isSubmitting}
        >
          {isSubmitting ? "Sending…" : "Lock it in"}
        </button>

        {lockedLabel && (
          <div
            className="activity-confirmation"
            role="status"
            aria-live="polite"
          >
            <p>
              Perfect. It is a date:{" "}
              <strong>
                {lockedLabel}
                {selectedDate ? ` on ${selectedDate}` : ""}
              </strong>
            </p>
            {submitError && (
              <p className="activity-send-note activity-send-error">
                {submitError}
              </p>
            )}
            <div className="activity-confirmation-hearts" aria-hidden>
              <span>♥</span>
              <span>♥</span>
            </div>
          </div>
        )}

        <Link to="/date" className="date-back-link">
          ← Back to date
        </Link>
      </div>
    </main>
  );
}
