// Ikon brand sederhana; lucide-react v1 tidak lagi menyertakan logo brand.

type IconProps = { className?: string };

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="5" fill="#0A66C2" />
      <rect x="5.5" y="9.5" width="3" height="9" fill="#fff" />
      <circle cx="7" cy="6.5" r="1.75" fill="#fff" />
      <path
        d="M11 9.5h2.9v1.3c.5-.9 1.6-1.5 2.9-1.5 2.4 0 3.2 1.5 3.2 3.9v5.3h-3v-4.7c0-1.1-.3-1.9-1.4-1.9s-1.6.8-1.6 1.9v4.7h-3z"
        fill="#fff"
      />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="ig-gradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="35%" stopColor="#FA7E1E" />
          <stop offset="65%" stopColor="#D62976" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-gradient)" />
      <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="16.3" cy="7.7" r="1" fill="#fff" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="6" fill="#111" />
      <path
        d="M13.2 5h2.3c.2 1.6 1.2 2.8 2.9 3v2.3c-1.1 0-2.1-.3-2.9-.9v4.8a4 4 0 1 1-4-4c.2 0 .5 0 .7.1v2.4a1.7 1.7 0 1 0 1 1.5z"
        fill="#fff"
      />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2" fill="#25D366" />
      <path
        d="M9.1 7.3c.2 0 .4 0 .6.4l.8 1.9c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.2.3-.1.5.5.9 1.2 1.7 2 2.3.6.4 1.1.7 1.5.9.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3.1.2.1.9-.2 1.6-.3.7-1.5 1.3-2 1.3-.6.1-1.2.1-3.6-.9-3-1.2-4.6-4.3-4.8-4.5-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.2-.3.5-.4.7-.4z"
        fill="#fff"
      />
    </svg>
  );
}
