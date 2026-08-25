import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border-b-[3px] border-transparent text-sm font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:translate-y-[2px] active:border-b-0 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-black/15 hover:bg-primary/90 hover:shadow-custom",
        secondary: "bg-secondary text-secondary-foreground border-black/15 hover:bg-secondary/90 hover:shadow-custom",
        destructive: "bg-destructive text-destructive-foreground border-black/15 hover:bg-destructive/90",
        outline: "border-border border-[2px] border-b-[4px] bg-background hover:bg-muted text-foreground",
        ghost: "border-0 hover:bg-muted text-foreground active:translate-y-0 hover:scale-100",
        link: "border-0 text-primary underline-offset-4 hover:underline active:translate-y-0 hover:scale-100",
        gradient: "bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-[1.03] active:scale-[0.97] active:translate-y-0 border-0 transition-transform",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
