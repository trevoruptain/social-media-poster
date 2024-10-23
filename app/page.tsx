"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

export default function Component() {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError("File size exceeds 4MB limit. Please choose a smaller file.");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        generateDescriptionAndHashtags();
      };
      reader.readAsDataURL(file);
    }
  };

  const generateDescriptionAndHashtags = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setDescription(
        "A beautiful sunset over a calm ocean, with vibrant orange and purple hues reflecting off the water."
      );
      setHashtags([
        "sunset",
        "ocean",
        "nature",
        "beautiful",
        "peaceful",
        "calm",
        "vibrant",
      ]);
      setIsLoading(false);
    }, 2000);
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Image Upload and Description</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Image
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <Alert variant="default" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please note: We don't allow images over 4MB in size.
          </AlertDescription>
        </Alert>
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {image && (
          <div className="mt-4">
            <img
              src={image}
              alt="Uploaded"
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        )}
        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        {description && (
          <div>
            <h3 className="font-semibold mb-2">Description:</h3>
            <p>{description}</p>
          </div>
        )}
        {hashtags.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Hashtags:</h3>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  #{tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-2"
                    onClick={() => removeHashtag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
