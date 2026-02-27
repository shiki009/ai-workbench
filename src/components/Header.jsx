export function Header({ onSettingsClick }) {
  return (
    <header className="flex items-center justify-between px-6 py-5 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-foreground flex items-center justify-center">
          <svg className="w-4 h-4 text-card" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-sm font-bold uppercase tracking-widest text-foreground">VFC</span>
      </div>
      <button
        onClick={onSettingsClick}
        className="px-4 py-2 text-sm font-bold uppercase tracking-widest text-foreground border-2 border-foreground hover:bg-foreground hover:text-card transition-colors"
        title="Settings"
      >
        Settings
      </button>
    </header>
  );
}
