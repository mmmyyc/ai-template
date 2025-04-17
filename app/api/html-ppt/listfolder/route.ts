import { NextResponse} from "next/server";
import { createClient } from "@/libs/supabase/server";

// 处理生成的POST请求
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 }); 
    }
    const { data: folder} = await supabase
    .from("folders")
    .select()
    .eq('profile_id', user.id);
    return NextResponse.json({ data: { folder } });
  }catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}