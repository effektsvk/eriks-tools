import Footer from "@/components/custom/Footer";
import ClientBreadcrumb from "./ClientBreadcrumb";

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-screen h-screen">
      <div className="flex flex-col p-4 gap-4 items-start dark:bg-black dark:text-white">
        <ClientBreadcrumb />
      </div>
      <div className="flex-1 dark:bg-neutral-900 bg-neutral-100">
        {children}
      </div>
      <Footer />
    </div>
  );
}
