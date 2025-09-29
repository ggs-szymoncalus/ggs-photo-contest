"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Submission } from "@/types/database";
import { cn } from "@/lib/utils";

interface SubmissionsCarouselProps {
  submissions: Submission[];
  className?: string;
}

export default function SubmissionsCarousel({
  submissions,
  className,
}: SubmissionsCarouselProps) {
  const [localSubmissions, setLocalSubmissions] = useState([] as Submission[]);

  useEffect(() => {
    setLocalSubmissions(submissions);
  }, [submissions]);

  if (!localSubmissions || localSubmissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No submissions available</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      <Carousel
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="p-1">
          {localSubmissions.map((submission) => (
            <CarouselItem
              key={submission.id}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={submission.photoUrl}
                      alt={submission.title}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {submission.isWinner && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                        Winner
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {submission.title}
                    </h3>
                    {submission.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {submission.description}
                      </p>
                    )}
                    {submission.location && (
                      <p className="text-xs text-muted-foreground mb-2">
                        📍 {submission.location}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Submitted:{" "}
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      {/* 
      {count > 0 && (
        <div className="py-2 text-center text-sm text-muted-foreground">
          Slide {current} of {count}
        </div>
      )} */}
    </div>
  );
}
