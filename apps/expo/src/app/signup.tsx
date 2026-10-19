import { Text, View } from "react-native";
import { Redirect } from "expo-router";

import SignUpForm from "~/components/auth/SignUpForm";
import AuthScreenLayout from "~/components/AuthScreenLayout";
import { authClient } from "~/utils/auth";

export default function SignUpPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;
  if (session) return <Redirect href="/todo" />;

  return (
    <AuthScreenLayout>
      <View className="mb-8">
        <Text className="text-foreground text-center text-4xl font-extrabold tracking-tight">
          会員登録
        </Text>
        <Text className="text-muted-foreground mt-2 text-center text-sm">
          メールアドレスがログインIDになります。
        </Text>
      </View>

      <SignUpForm />
    </AuthScreenLayout>
  );
}
