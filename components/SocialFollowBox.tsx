export default function SocialFollowBox() {
  const socials = [
    {
      name: "Facebook",
      handle: "@serikhaberleri",
      followers: "12.4K",
      color: "#1877f2",
      href: "https://facebook.com/serikhaberleri",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      handle: "@serikhaberleri",
      followers: "8.7K",
      color: "#e1306c",
      href: "https://instagram.com/serikhaberleri",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      handle: "Serik Haberleri",
      followers: "3.2K",
      color: "#ff0000",
      href: "https://youtube.com/@serikhaberleri",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.582 7.186a2.506 2.506 0 00-1.768-1.768C18.267 5 12 5 12 5s-6.268 0-7.814.418a2.506 2.506 0 00-1.768 1.768C2 8.733 2 12 2 12s0 3.267.418 4.814a2.506 2.506 0 001.768 1.768C5.732 19 12 19 12 19s6.268 0 7.814-.418a2.506 2.506 0 001.768-1.768C22 15.267 22 12 22 12s0-3.267-.418-4.814zM10 15V9l5.2 3-5.2 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-100" style={{ backgroundColor: "#cc0000" }}>
        <span className="text-white text-xs font-black uppercase tracking-widest">Bizi Takip Et</span>
      </div>
      <div className="divide-y divide-gray-100">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors group"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: s.color }}
            >
              {s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-gray-800">{s.name}</div>
              <div className="text-xs text-gray-400">{s.handle}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-black" style={{ color: s.color }}>{s.followers}</div>
              <div className="text-xs text-gray-400">takipçi</div>
            </div>
          </a>
        ))}
      </div>
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Serik&apos;ten anlık gelişmeler için takip edin
        </p>
      </div>
    </div>
  );
}
