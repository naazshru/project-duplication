export const TRANSITIONS = [
  { name: "Cinematic Fade", className: "transition-fade" },
  { name: "Slide Drift", className: "transition-slide" },
  { name: "Lens Zoom", className: "transition-zoom" },
  { name: "Vertical Pan", className: "transition-pan" },
  { name: "Tilt Reveal", className: "transition-tilt" },
];

const DEFAULT_MIN_SECONDS = 2;
const DEFAULT_FALLBACK_SECONDS = 4;

/**
 * Clamp the provided numeric value between min and max bounds.
 * Ensures the function gracefully handles NaN and Infinity values.
 */
function clamp(value, min, max) {
  if (!Number.isFinite(value)) {
    return Math.max(min, Math.min(max, 0));
  }
  return Math.max(min, Math.min(max, value));
}

/**
 * Selects a transition from the provided list using the supplied random function.
 * Throws when the transition array is empty to surface incorrect configuration
 * early rather than silently failing at runtime.
 */
export function selectRandomTransition(
  transitions,
  randomFn = Math.random
) {
  if (!Array.isArray(transitions) || transitions.length === 0) {
    throw new Error("Cannot select a transition from an empty list.");
  }

  const randomValue = clamp(Number(randomFn()), 0, 0.999999999999);
  const index = Math.floor(randomValue * transitions.length);
  return transitions[index];
}

/**
 * Normalizes a user-provided slide duration in seconds.
 * - Invalid or missing values fall back to DEFAULT_FALLBACK_SECONDS.
 * - The duration is never shorter than DEFAULT_MIN_SECONDS.
 * - Returns milliseconds to align with setInterval expectations.
 */
export function normalizeSlideDuration(
  inputSeconds,
  {
    minSeconds = DEFAULT_MIN_SECONDS,
    fallbackSeconds = DEFAULT_FALLBACK_SECONDS,
  } = {}
) {
  const parsed = Number.parseInt(inputSeconds, 10);
  const seconds = Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackSeconds;
  const safeSeconds = Math.max(seconds, minSeconds);
  return safeSeconds * 1000;
}
