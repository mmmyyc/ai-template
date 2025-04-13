import { ReactNode } from "react";
import { createClient } from "@/libs/supabase/server";
import { redirect } from "@/i18n/navigation";
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
  if (!user) {
    await supabase.from('folders').select('*').eq('name', params.folderName).eq('profile_id', user?.id).single()
    .then(({ data, error }) => {
      if (error) {
        redirect({
          href: `/dashboard`,
          locale: params.locale
        });
      } else {
        return <>{children}</>;
      }
    });
  }
  

  return <>{children}</>;
}
