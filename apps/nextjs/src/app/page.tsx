import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import SignInForm from "./_components/auth/SignInForm";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/todo");

  return (
    <main className="container flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            My <span className="text-primary">Todo</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            ログインしてやることを管理しましょう。
          </p>
        </header>

        <SignInForm />
      </div>
    </main>
  );
}
