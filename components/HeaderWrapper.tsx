import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Header, HeaderProps } from "./header";

export default async function HeaderWrapper(
  props: Omit<HeaderProps, "initialIsAuth">
) {
  // SSR: Get initial auth state from cookies
  const cookieStore = await cookies(); // cookies() now returns a Promise
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data } = await supabase.auth.getUser();
  const isAuth = !!data.user;

  return <Header initialIsAuth={isAuth} {...props} />;
}
