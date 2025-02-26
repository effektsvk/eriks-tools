import { ToolLayout } from './layout';
import { ClientBreadcrumb } from './ClientBreadcrumb';

export default function ToolLayout({
  children,
}) {
  return (
    <div className="flex flex-1 flex-col items-stretch justify-center">
      <header>
        <ClientBreadcrumb />
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}

export { ToolLayout };
