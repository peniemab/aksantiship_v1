import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppButtonVariant = "primary" | "secondary";

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border px-8 py-3.5 text-sm font-bold shadow-sm transition";

const variantClass: Record<AppButtonVariant, string> = {
  primary:
    "border-transparent bg-aksanti-red text-white hover:bg-aksanti-red-dark",
  secondary:
    "border-border bg-white text-foreground/80 hover:border-aksanti-red/25 hover:text-aksanti-red",
};

type AppButtonProps = {
  variant?: AppButtonVariant;
  className?: string;
  children: ReactNode;
};

type AppButtonLinkProps = AppButtonProps & {
  href: string;
};

type AppButtonNativeProps = AppButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

function mergeClass(variant: AppButtonVariant, className?: string) {
  return [baseClass, variantClass[variant], className].filter(Boolean).join(" ");
}

export function AppButton({
  variant = "primary",
  className,
  children,
  href,
  ...props
}: AppButtonLinkProps | AppButtonNativeProps) {
  const classes = mergeClass(variant, className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
