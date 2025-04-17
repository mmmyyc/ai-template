import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/libs/supabase/server";

// 处理生成的POST请求
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 }); 
    }
    // 从请求中获取表单数据
    const formData = await request.formData()
    const folderName = formData.get('folderName')
    const title = formData.get('title')
    const content = formData.get('content')
    // 验证输入：确保提供了 folderName
    if (!folderName) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const { data: folderId} = await supabase
    .from("folders")
    .select("id")
    .eq("name", folderName)
    .single();
    console.log("folderId",folderId?.id)
    if (!folderId) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }
    const { data: html , error: htmlError} = await supabase
    .from("html_contents")
    .insert({
      folder_id: folderId.id,
      title : title,
      content : content
    })
    .select()
    .single();
    if (htmlError) {
      return NextResponse.json({ error: 'Failed to create Html: duplicate name or folder not found'}, { status: 500 });
    }
    return NextResponse.json({ data: { htmlId: html.id } });
  }catch (error) {
    console.error('Error creating Html:', error);
    return NextResponse.json({ error: 'Failed to create Html' }, { status: 500 });
  }
}