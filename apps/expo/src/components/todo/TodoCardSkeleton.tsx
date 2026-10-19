import { useEffect, useState } from "react";
import { Animated, Easing, View } from "react-native";

interface TodoCardSkeletonProps {
  pulse?: boolean;
}

export default function TodoCardSkeleton({
  pulse = true,
}: TodoCardSkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(1));

  // tailwindの`animate-pulse`と同じ動き
  useEffect(() => {
    if (!pulse) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [pulse, opacity]);

  return (
    // classNameとstyleを同じ要素に指定するとclassNameが無視されるため分ける
    <Animated.View style={{ opacity }}>
      <View className="bg-muted flex-row items-center gap-4 rounded-lg p-4">
        <View className="bg-muted-foreground/20 size-5 shrink-0 rounded-full" />
        <View className="grow">
          <View className="bg-muted-foreground/20 h-5 w-2/3 rounded" />
          <View className="bg-muted-foreground/20 mt-2 h-3 w-1/4 rounded" />
        </View>
        <View className="bg-muted-foreground/20 h-5 w-12 shrink-0 rounded-full" />
      </View>
    </Animated.View>
  );
}
