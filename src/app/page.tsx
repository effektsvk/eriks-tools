import Footer from "@/components/custom/Footer";
import ToolCard from "@/components/custom/ToolCard";
import { TOOLS } from "@/tools";

export default function Home() {
  return (
    <div className="grid grid-rows-[100px_1fr_40px] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)] dark:bg-black bg-white">
      <div>
        <h1 className="dark:text-white text-4xl font-bold">Erik's Tools</h1>
      </div>
      <div className="grid grid-cols-4 gap-4 p-4 dark:bg-neutral-900 bg-neutral-100 w-full h-full">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
      <Footer />
    </div>
  );
}
