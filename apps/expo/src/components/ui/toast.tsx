import { useEffect, useState, useSyncExternalStore } from "react";
import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "~/utils/cn";

type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

const TOAST_DURATION_MS = 4000;
const MAX_TOASTS = 3;

// sonnerの`toast`と同じように、コンポーネント外からも呼び出せるストア
let toasts: ToastItem[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const dismiss = (id: number) => {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
};

const show = (type: ToastType, message: string) => {
  const id = nextId++;
  toasts = [...toasts, { id, type, message }].slice(-MAX_TOASTS);
  emit();
  setTimeout(() => dismiss(id), TOAST_DURATION_MS);
};

export const toast = {
  success: (message: string) => show("success", message),
  error: (message: string) => show("error", message),
};

function ToastView({ item }: { item: ToastItem }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
        ],
      }}
    >
      {/* classNameとstyleを同じ要素に指定するとclassNameが無視されるため分ける */}
      <View className="bg-popover border-border flex-row items-center gap-2 rounded-lg border px-4 py-3 shadow-lg">
        <View
          className={cn(
            "size-5 items-center justify-center rounded-full",
            item.type === "success" ? "bg-primary" : "bg-destructive",
          )}
        >
          <Text className="text-primary-foreground text-xs font-bold">
            {item.type === "success" ? "✓" : "!"}
          </Text>
        </View>
        <Text className="text-popover-foreground shrink text-sm">
          {item.message}
        </Text>
      </View>
    </Animated.View>
  );
}

export function Toaster() {
  const insets = useSafeAreaInsets();
  const items = useSyncExternalStore(subscribe, () => toasts);

  return (
    <View pointerEvents="box-none" className="absolute inset-x-4 bottom-4">
      <View
        pointerEvents="box-none"
        style={{ gap: 8, paddingBottom: insets.bottom }}
      >
        {items.map((item) => (
          <ToastView key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}
