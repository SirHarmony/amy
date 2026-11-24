import { useEffect, useRef, useState } from "react";
import { Link, useFetcher } from "react-router";

type Answer = "yes" | "no" | null;

type Heart = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
};

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  color: string;
};

const CONFETTI_COLORS = ["#ff4d94", "#ff7ab8", "#ffb3d1", "#fff0f5", "#e91e8c"];

function createFloatingHearts(count: number): Heart[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 10 + Math.random() * 10,
    size: 10 + Math.random() * 18,
    drift: -20 + Math.random() * 40,
  }));
}

function createConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.8 + Math.random() * 1.4,
    size: 8 + Math.random() * 14,
    rotation: Math.random() * 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));
}

export function Welcome() {
  const answerFetcher = useFetcher();
  const [answer, setAnswer] = useState<Answer>(null);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [hearts] = useState(() => createFloatingHearts(14));
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const playgroundRef = useRef<HTMLDivElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const noEmailSentRef = useRef(false);

  useEffect(() => {
    if (answer === "yes") {
      setConfetti(createConfetti(36));
    }
  }, [answer]);

  function dodgeNo() {
    const playground = playgroundRef.current;
    const btn = noBtnRef.current;
    if (!playground || !btn) return;

    const area = playground.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const padding = 12;
    const maxX = Math.max(padding, area.width - btnRect.width - padding);
    const maxY = Math.max(padding, area.height - btnRect.height - padding);

    let nextX = Math.random() * maxX;
    let nextY = Math.random() * maxY;
    let attempts = 0;

    // Keep a little distance from the current spot so the dodge feels intentional
    while (attempts < 8 && Math.hypot(nextX - noPos.x, nextY - noPos.y) < 80) {
      nextX = Math.random() * maxX;
      nextY = Math.random() * maxY;
      attempts += 1;
    }

    setHasMoved(true);
    setNoPos({ x: nextX, y: nextY });
  }

  function handleYes() {
    setAnswer("yes");
  }

  function handleNo() {
    setAnswer("no");
    if (noEmailSentRef.current || answerFetcher.state !== "idle") return;
    noEmailSentRef.current = true;
    answerFetcher.submit({ answer: "no" }, { method: "post" });
  }

  if (answer === "yes") {
    return (
      <main className="proposal-page">
        <div className="proposal-glow" aria-hidden />
        <div className="proposal-content proposal-success">
          <p className="proposal-brand">Amy</p>
          <h1 className="proposal-title proposal-title-success">
            Yay — it&apos;s a date!
          </h1>
          <p className="proposal-subtitle">
            You just made my heart do a little dance. Can&apos;t wait to see
            you. Let&apos;s navigate this forest and vast ocean together.
          </p>
          <div className="success-photos" aria-label="Our forest memories">
            <figure className="success-photo">
              <img
                src="/memories/us-trail.jpg"
                alt="Amy and I smiling together on a forest trail"
                loading="lazy"
              />
            </figure>
            <figure className="success-photo">
              <img
                src="/memories/forest-path.jpg"
                alt="A quiet path through the trees"
                loading="lazy"
              />
            </figure>
            <figure className="success-photo">
              <img
                src="/memories/ocean.jpg"
                alt="A view of the ocean"
                loading="lazy"
              />
            </figure>
            <figure className="success-photo">
              <img
                src="/memories/beach.jpg"
                alt="A view of the beach"
                loading="lazy"
              />
            </figure>
          </div>
          <div className="success-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setAnswer(null);
                setConfetti([]);
                setHasMoved(false);
                setNoPos({ x: 0, y: 0 });
              }}
            >
              Ask me again
            </button>
            <Link to="/date" className="btn-yes btn-continue">
              Press to continue
            </Link>
          </div>
        </div>
        <div className="confetti-layer" aria-hidden>
          {confetti.map((piece) => (
            <span
              key={piece.id}
              className="confetti-heart"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                fontSize: `${piece.size}px`,
                color: piece.color,
                ["--spin" as string]: `${piece.rotation}deg`,
              }}
            >
              ♥
            </span>
          ))}
        </div>
      </main>
    );
  }

  if (answer === "no") {
    return (
      <main className="proposal-page">
        <div className="proposal-glow" aria-hidden />
        <div className="proposal-content proposal-success">
          <p className="proposal-brand">Amy</p>
          <h1 className="proposal-title">Nice try…</h1>
          <p className="proposal-subtitle">
            My heart still says yes. Want to give that another look?
          </p>
          <button
            type="button"
            className="btn-yes"
            onClick={() => {
              setAnswer(null);
              setHasMoved(false);
              setNoPos({ x: 0, y: 0 });
              noEmailSentRef.current = false;
            }}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="proposal-page">
      <div className="proposal-glow" aria-hidden />
      <div className="floating-hearts" aria-hidden>
        {hearts.map((heart) => (
          <span
            key={heart.id}
            className="floating-heart"
            style={{
              left: `${heart.left}%`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
              fontSize: `${heart.size}px`,
              ["--drift" as string]: `${heart.drift}px`,
            }}
          >
            ♥
          </span>
        ))}
      </div>

      <div className="proposal-content">
        <p className="proposal-brand">Amazing Amy</p>

        <p className="proposal-subtitle">I&apos;ve been wanting to ask…</p>
        <p className="proposal-subtitle">
          I have liked you a good one for a while now. When I call you 'Amazing
          Amy', it is a testament to the kind of person you are in my view. And
          I think many of our values align. <br />
          <br />I would love to have the chance to get to know you better. I
          have missed the chance to let you know how I felt before, and I do not
          want to waste the opportunity to know if you perhaps would feel the
          same way. <br />
          <br />
          You may wonder what I would like to achieve with this move,
          understandably so. I would like to go out with you, and see if we
          would be a good fit for each other, and if we would both like to
          pursue a relationship together, one whose aim is to end up in a Godly
          marriage and family - aimed at doing life together, through the highs
          and lows, and whatnot (I learnt this from someone I know [tears of
          joy] [tears of joy]).
          <br />
          <br />
          This is a big decision for me, and I'd presume it is for you as well.
          Therefore, please take your time and make a prayerful consideration.
          Inasmuch as it would make me happy for you to say yes, an honest
          answer, without compulsion, would be greatly appreciated. <br />
          <br />
          Whatever direction this may take (either after your response or after
          the discussion I'm hoping a 'yes' would spark), I pray that God will
          help me/ us with 2 things; <br />
          1. That you won't ever have to guess where I stand when it comes to
          you, and <br />
          2.That our interaction will push us closer to God, and that we shall
          both enter heaven. &#128513;
          <br />
          <br />I look forward to your response.
          <br />
          So here goes the question...
        </p>

        <h1 className="proposal-title pt-12">
          Will you go
          <br />
          out on a date with me?
        </h1>

        <div className="button-playground" ref={playgroundRef}>
          <button type="button" className="btn-yes" onClick={handleYes}>
            Yes
          </button>

          <button
            ref={noBtnRef}
            type="button"
            className={`btn-no${hasMoved ? " btn-no-moved" : ""}`}
            style={
              hasMoved
                ? {
                    position: "absolute",
                    left: noPos.x,
                    top: noPos.y,
                    margin: 0,
                  }
                : undefined
            }
            onMouseEnter={dodgeNo}
            onClick={handleNo}
            aria-label="No (it might try to run away)"
          >
            No
          </button>
        </div>

        <p className="proposal-hint">
          Tip: the little one gets shy when you get close.
        </p>
      </div>
    </main>
  );
}
