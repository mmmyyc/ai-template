import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: { success: false } });
  }

  return NextResponse.json({ data: { success: true, user } });
} 