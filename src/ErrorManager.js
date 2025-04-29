import React, { useState, useEffect } from "react";
import styled, { css, keyframes } from "styled-components";

// --- Helper function to get the correct icon SVG based on type ---
const getIcon = (type) => {
  switch (type) {
    case "success":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    case "info":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    case "warning":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    case "error":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    // Default/fallback icon
    default:
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"
          />
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          />
        </svg>
      );
  }
};

// --- Define the progress bar animation shape ---
const progressBarShape = keyframes`
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
`;

// --- Styled Component for a single notification item ---
const StyledNotificationItem = styled.div`
  /* Shared variables */
  --content-color: black;
  --background-color: #f3f3f3;
  --font-size-content: 0.85em; /* Slightly larger text */
  --icon-size: 1.3em; /* Slightly larger icon */
  --grid-color: rgba(225, 225, 225, 0.7);

  /* Core Styles */
  width: 300px; /* Fixed width */
  position: absolute;
  top: 30px;
  left: 0px;
  display: flex;
  z-index: 100;
  align-items: center; /* Vertically center icon and text */
  gap: 0.8em; /* Gap between icon and text block */
  overflow: hidden; /* Needed for progress bar and border-radius */
  padding: 12px 15px; /* Adjusted padding */
  border-radius: 6px;
  box-shadow: rgba(111, 111, 111, 0.2) 0px 8px 24px;
  background-color: var(--background-color);
  transition: opacity 300ms ease-in-out, transform 300ms ease-in-out; /* For potential future animations */
  font-family: sans-serif;
  color: var(--content-color);
  margin-bottom: 0.75em; /* Space between stacked notifications */

  /* Default background pattern */
  background-image: linear-gradient(
      0deg,
      transparent 23%,
      var(--grid-color) 24%,
      var(--grid-color) 25%,
      transparent 26%,
      transparent 73%,
      var(--grid-color) 74%,
      var(--grid-color) 75%,
      transparent 76%,
      transparent
    ),
    linear-gradient(
      90deg,
      transparent 23%,
      var(--grid-color) 24%,
      var(--grid-color) 25%,
      transparent 26%,
      transparent 73%,
      var(--grid-color) 74%,
      var(--grid-color) 75%,
      transparent 76%,
      transparent
    );
  background-size: 55px 55px;

  /* SVG icon styles */
  svg {
    transition: color 250ms ease; /* Transition color changes */
    width: var(--icon-size);
    height: var(--icon-size);
    color: var(--content-color); /* Default icon color */
    flex-shrink: 0; /* Prevent icon from shrinking */
  }

  /* Container for icon and text (now handled by the main flex container) */
  /* .notification-content is removed as direct child handles flex layout */

  .notification-icon {
    display: flex; /* Ensures icon itself is aligned if needed */
    align-items: center;
  }

  .notification-text {
    font-size: var(--font-size-content);
    user-select: none;
    flex-grow: 1; /* Allow text to wrap and take remaining space */
    line-height: 1.4; /* Improve readability for wrapped text */
    word-break: break-word; /* Break long words if necessary */
  }

  /* Progress bar */
  .notification-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px; /* Slightly thicker bar */
    background: var(--content-color);
    width: 100%;
    /* Apply the animation using props */
    animation: ${progressBarShape} ${(props) => props.duration / 1000}s linear
      forwards;
    /* 'forwards' keeps it at the end state (fully hidden) */
  }

  /* --- Type-specific styles --- */
  ${({ type }) =>
    type === "success" &&
    css`
      color: #047857;
      background-color: #d1fae5; /* Lighter green background */
      --grid-color: rgba(16, 185, 129, 0.15); /* Softer grid */

      svg {
        color: #059669;
      } /* Slightly brighter icon */
      .notification-progress-bar {
        background-color: #059669;
      }
      &:hover {
        background-color: #a7f3d0;
      } /* Hover effect */
      background-image: linear-gradient(
          0deg,
          transparent 23%,
          var(--grid-color) 24%,
          var(--grid-color) 25%,
          transparent 26%,
          transparent 73%,
          var(--grid-color) 74%,
          var(--grid-color) 75%,
          transparent 76%,
          transparent
        ),
        linear-gradient(
          90deg,
          transparent 23%,
          var(--grid-color) 24%,
          var(--grid-color) 25%,
          transparent 26%,
          transparent 73%,
          var(--grid-color) 74%,
          var(--grid-color) 75%,
          transparent 76%,
          transparent
        );
    `}

  ${({ type }) =>
    type === "info" &&
    css`
      color: #1e40af; /* Darker blue text */
      background-color: #dbeafe; /* Lighter blue background */
      --grid-color: rgba(59, 130, 246, 0.15); /* Softer grid */

      svg {
        color: #2563eb;
      } /* Standard blue icon */
      .notification-progress-bar {
        background-color: #2563eb;
      }
      &:hover {
        background-color: #bfdbfe;
      }
      background-image: linear-gradient(
          0deg,
          transparent 23%,
          var(--grid-color) 24%,
          var(--grid-color) 25%,
          transparent 26%,
          transparent 73%,
          var(--grid-color) 74%,
          var(--grid-color) 75%,
          transparent 76%,
          transparent
        ),
        linear-gradient(
          90deg,
          transparent 23%,
          var(--grid-color) 24%,
          var(--grid-color) 25%,
          transparent 26%,
          transparent 73%,
          var(--grid-color) 74%,
          var(--grid-color) 75%,
          transparent 76%,
          transparent
        );
    `}

  ${({ type }) =>
    type === "warning" &&
    css`
      color: #92400e; /* Darker amber text */
      background-color: #fef3c7; /* Lighter amber background */
      --grid-color: rgba(245, 158, 11, 0.15); /* Softer grid */

      svg {
        color: #d97706;
      } /* Standard amber icon */
      .notification-progress-bar {
        background-color: #d97706;
      }
      &:hover {
        background-color: #fde68a;
      }
      background-image: linear-gradient(
          0deg,
          transparent 23%,
          var(--grid-color) 24%,
          var(--grid-color) 25%,
          transparent 26%,
          transparent 73%,
          var(--grid-color) 74%,
          var(--grid-color) 75%,
          transparent 76%,
          transparent
        ),
        linear-gradient(
          90deg,
          transparent 23%,
          var(--grid-color) 24%,
          var(--grid-color) 25%,
          transparent 26%,
          transparent 73%,
          var(--grid-color) 74%,
          var(--grid-color) 75%,
          transparent 76%,
          transparent
        );
    `}

  ${({ type }) =>
    type === "error" &&
    css`
      color: #991b1b; /* Darker red text */
      background-color: #fee2e2; /* Lighter red background */
      --grid-color: rgba(239, 68, 68, 0.15); /* Softer grid */

      svg {
        color: #dc2626;
      } /* Standard red icon */
      .notification-progress-bar {
        background-color: #dc2626;
      }
      &:hover {
        background-color: #fecaca;
      }
      background-image: linear-gradient(
          0deg,
          transparent 23%,
          var(--grid-color) 24%,
          var(--grid-color) 25%,
          transparent 26%,
          transparent 73%,
          var(--grid-color) 74%,
          var(--grid-color) 75%,
          transparent 76%,
          transparent
        ),
        linear-gradient(
          90deg,
          transparent 23%,
          var(--grid-color) 24%,
          var(--grid-color) 25%,
          transparent 26%,
          transparent 73%,
          var(--grid-color) 74%,
          var(--grid-color) 75%,
          transparent 76%,
          transparent
        );
    `}

   /* Default type styles (when type prop doesn't match specific ones) */
   ${({ type }) =>
    !["success", "info", "warning", "error"].includes(type) &&
    css`
      color: #374151; /* Dark gray text */
      background-color: #f3f4f6; /* Light gray background */
      --grid-color: rgba(209, 213, 219, 0.5); /* Subtle gray grid */

      svg {
        color: #6b7280;
      } /* Medium gray icon */
      .notification-progress-bar {
        background-color: #6b7280;
      }
      &:hover {
        background-color: #e5e7eb;
      }
      /* Keep default grid pattern definition but uses the updated --grid-color */
      background-image: linear-gradient(
          0deg,
          transparent 23%,
          var(--grid-color) 24%,
          var(--grid-color) 25%,
          transparent 26%,
          transparent 73%,
          var(--grid-color) 74%,
          var(--grid-color) 75%,
          transparent 76%,
          transparent
        ),
        linear-gradient(
          90deg,
          transparent 23%,
          var(--grid-color) 24%,
          var(--grid-color) 25%,
          transparent 26%,
          transparent 73%,
          var(--grid-color) 74%,
          var(--grid-color) 75%,
          transparent 76%,
          transparent
        );
    `}
`;

// --- The Notification Functional Component ---
const Notification = ({ type = "default", message, duration = 2000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Effect to handle the timer for auto-dismissal
  useEffect(() => {
    if (duration === Infinity || duration <= 0) return; // Don't set timer if duration is infinite or invalid

    const timerId = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    // Cleanup function to clear the timer if the component unmounts early
    return () => {
      clearTimeout(timerId);
    };
  }, [duration]); // Dependency array: effect runs if duration changes

  // Basic validation: Render nothing if message is missing
  if (!message) {
    console.warn("Notification component requires a 'message' prop.");
    return null;
  }

  // Render nothing if the visibility state is false
  if (!isVisible) {
    return null;
  }

  // Render the styled notification item
  return (
    <StyledNotificationItem type={type} duration={duration}>
      {/* Icon Section */}
      <div className="notification-icon">{getIcon(type)}</div>

      {/* Text Section */}
      <div className="notification-text">{message}</div>

      {/* Progress Bar (visual only, logic is in useEffect) */}
      {duration !== Infinity &&
        duration > 0 && ( // Only render bar if finite duration
          <div className="notification-progress-bar" />
        )}
    </StyledNotificationItem>
  );
};

export default Notification;
