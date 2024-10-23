"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, X } from "lucide-react";
import { useState } from "react";

export default function Component() {
  const [imageUrl, setImageUrl] = useState("");
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadImage = () => {
    if (!imageUrl) {
      setError("Please enter an image URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    const img = new Image();
    img.onload = () => {
      setLoadedImage(imageUrl);
      generateDescriptionAndHashtags();
    };
    img.onerror = () => {
      setIsLoading(false);
      setError("Failed to load image. Please check the URL and try again.");
    };
    img.src = imageUrl;
  };

  const generateDescriptionAndHashtags = async () => {
    try {
      const response = await fetch("/api/generateDescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(
          data.error ||
            "An error occurred while generating the description and hashtags."
        );
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setDescription(data.description);
      setHashtags(data.hashtags);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching description and hashtags:", error);
      setError(
        "An error occurred while generating the description and hashtags."
      );
      setIsLoading(false);
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Image Description and Hashtag Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="url"
            placeholder="Paste image URL here"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            aria-label="Image URL"
          />
          <Button onClick={handleLoadImage} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load"}
          </Button>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {loadedImage && (
          <div className="mt-4">
            <img
              src={loadedImage}
              alt="Loaded"
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
                    aria-label={`Remove ${tag} hashtag`}
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
