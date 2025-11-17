import React from 'react';

/**
 * Skip Navigation Component for WCAG 2.4.1 Compliance
 * Allows keyboard users to skip repetitive navigation and jump to main content
 */
export function SkipNavigation() {
  return (
    <>
      <a
        href="#main-content"
        className="skip-nav"
        onFocus={(e) => {
          // Announce to screen readers
          const announcement = document.createElement('div');
          announcement.setAttribute('role', 'status');
          announcement.setAttribute('aria-live', 'polite');
          announcement.className = 'sr-only';
          announcement.textContent = 'Skip navigation link available';
          document.body.appendChild(announcement);
          setTimeout(() => announcement.remove(), 1000);
        }}
      >
        Skip to main content
      </a>

      {/* Additional skip links for complex pages */}
      <a href="#search" className="skip-nav">
        Skip to search
      </a>

      <a href="#footer" className="skip-nav">
        Skip to footer
      </a>
    </>
  );
}

export default SkipNavigation;