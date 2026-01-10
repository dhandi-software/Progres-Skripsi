{
    /* Using Component pagination
    
    Input Class Name
     <Pagination>
      <PaginationContent>
    
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>

     
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        
        <PaginationItem>
          <PaginationLink href="#">
            2
          </PaginationLink>
        </PaginationItem>
        
        <PaginationItem>
          <PaginationLink href="#">
            3
          </PaginationLink>
        </PaginationItem>

        Ellipsis for more pages 
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>

        Next Button 
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
    */
}

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "~/lib/utils";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
    <nav
        role="navigation"
        aria-label="pagination"
        data-slot="pagination"
        className={cn("mx-auto flex w-full justify-center", className)}
        {...props}
    />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
    HTMLUListElement,
    React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        data-slot="pagination-content"
        className={cn("flex flex-row items-center gap-2", className)}
        {...props}
    />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
    HTMLLIElement,
    React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
    <li
        ref={ref}
        data-slot="pagination-item"
        className={cn("", className)}
        {...props}
    />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
    isActive?: boolean;
} & React.ComponentProps<"a">;

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
    ({ className, isActive, ...props }, ref) => (
        <a
            ref={ref}
            aria-current={isActive ? "page" : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-md text-desc-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                isActive
                    ? "bg-brand-primary-muted-foreground text-background"
                    : "text-foreground hover:bg-brand-primary-muted-foreground hover:text-background",
                className,
            )}
            {...props}
        />
    ),
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = React.forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<typeof PaginationLink>
>(({ className, ...props }, ref) => (
    <PaginationLink
        ref={ref}
        aria-label="Go to previous page"
        data-slot="pagination-previous"
        className={cn("gap-2 pl-2.5", className)}
        {...props}
    >
        <ChevronLeft className="h-4 w-4" />
    </PaginationLink>
));
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = React.forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<typeof PaginationLink>
>(({ className, ...props }, ref) => (
    <PaginationLink
        ref={ref}
        aria-label="Go to next page"
        data-slot="pagination-next"
        className={cn("gap-2 pr-2.5", className)}
        {...props}
    >
        <ChevronRight className="h-4 w-4" />
    </PaginationLink>
));
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = React.forwardRef<
    HTMLSpanElement,
    React.ComponentProps<"span">
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        aria-hidden
        data-slot="pagination-ellipsis"
        className={cn(
            "flex h-9 w-9 items-center justify-center text-desc-sm text-background bg-brand-primary-muted-foreground rounded-md",
            className,
        )}
        {...props}
    >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More pages</span>
    </span>
));
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
};
