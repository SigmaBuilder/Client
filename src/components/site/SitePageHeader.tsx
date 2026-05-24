import { createContext, useCallback, useContext, useEffect, useMemo, useState, type DragEvent, type ReactNode } from 'react';

interface SitePageHeaderState {
  breadcrumbs?: {
    label: string;
    href?: string;
    onClick?: () => void;
    onDragOver?: (event: DragEvent) => void;
    onDragLeave?: (event: DragEvent) => void;
    onDrop?: (event: DragEvent) => void;
    isDropTarget?: boolean;
  }[];
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  actions?: ReactNode;
}

interface SitePageHeaderContextValue {
  setHeader: (state: SitePageHeaderState) => void;
  clearHeader: () => void;
}

const SitePageHeaderContext = createContext<SitePageHeaderContextValue | undefined>(undefined);

export function useSitePageHeader() {
  const ctx = useContext(SitePageHeaderContext);
  if (!ctx) throw new Error('useSitePageHeader must be used within SitePageHeaderProvider');
  return ctx;
}

export function SitePageHeaderProvider({
  children,
  renderSlot,
}: {
  children?: ReactNode;
  renderSlot: (header: ReactNode) => ReactNode;
}) {
  const [headerState, setHeaderState] = useState<SitePageHeaderState | null>(null);

  const setHeader = useCallback((state: SitePageHeaderState) => setHeaderState(state), []);
  const clearHeader = useCallback(() => setHeaderState(null), []);
  const contextValue = useMemo(() => ({ setHeader, clearHeader }), [setHeader, clearHeader]);

  const headerNode = headerState ? (
    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
      <div className="hidden sm:flex flex-1 min-w-0 justify-center">
        {headerState.breadcrumbs && headerState.breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
            {headerState.breadcrumbs.map((crumb, i) => {
              const isLast = i === headerState.breadcrumbs!.length - 1;
              return (
                <div key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-muted-foreground/40">/</span>}
                  {crumb.onClick ? (
                    <button
                      type="button"
                      onClick={crumb.onClick}
                      onDragOver={crumb.onDragOver}
                      onDragLeave={crumb.onDragLeave}
                      onDrop={crumb.onDrop}
                      className={`rounded-md border px-2 py-1 transition-colors ${
                        crumb.isDropTarget
                          ? 'border-primary bg-primary/10 text-primary'
                          : isLast
                            ? 'border-transparent text-foreground font-medium'
                            : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {crumb.label}
                    </button>
                  ) : crumb.href && !isLast ? (
                    <a
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className={isLast ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                      {crumb.label}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        ) : (
          <div className="w-full" />
        )}
      </div>

      {/* Mobile: show last breadcrumb only as context */}
      {headerState.breadcrumbs && headerState.breadcrumbs.length > 0 && (
        <span className="sm:hidden text-sm font-medium text-muted-foreground truncate">
          {headerState.breadcrumbs[headerState.breadcrumbs.length - 1].label}
        </span>
      )}

      {/* Right: searchbar + actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
        {headerState.search && (
          <input
            type="text"
            placeholder={headerState.search.placeholder || 'Buscar...'}
            value={headerState.search.value}
            onChange={(e) => headerState.search!.onChange(e.target.value)}
            className="hidden sm:block w-44 lg:w-52 h-8 px-3 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        )}
        {headerState.actions && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {headerState.actions}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <SitePageHeaderContext.Provider value={contextValue}>
      {renderSlot(headerNode)}
      {children ?? null}
    </SitePageHeaderContext.Provider>
  );
}

/** Hook to declaratively set the site page header from a child component */
export function useSetSitePageHeader(state: SitePageHeaderState | null) {
  const { setHeader, clearHeader } = useSitePageHeader();

  useEffect(() => {
    if (state) {
      setHeader(state);
    } else {
      clearHeader();
    }
    return () => clearHeader();
  }, [state, setHeader, clearHeader]);
}
