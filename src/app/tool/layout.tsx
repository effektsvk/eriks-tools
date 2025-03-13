import ClientBreadcrumb from './ClientBreadcrumb';

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-stretch justify-center">
      <header className="m-4">
        <ClientBreadcrumb />
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
