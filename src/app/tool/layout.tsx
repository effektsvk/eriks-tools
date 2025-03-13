import ClientBreadcrumb from './ClientBreadcrumb';

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
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
