"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<string>("png");
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setConvertedUrl(null);
  };
  const handleConvert = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          setConvertedUrl(url);
        }, `image/${format}`);
      };
      if (typeof reader.result === "string") {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };
  const handleDownload = () => {
    if (!convertedUrl || !file) return;
    const link = document.createElement("a");
    const newName = file.name.replace(/\.[^.]+$/, `.${format}`);
    link.href = convertedUrl;
    link.download = newName;
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Converter</CardTitle>
        <CardDescription>Convert images to different formats</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="file">Choose image</Label>
          <Input
            id="file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="format">Output format</Label>
          <select
            id="format"
            className="border rounded-md p-2 dark:bg-black bg-white"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WEBP</option>
          </select>
        </div>
        {file && (
          <div className="flex flex-col gap-2">
            <Label>Preview</Label>
            <div className="h-48 w-full flex items-center justify-center overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        )}
        {convertedUrl && (
          <div className="flex flex-col gap-2">
            <Label>Result</Label>
            <div className="h-48 w-full flex items-center justify-center overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={convertedUrl}
                alt="converted"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={handleConvert} disabled={!file}>
          Convert
        </Button>
        <Button
          variant="secondary"
          onClick={handleDownload}
          disabled={!convertedUrl}
        >
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
