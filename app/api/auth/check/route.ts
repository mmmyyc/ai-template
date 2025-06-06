import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();

  if (!user) {
    return NextResponse.json({ data: { success: false } });
  }

  return NextResponse.json({ data: { success: true, user : userData } });
} 