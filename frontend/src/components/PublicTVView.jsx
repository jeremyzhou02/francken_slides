import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import AgendaSlide from "./AgendaSlide";

const BACKGROUND_REFRESH_MS = 30_000;
const SCHEDULE_TICK_MS = 15_000;
const MAX_TIMES_PER_FREQUENCY = 10;

function getSlideId(slide) {
  return slide?._id || slide?.displayId || "";
}

function padTimePart(value) {
  return String(value).padStart(2, "0");
}

function getTimeKey(date) {
  return `${padTimePart(date.getHours())}:${padTimePart(date.getMinutes())}`;
}

function getPeriodKey(date, frequency) {
  const datePart = [
    date.getFullYear(),
    padTimePart(date.getMonth() + 1),
    padTimePart(date.getDate()),
  ].join("-");

  if (frequency === "hourly") {
    return `${datePart}T${padTimePart(date.getHours())}`;
  }

  return datePart;
}

function getTimesPerFrequency(slide) {
  if (slide.frequency === "daily") return 1;

  return Math.min(
    Math.max(Number(slide.settings?.timesPerFrequency) || 1, 1),
    MAX_TIMES_PER_FREQUENCY,
  );
}

function getPreferredTimes(slide) {
  if (slide.frequency !== "daily") return [];

  return Array.isArray(slide.settings?.preferredTimes)
    ? slide.settings.preferredTimes.filter(Boolean)
    : [];
}

function getScheduleCountKey(slide, date) {
  const frequency = slide.frequency;
  const preferredTimes = getPreferredTimes(slide);
  const periodKey = getPeriodKey(date, frequency);

  if (preferredTimes.length > 0) {
    return `${getSlideId(slide)}:${frequency}:${periodKey}:${getTimeKey(date)}`;
  }

  return `${getSlideId(slide)}:${frequency}:${periodKey}`;
}

function isSlideEligible(slide, date, displayCounts) {
  if (!slide || slide.frequency === "loop") return true;

  const frequency = slide.frequency;
  if (!["hourly", "daily"].includes(frequency)) return true;

  const preferredTimes = getPreferredTimes(slide);
  const countKey = getScheduleCountKey(slide, date);
  const displayCount = displayCounts[countKey] || 0;

  if (preferredTimes.length > 0) {
    return preferredTimes.includes(getTimeKey(date)) && displayCount < 1;
  }

  return displayCount < getTimesPerFrequency(slide);
}

function countScheduledDisplay(slide, date, displayCounts) {
  if (!slide || slide.frequency === "loop") return displayCounts;
  if (!["hourly", "daily"].includes(slide.frequency)) return displayCounts;

  const countKey = getScheduleCountKey(slide, date);

  return {
    ...displayCounts,
    [countKey]: (displayCounts[countKey] || 0) + 1,
  };
}

function QuoteSlide({ slide, quoteIndex }) {
  const items = slide.settings?.items || [];
  const activeQuote = items.length > 0 ? items[quoteIndex % items.length] : null;

  return (
    <div className="quote-slide">
      <img
        src="/francken.png"
        alt=""
        className="quote-slide-logo"
        aria-hidden="true"
      />
      <div className="quote-slide-content">
        {activeQuote ? (
          <p className="quote-slide-text">
            {activeQuote.quote} <span>~</span> {activeQuote.name}
          </p>
        ) : (
          <p className="quote-slide-text">No quotes available</p>
        )}
      </div>
    </div>
  );
}

function ImageSlide({ slide }) {
  const imageUrl = slide.settings?.imageUrl;

  if (!imageUrl) {
    return <div className="public-slide-fallback">No image available</div>;
  }

  return <img src={imageUrl} alt={slide.title} className="public-image-slide" />;
}

function UnsupportedSlide({ slide }) {
  return (
    <div className="public-slide-fallback">
      <img
        src="/francken.png"
        alt=""
        className="public-fallback-logo"
        aria-hidden="true"
      />
      <h1>{slide.title}</h1>
    </div>
  );
}

