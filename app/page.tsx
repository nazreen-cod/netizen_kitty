"use client";

import { useMemo, useRef, useState } from "react";

type SwipeDirection = "left" | "right" | null;

const TOTAL_CATS = 20;
const SWIPE_THRESHOLD = 120;
const ANIMATION_MS = 260;

export default function Home() {
  const cats = useMemo(
    () =>
      Array.from({ length: TOTAL_CATS }, (_, index) => {
        const seed = index + 1;
        return `https://cataas.com/cat?width=720&height=960&random=${seed}`;
      }),
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCats, setLikedCats] = useState<string[]>([]);
  const [dislikedCats, setDislikedCats] = useState<string[]>([]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);

  const startRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);

  const isDone = currentIndex >= cats.length;
  const currentCat = cats[currentIndex];
  const nextCat = cats[currentIndex + 1];

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isAnimating || isDone) return;
    draggingRef.current = true;
    startRef.current = { x: event.clientX, y: event.clientY };
    setOffset({ x: 0, y: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || isAnimating) return;
    const deltaX = event.clientX - startRef.current.x;
    const deltaY = event.clientY - startRef.current.y;
    setOffset({ x: deltaX, y: deltaY });
  };

  const completeSwipe = (direction: SwipeDirection) => {
    if (!direction || isAnimating || isDone || !currentCat) return;
    setIsAnimating(true);
    setSwipeDirection(direction);

    if (direction === "right") {
      setLikedCats((prev) => [...prev, currentCat]);
    } else {
      setDislikedCats((prev) => [...prev, currentCat]);
    }

    window.setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
      setIsAnimating(false);
    }, ANIMATION_MS);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (Math.abs(offset.x) >= SWIPE_THRESHOLD) {
      completeSwipe(offset.x > 0 ? "right" : "left");
    } else {
      setOffset({ x: 0, y: 0 });
    }
  };

  const handleLike = () => completeSwipe("right");
  const handleDislike = () => completeSwipe("left");

  const handleReset = () => {
    setCurrentIndex(0);
    setLikedCats([]);
    setDislikedCats([]);
    setOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
    setIsAnimating(false);
  };

  const tilt = offset.x / 18;
  const likeOpacity = Math.min(Math.max(offset.x / 140, 0), 1);
  const nopeOpacity = Math.min(Math.max(-offset.x / 140, 0), 1);

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Paws & Preferences</p>
          <h1>Find your favourite kitty</h1>
          <p className="subcopy">
            Swipe right to like, left to pass. We will remember your favourites
            and show them at the end.
          </p>
        </div>
        <div className="progress">
          <span>
            {Math.min(currentIndex + 1, cats.length)} / {cats.length}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentIndex / cats.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="card-area">
        {isDone ? (
          <section className="summary">
            <div className="summary-header">
              <h2>You liked {likedCats.length} cats</h2>
              <p>
                Want to swipe again? Start over or keep browsing your favourites.
              </p>
              <button className="btn primary" onClick={handleReset}>
                Start over
              </button>
            </div>
            <div className="summary-grid">
              {likedCats.length === 0 ? (
                <div className="empty-state">
                  <p>No likes yet. Try again and find your perfect kitty.</p>
                </div>
              ) : (
                likedCats.map((catUrl, index) => (
                  <div className="summary-card" key={`${catUrl}-${index}`}>
                    <img src={catUrl} alt="Liked cat" loading="lazy" />
                  </div>
                ))
              )}
            </div>
          </section>
        ) : (
          <div className="card-stack">
            {nextCat && (
              <div className="card card-back">
                <img src={nextCat} alt="Next cat" draggable={false} />
              </div>
            )}
            {currentCat && (
              <div
                className={`card card-front ${
                  swipeDirection === "right"
                    ? "swipe-right"
                    : swipeDirection === "left"
                      ? "swipe-left"
                      : ""
                }`}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) rotate(${tilt}deg)`,
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <img src={currentCat} alt="Cat" draggable={false} />
                <div className="card-overlay">
                  <span className="badge like" style={{ opacity: likeOpacity }}>
                    Like
                  </span>
                  <span className="badge nope" style={{ opacity: nopeOpacity }}>
                    Nope
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {!isDone && (
        <footer className="controls">
          <button className="btn ghost" onClick={handleDislike}>
            Dislike
          </button>
          <button className="btn primary" onClick={handleLike}>
            Like
          </button>
        </footer>
      )}

      {isDone && (
        <footer className="controls muted">
          <span>
            Disliked: {dislikedCats.length} · Liked: {likedCats.length}
          </span>
        </footer>
      )}
    </div>
  );
}
