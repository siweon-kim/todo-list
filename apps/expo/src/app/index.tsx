import { Text, View } from "react-native";
import { Redirect } from "expo-router";

import SignInForm from "~/components/auth/SignInForm";
import AuthScreenLayout from "~/components/AuthScreenLayout";
import { authClient } from "~/utils/auth";

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;
  if (session) return <Redirect href="/todo" />;

  return (
    <AuthScreenLayout>
      <View className="mb-8">
        <Text className="text-foreground text-center text-4xl font-extrabold tracking-tight">
          My <Text className="text-primary">Todo</Text>
        </Text>
        <Text className="text-muted-foreground mt-2 text-center text-sm">
          ログインしてやることを管理しましょう。
        </Text>
      </View>

      <SignInForm />
    </AuthScreenLayout>
  );
}
