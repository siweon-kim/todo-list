import type { PressableProps } from "react-native";
import { Pressable, Text } from "react-native";

import { cn } from "~/utils/cn";

const VARIANTS = {
  default: {
    container: "bg-primary shadow-xs active:bg-primary/90",
    text: "text-primary-foreground",
  },
  outline: {
    container:
      "bg-background border-border dark:bg-input/30 dark:border-input border shadow-xs active:bg-accent",
    text: "text-foreground",
  },
} as const;

interface ButtonProps extends Omit<PressableProps, "children"> {
  children: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
}

export function Button({
  children,
  variant = "default",
  disabled,
  className,
  ...props
}: ButtonProps) {
  const styles = VARIANTS[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn(
        "h-9 shrink-0 flex-row items-center justify-center rounded-md px-4",
        styles.container,
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <Text className={cn("text-sm font-medium", styles.text)}>{children}</Text>
    </Pressable>
  );
}
