import type { ViewProps } from "react-native";
import { Text, View } from "react-native";

import { cn } from "~/utils/cn";

export function FieldGroup({ className, ...props }: ViewProps) {
  return (
    <View className={cn("flex w-full flex-col gap-7", className)} {...props} />
  );
}

export function Field({ className, ...props }: ViewProps) {
  return (
    <View className={cn("flex w-full flex-col gap-3", className)} {...props} />
  );
}

export function FieldLabel({
  invalid,
  children,
}: {
  invalid?: boolean;
  children: string;
}) {
  return (
    <Text
      className={cn(
        "text-sm leading-snug font-medium",
        invalid ? "text-destructive" : "text-foreground",
      )}
    >
      {children}
    </Text>
  );
}

export function FieldError({
  errors: maybeErrors,
}: {
  errors?: ({ message?: string } | undefined)[];
}) {
  const messages = (maybeErrors ?? [])
    .map((error) => error?.message)
    .filter((message): message is string => !!message);

  if (messages.length === 0) return null;

  return (
    <View accessibilityRole="alert" className="flex flex-col gap-1">
      {messages.map((message, index) => (
        <Text key={index} className="text-destructive text-sm font-normal">
          {messages.length > 1 ? `• ${message}` : message}
        </Text>
      ))}
    </View>
  );
}
