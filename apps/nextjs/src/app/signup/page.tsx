import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import SignUpForm from "../_components/auth/SignUpForm";

export default async function SignUpPage() {
  const session = await getSession();
  if (session) redirect("/todo");

  return (
    <main className="container flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">会員登録</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            メールアドレスがログインIDになります。
          </p>
        </header>

        <SignUpForm />
      </div>
    </main>
  );
}
