import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import config from "@/config";

export async function GET() {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect(config.auth.loginUrl);
      }

      const { data: userData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (userData.plan === "basic") {
        return NextResponse.json({ data: { plan: 'basic' } });
      }else if(userData.plan === "advanced"){
        return NextResponse.json({ data: { plan: 'advanced' } });
      }else{
        return NextResponse.json({ data: { plan: 'free' } });
      }
    } catch (error) {
      console.error('Failed to fetch user plan:', error);
    }
  }