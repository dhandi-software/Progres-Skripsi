import { Loader2Icon } from "lucide-react";
import { Button, type buttonVariants } from "~/components/ui/button";
import type { VariantProps } from "class-variance-authority";

interface ButtonActionProps
  extends React.ComponentProps<typeof Button>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function ButtonAction({
  loading = false,
  children,
  ...props
}: ButtonActionProps) {
  return (
    <Button disabled={loading || props.disabled} {...props}>
      {loading && <Loader2Icon className="animate-spin" />}
      {children}
    </Button>
  );
}
