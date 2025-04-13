import { ReactNode } from "react";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "@/i18n/navigation";
import config from "@/config";
// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
export default async function LayoutPrivate({
  children,
  params
}: {
  children: ReactNode;
  params: {
    folderName: string;
    locale: string;
  };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Check if user is logged in
  if (!user) {
    redirect({
      href: config.auth.loginUrl, // Redirect to login if not authenticated
      locale: params.locale,
    });
  }

  // 2. If logged in, check folder ownership
  const { data: folderData, error: folderError } = await supabase
    .from("folders")
    .select("id") // Only need to select something to check existence
    .eq("name", params.folderName)
    .eq("profile_id", user.id) // Use user.id safely here
    .single();

  // 3. If folder doesn't exist for this user or there's an error, redirect to dashboard
  if (!folderData || folderError) {
     redirect({
      href: `/dashboard`,
      locale: params.locale
    });
  }

  // 4. If user is logged in and owns the folder, render the children
  return <>{children}</>;
}
