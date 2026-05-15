import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const PageActionsContext = createContext<((node: ReactNode) => void) | undefined>(undefined);

export function usePageActions() {
  const setter = useContext(PageActionsContext);
  if (!setter) throw new Error('usePageActions must be used within PageActionsProvider');
  return setter;
}

export function PageActions({ children }: { children: ReactNode }) {
  const setActions = usePageActions();

  useEffect(() => {
    setActions(children);
    return () => setActions(null);
  }, [setActions, children]);

  return null;
}

export function PageActionsProvider({
  children,
  renderSlot,
}: {
  children?: ReactNode;
  renderSlot: (actions: ReactNode) => ReactNode;
}) {
  const [actions, setActions] = useState<ReactNode>(null);

  return (
    <PageActionsContext.Provider value={setActions}>
      {renderSlot(actions)}
      {children ?? null}
    </PageActionsContext.Provider>
  );
}
