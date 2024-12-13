import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const TOOLS = ["Image Converter"];

export default function Home() {
  return (
    <div className="grid grid-rows-[100px_1fr_40px] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <div>
        <p>header test</p>
      </div>
      <ScrollArea className="grid grid-rows-4 grid-cols-4 gap-4 p-4 dark:bg-slate-800 bg-slate-100 w-full h-full">
        {TOOLS.map((tool) => (
          <Card key={tool} className="h-48">
            {tool}
          </Card>
        ))}
      </ScrollArea>
      <div>
        <p>footer test</p>
      </div>
    </div>
  );
}
