import { NextResponse} from "next/server";
import { createClient } from "@/libs/supabase/server";
import { NextRequest } from "next/server";
// 处理生成的POST请求
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 }); 
    }
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const { data: folder} = await supabase
    .from("folders")
    .select("name")
    .eq('id', id)
    .single();
    return NextResponse.json({ data: { folderName: folder.name } });
  }catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}