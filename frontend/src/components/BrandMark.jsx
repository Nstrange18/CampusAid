import React from 'react';

export const BrandMark = ({ className = 'h-10 w-10', iconClassName = 'h-7 w-7' }) => (
  <span
    className={`${className} inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm ring-1 ring-blue-700/20 dark:bg-blue-500 dark:ring-blue-300/20`}
    aria-label="CampusAid disability support"
    role="img"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClassName}
      aria-hidden="true"
    >
      <path d="m7.2 5.1 3.9-2 3.9 2-3.9 2-3.9-2Z" />
      <path d="M14.9 5.2v2.1" />
      <circle cx="11.1" cy="9.3" r="1.45" />
      <path d="M11.1 11.1v4.1h4l2.15 4.15h2.15" />
      <path d="M11.1 13h3" />
      <path d="M12.4 19.3a5 5 0 1 1-4.9-7" />
    </svg>
  </span>
);
