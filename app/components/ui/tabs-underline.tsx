/**
 * Tabs Component
 *
 * A wrapper around Radix UI Tabs primitives with shadcn-style classes.
 *
 * ## Example Usage:
 * ```tsx
 * <Tabs defaultValue="detail">
 *   <TabsList>
 *     <TabsTrigger value="desc">Deskripsi</TabsTrigger>
 *     <TabsTrigger value="detail">Detail</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="detail">Content here</TabsContent>
 * </Tabs>
 * ```
 */

import { Root, List, Trigger, Content } from "@radix-ui/react-tabs"

import { cn } from "~/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof Root>) {
  return (
    <Root
      data-slot="tabs"
      className={cn("flex flex-col border-b border-subtle", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof List>) {
  return (
    <List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-12 w-fit items-start justify-center",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Trigger>) {
  return (
    <Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Hover state
        "hover:rounded-md hover:bg-black/5 hover:border-none hover:mb-2 hover:h-fit",
        // Base styles
        "h-12 text-muted-foreground inline-flex flex-1 items-start justify-center px-md py-sm whitespace-nowrap cursor-pointer !text-paragraph [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Active state (Radix data-state=active)
        "data-[state=active]:text-foreground data-[state=active]:border-b-[0.094rem] data-[state=active]:border-foreground",
        // Focus state
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-1",
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}

      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof Content>) {
  return (
    <Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
