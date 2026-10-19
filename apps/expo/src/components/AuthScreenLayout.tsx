import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ログイン・会員登録画面の共通レイアウト（画面中央にmax-w-smのカード）
export default function AuthScreenLayout({
  children,
}: {
  children: ReactNode;
}) {
  const content = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="grow items-center justify-center px-8 py-16"
    >
      <View className="w-full max-w-sm">{children}</View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="bg-background flex-1">
      {/* AndroidではKeyboardAvoidingView内の要素が描画されない（白画面になる）ため、iOSのみ使用する。
          Androidはキーボード表示時にOS側で画面がリサイズされる */}
      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
