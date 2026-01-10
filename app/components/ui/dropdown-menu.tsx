/**
 * DropdownMenu Component
 *
 * A fully accessible and customizable dropdown menu built with Radix UI + TailwindCSS.
 * Supports sub-menus, icons, keyboard shortcuts, and flexible trigger elements.
 *
 * Components:
 * - DropdownMenu: Root wrapper for the menu.
 * - DropdownMenuTrigger: Element that opens/closes the dropdown menu.
 * - DropdownMenuContent: The popup container that holds menu items.
 * - DropdownMenuItem: A single clickable menu option.
 * - DropdownMenuShortcut: Displays a keyboard shortcut hint aligned to the right.
 * - DropdownMenuSub: Wraps a sub-menu with trigger and content.
 * - DropdownMenuSubTrigger: The trigger element for a nested sub-menu.
 * - DropdownMenuSubContent: The popup container for the sub-menu.
 * - DropdownMenuPortal: Renders sub-menu content in a React portal for proper layering.
 *
 * Props:
 * - DropdownMenuTrigger:
 *    - className: TailwindCSS classes for styling the trigger button.
 * - DropdownMenuContent:
 *    - side / align: Controls menu positioning relative to the trigger.
 *    - className: Custom styles for the dropdown container.
 * - DropdownMenuItem:
 *    - disabled: When true, disables interaction for the item.
 *    - onSelect: Callback when the item is clicked/selected.
 * - DropdownMenuShortcut:
 *    - children: Text or symbols representing keyboard shortcuts.
 * - DropdownMenuSub / DropdownMenuSubTrigger / DropdownMenuSubContent:
 *    - Used to nest hierarchical sub-menus inside a dropdown.
 *
 * Example usage:
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger className="w-2xs">
 *     Dropdown Label
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>
 *       <CheckCircle />
 *       Dropdown Menu
 *       <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
 *     </DropdownMenuItem>
 *     <DropdownMenuSub>
 *       <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
 *       <DropdownMenuPortal>
 *         <DropdownMenuSubContent>
 *           <DropdownMenuItem>Sub-menu 1</DropdownMenuItem>
 *           <DropdownMenuItem>Sub-menu 2</DropdownMenuItem>
 *         </DropdownMenuSubContent>
 *       </DropdownMenuPortal>
 *     </DropdownMenuSub>
 *     <DropdownMenuItem>Dropdown Menu</DropdownMenuItem>
 *     <DropdownMenuItem>Dropdown Menu</DropdownMenuItem>
 *     <DropdownMenuItem>Dropdown Menu</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */


import {
  Root,
  Portal,
  Trigger,
  Content,
  Group,
  Item,
  CheckboxItem,
  ItemIndicator,
  RadioGroup,
  RadioItem,
  Separator,
  Sub,
  SubTrigger,
  SubContent
} from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
import { Label } from "~/components/ui/label"
import { cn } from "~/lib/utils"

type DropdownMenuProps = React.ComponentProps<typeof Root> & {
  label?: string
  inputId?: string
  size?: "sm" | "lg"
  disabled?: boolean
  variant?: "horizontal" | "vertical"
  className?: string
}

function DropdownMenu({
  label,
  inputId,
  size = "sm",
  disabled = false,
  variant = "vertical",
  className,
  children,
  ...props
}: DropdownMenuProps) {
  return (
    <div
      className={cn(
        "flex",
        variant === "horizontal" ? "items-start gap-2" : "flex-col gap-1",
        className
      )}
    >
      {label && (
        <Label
          htmlFor={inputId}
          size={size}
          disabled={disabled}
          className={cn(
            "shrink-0", // label jangan melar
            variant === "horizontal" && size === "sm" && "pt-2.5",
            variant === "horizontal" && size === "lg" && "pt-3.5"
          )}
        >
          {label}
        </Label>
      )}

      <Root data-slot="dropdown-menu" {...props}>
        {children}
      </Root>
    </div>
  )
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof Portal>) {
  return (
    <Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Trigger>) {
  return (
    <Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
      className={cn(
         // base
        "text-label bg-background border p-xs text-left",
        // state open / closed
        "data-[state=closed]:rounded-md data-[state=open]:rounded-t-md",
        // hover state
        "hover:bg-bw-black-5",
        // disabled state
        "disabled:text-brand-secondary-muted-foreground disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </Trigger>
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 0,
  ...props
}: React.ComponentProps<typeof Content>) {
  return (
    <Portal>
      <Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "w-[var(--radix-dropdown-menu-trigger-width)] bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-b-md border p-xs shadow-md",
          className
        )}
        {...props}
      />
    </Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "text-paragraph-sm focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-sm rounded-sm px-sm py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-lg",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof CheckboxItem>) {
  return (
    <CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-xs rounded-sm py-1.5 pr-xs pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-lg",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ItemIndicator>
          <CheckIcon className="size-lg" />
        </ItemIndicator>
      </span>
      {children}
    </CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioItem>) {
  return (
    <RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-xs rounded-sm py-1.5 pr-xs pl-xl text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-lg",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-sm flex size-3.5 items-center justify-center">
        <ItemIndicator>
          <CircleIcon className="size-sm fill-current" />
        </ItemIndicator>
      </span>
      {children}
    </RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof Label> & {
  inset?: boolean
}) {
  return (
    <Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-sm py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof Sub>) {
  return <Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof SubTrigger> & {
  inset?: boolean
}) {
  return (
    <SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-xs py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-lg" />
    </SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof SubContent>) {
  return (
    <SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-xs shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
