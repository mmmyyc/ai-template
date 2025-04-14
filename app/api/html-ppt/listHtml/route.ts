import { NextResponse} from "next/server";
import { createClient } from "@/libs/supabase/server";
import { NextRequest } from "next/server";
// 处理生成的POST请求
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 }); 
    }
    const folderId = searchParams.get('folderId');
    const { data: html} = await supabase
    .from("html_contents")
    .select("id, title, content")
    .eq('folder_id', folderId);
    return NextResponse.json({ data: { html } });
  }catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}