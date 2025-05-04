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
    const title = formData.get('title')
    const content = formData.get('content')
    const htmlId = formData.get('htmlId')
    const { data: html , error: htmlError} = await supabase
    .from("html_contents")
    .update({
      title : title,
      content : content
    })
    .eq("id", htmlId)
    .select()
    .single();
    if (htmlError) {
      return NextResponse.json({ error: 'Failed to update Html'}, { status: 500 });
    }
    return NextResponse.json({ data: { htmlId: html.id } });
  }catch (error) {
    console.error('Error creating Html:', error);
    return NextResponse.json({ error: 'Failed to create Html' }, { status: 500 });
  }
}