"use client";
import ImageConverter from "@/components/custom/ImageConverter";

export default function ImageConverterPage() {
  return (
    <div className="flex w-full h-full p-4">
      <div className="flex flex-1 flex-col items-center justify-start">
        <div className="w-96 flex flex-col items-stretch justify-center gap-4">
          <ImageConverter />
        </div>
      </div>
    </div>
  );
}
