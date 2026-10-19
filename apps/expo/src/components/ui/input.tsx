import type { TextInputProps } from "react-native";
import { TextInput } from "react-native";

import { cn } from "~/utils/cn";

interface InputProps extends TextInputProps {
  className?: string;
  invalid?: boolean;
}

export function Input({
  className,
  invalid,
  editable = true,
  ...props
}: InputProps) {
  return (
    <TextInput
      editable={editable}
      aria-invalid={invalid}
      className={cn(
        "border-input text-foreground placeholder:text-muted-foreground dark:bg-input/30 h-9 min-w-0 rounded-md border bg-transparent px-3 text-base shadow-xs",
        invalid && "border-destructive",
        !editable && "opacity-50",
        className,
      )}
      {...props}
    />
  );
}
