export function MatrixLogo() {
  return (
    <span className="matrix-logo-mark" aria-hidden="true">
      <svg className="apple-logo-svg" width="36" height="36" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="matrix-logo-blue-cyan" x1="242" y1="224" x2="662" y2="624" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0066cc" />
            <stop offset="52%" stopColor="#0ea5ff" />
            <stop offset="100%" stopColor="#30d5c8" />
          </linearGradient>
          <linearGradient id="matrix-logo-white-gray" x1="424" y1="360" x2="820" y2="760" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="62%" stopColor="#e9eaec" />
            <stop offset="100%" stopColor="#a8adb4" />
          </linearGradient>
        </defs>
        <path className="matrix-box-1" d="M226 392C226 286.514 286.514 226 392 226H516C621.486 226 682 286.514 682 392V516C682 621.486 621.486 682 516 682H392C286.514 682 226 621.486 226 516V392Z" stroke="url(#matrix-logo-blue-cyan)" strokeWidth="72" strokeLinecap="round" strokeLinejoin="round" />
        <path className="matrix-box-2" d="M402 488C402 382.514 462.514 322 568 322H692C797.486 322 858 382.514 858 488V612C858 717.486 797.486 778 692 778H568C462.514 778 402 717.486 402 612V488Z" stroke="url(#matrix-logo-white-gray)" strokeWidth="72" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
