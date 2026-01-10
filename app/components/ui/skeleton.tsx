/*
Using Skeleton

<Skeleton className="w-[12.125rem] h-[1.25rem]" />
*/

import React from "react";
import { cn } from "~/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("animate-pulse rounded bg-gray-200", className)} {...props} />;
}

