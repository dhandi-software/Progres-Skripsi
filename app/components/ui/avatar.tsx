/**
 * Avatar component built on top of Radix UI's Avatar primitives
 * with Class Variance Authority (CVA) for shape and size variants.
 *
 * Includes:
 * - Avatar: The main container
 * - AvatarImage: The displayed image
 * - AvatarFallback: Fallback content when image fails to load
 *
 * Features:
 * - Supports `shape` (round, square) and `size` (s, m, l) variants
 * - Accepts all props from `@radix-ui/react-avatar`'s Root, Image, and Fallback components
 * - Uses `class-variance-authority` for consistent 
 * 
 *  Example usage:
 *
 * ```tsx
 * <Avatar
 *   src="https://github.com/shadcn.png"
 *   fallback="AB"
 *   size="s"
 *   shape="square"
 * />
 * ```
 */

import { Root, Image, Fallback } from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

/**
 * Variant styles for Avatar
 * - `shape`: round or square
 * - `size`: small, medium, large
 */
const avatarVariants = cva("aspect-square size-full", {
  variants: {
    shape: {
      square: "rounded-md",
      round: "rounded-full",
    },
    size: {
      xs: "w-[1.25rem] h-[1.25rem]", // 20px
      s: "w-[2.25rem] h-[2.25rem]", // 36px
      m: "w-[3rem] h-[3rem]",       // 48px
      l: "w-[3.75rem] h-[3.75rem]", // 60px
    },
  },
  defaultVariants: {
    shape: "round",
    size: "m",
  },
});

/**
 * Props for Avatar component.
 * - Extends Radix's `Root` props
 * - Adds `shape` and `size` variants
 * - `src`: Image source URL
 * - `fallback`: Fallback text or content
 */
export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src: string;
  fallback?: string;
}

/**
 * Avatar - Main container that renders an image with fallback.
 */
export default function Avatar({
  className,
  size,
  shape,
  src,
  fallback,
  ...props
}: React.ComponentProps<typeof Root> & AvatarProps) {
  return (
    <Root
      data-slot="avatar"
      className={cn(
        "relative flex shrink-0 overflow-hidden",
        avatarVariants({ size, shape }),
        className
      )}
      {...props}
    >
      <AvatarImage src={src} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Root>
  );
}

/**
 * AvatarImage - Displays the avatar image.
 * Automatically hides if the image fails to load.
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof Image>) {
  return (
    <Image
      data-slot="avatar-image"
      className={cn(className)}
      {...props}
    />
  );
}

/**
 * AvatarFallback - Content shown when image fails to load.
 * Useful for initials, icons, or placeholder graphics.
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof Fallback>) {
  return (
    <Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center text-sm font-medium",
        className
      )}
      {...props}
    />
  );
}

export { Avatar };
