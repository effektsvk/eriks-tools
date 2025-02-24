import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ImageConverter() {
  return (
    <div className="flex w-full h-full p-4">
      <div className="flex flex-1 flex-col items-center justify-start">
        <div className="w-96 flex flex-col items-stretch justify-center gap-4">
          <div>
            <Label htmlFor="inputFile" className="dark:text-white">
              Input file
            </Label>
            <Input id="inputFile" type="file" className="dark:text-white" />
          </div>
          <div>
            <Label>Desired output format</Label>
            <RadioGroup defaultValue="png" className="dark:text-white">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="png" id="r1" />
                <Label htmlFor="r1">PNG</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jpg" id="r1" />
                <Label htmlFor="r1">JPG</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="webp" id="r1" />
                <Label htmlFor="r1">WEBP</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
