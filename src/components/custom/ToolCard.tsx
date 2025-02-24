import Link from "next/link";
import { Card } from "../ui/card";
import { Tool } from "@/types";

export default function ToolCard({ tool }: { tool: Tool }) {
  const { title, slug } = tool;
  return (
    <Link href={`/tool/${slug}`} className="h-min">
      <Card className="h-48 flex hover:bg-neutral-200 dark:hover:bg-neutral-700 dark:bg-neutral-800 bg-white transition-colors duration-200 cursor-pointer">
        <div className="flex flex-col flex-1 gap-2 items-center justify-center">
          <h1 className="text-6xl dark:text-white">{tool.icon}</h1>
          <h2 className="text-2xl dark:text-white font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </div>
      </Card>
    </Link>
  );
}
