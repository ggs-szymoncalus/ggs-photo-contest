"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface CategoriesTableErrorHandlerProps {
  error: string;
  emptyData: React.ReactNode;
}

export function CategoriesTableErrorHandler({
  error,
  emptyData,
}: CategoriesTableErrorHandlerProps) {
  useEffect(() => {
    toast.error(`Failed to load categories: ${error}`);
  }, [error]);

  return <>{emptyData}</>;
}
