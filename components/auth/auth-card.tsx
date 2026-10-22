import Image from "next/image";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

// Card dua kolom untuk halaman autentikasi: panel ilustrasi di kiri, form di kanan.
export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="relative isolate flex flex-1 items-center justify-center px-4 py-10">
      <Image
        src="/login-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={100}
        className="-z-10 object-cover object-[70%_center]"
      />
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white/40 shadow-2xl shadow-black/20 backdrop-blur-md md:grid-cols-2">
        <div className="relative hidden min-h-[560px] overflow-hidden bg-gradient-to-br from-[#00A9E8]/85 via-[#1c6fd1]/85 to-[#3b2fb8]/85 md:block">
          <svg
            aria-hidden
            className="absolute inset-0 size-full"
            viewBox="0 0 400 560"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="auth-blob-a" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="auth-blob-b" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <path
              d="M0 120 C 90 60, 160 190, 260 140 S 380 40, 400 70 L 400 0 L 0 0 Z"
              fill="url(#auth-blob-a)"
            />
            <path
              d="M0 330 C 80 260, 170 380, 270 320 S 380 250, 400 280 L 400 560 L 0 560 Z"
              fill="url(#auth-blob-b)"
            />
            <path
              d="M0 450 C 110 390, 210 500, 400 420 L 400 560 L 0 560 Z"
              fill="#ffffff"
              fillOpacity="0.85"
            />
          </svg>

          <div className="absolute top-[14%] left-[38%] size-20 rounded-full bg-gradient-to-br from-cyan-300/80 to-sky-500/60 shadow-lg shadow-sky-900/20" />
          <div className="absolute top-[54%] left-12 size-24 rounded-full bg-gradient-to-br from-indigo-500/80 to-blue-700/70 shadow-lg shadow-indigo-900/30" />
          <div className="absolute top-[32%] right-10 size-10 rounded-full bg-gradient-to-br from-sky-300/80 to-indigo-400/70" />

          <div className="relative flex h-full flex-col px-10 pt-10 pb-8">
            <div className="mt-44 text-white">
              <h2 className="text-3xl font-semibold tracking-tight">
                Welcome!
              </h2>
              <p className="mt-2 max-w-[260px] text-sm text-white/80">
                Track the alumni journey from graduation to higher education and
                the workforce.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center px-8 py-10 sm:px-12">
          <Image
            src="/logo-univ-binus.png"
            alt="BINUS University School of Information Systems"
            width={507}
            height={347}
            priority
            className="mb-6 h-20 w-auto self-center object-contain"
          />
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-900">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

// Gaya input bergaris bawah, mengikuti desain card login.
export const authInputClassName =
  "h-10 rounded-none border-0 border-b border-slate-300 bg-transparent px-0 shadow-none focus-visible:border-[#00A9E8] focus-visible:ring-0";

export const authButtonClassName =
  "h-11 w-full cursor-pointer bg-gradient-to-r from-[#00A9E8] to-[#3b2fb8] font-semibold tracking-widest hover:opacity-90";