function PublicLoadingState() {
  return (
    <div className="public-slide-fallback public-loading-state">
      <img
        src="/francken.png"
        alt=""
        className="public-fallback-logo"
        aria-hidden="true"
      />
      <p>
        Loading slides
        <span className="dot-pulse" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </p>
    </div>
  );
}

export default function PublicTVView() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [quoteIndexes, setQuoteIndexes] = useState({});
  const [displayCounts, setDisplayCounts] = useState({});
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const slidesRef = useRef([]);
  const currentSlideIdRef = useRef(null);

  const visibleSlides = useMemo(
    () => slides.filter((slide) => isSlideEligible(slide, currentTime, displayCounts)),
    [currentTime, displayCounts, slides],
  );
  const currentSlide = visibleSlides[currentSlideIndex] || null;
  const currentSlideId = getSlideId(currentSlide) || "active";
  const currentQuoteIndex = quoteIndexes[currentSlideId] || 0;
  const quoteItems = useMemo(
    () => currentSlide?.settings?.items || [],
    [currentSlide],
  );

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    currentSlideIdRef.current = getSlideId(currentSlide) || null;
  }, [currentSlide]);

  useEffect(() => {
    const scheduleTimer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, SCHEDULE_TICK_MS);

    return () => window.clearInterval(scheduleTimer);
  }, []);

  useEffect(() => {
    setCurrentSlideIndex((current) => {
      if (visibleSlides.length === 0) return 0;

      const activeSlideId = currentSlideIdRef.current;
      const activeSlideIndex = visibleSlides.findIndex(
        (slide) => getSlideId(slide) === activeSlideId,
      );

      if (activeSlideIndex >= 0) return activeSlideIndex;

      return Math.min(current, visibleSlides.length - 1);
    });
  }, [visibleSlides]);

  useEffect(() => {
    let isMounted = true;

    const fetchSlides = async ({ showLoading = false } = {}) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await axios.get(`${baseUrl}/api/slides`);
        const nextSlides = response.data || [];

        if (!isMounted) return;

        setSlides(nextSlides);
        setError("");
      } catch (err) {
        if (!isMounted) return;

        if (slidesRef.current.length === 0) {
          setError(err.response?.data?.message || "Could not load slides.");
        }
      } finally {
        if (isMounted && showLoading) {
          setIsLoading(false);
        }
      }
    };

    fetchSlides({ showLoading: true });
    const refreshTimer = window.setInterval(fetchSlides, BACKGROUND_REFRESH_MS);

    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
    };
  }, [baseUrl]);

  useEffect(() => {
    if (!currentSlide || visibleSlides.length === 0) return undefined;

    const durationMs = Math.max(Number(currentSlide.duration) || 10, 1) * 1000;

    const timer = window.setTimeout(() => {
      const finishedAt = new Date();

      if (currentSlide.type === "quote" && quoteItems.length > 0) {
        setQuoteIndexes((current) => ({
          ...current,
          [currentSlideId]: ((current[currentSlideId] || 0) + 1) % quoteItems.length,
        }));
      }

      setDisplayCounts((current) =>
        countScheduledDisplay(currentSlide, finishedAt, current),
      );
      setCurrentTime(finishedAt);
      setCurrentSlideIndex((current) => (current + 1) % visibleSlides.length);
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [currentSlide, currentSlideId, quoteItems.length, visibleSlides.length]);

  if (error) {
    return <div className="public-tv-container">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="public-tv-container">
        <PublicLoadingState />
      </div>
    );
  }

  if (!currentSlide) {
    return <div className="public-tv-container">No slides available</div>;
  }

  return (
    <div className="public-tv-container">
      {currentSlide.type === "quote" && (
        <QuoteSlide slide={currentSlide} quoteIndex={currentQuoteIndex} />
      )}
      {currentSlide.type === "image" && <ImageSlide slide={currentSlide} />}
      {currentSlide.type === "agenda" && (
        <AgendaSlide items={currentSlide.settings?.items || []} />
      )}
      {!["quote", "image", "agenda"].includes(currentSlide.type) && (
        <UnsupportedSlide slide={currentSlide} />
      )}
    </div>
  );
}
