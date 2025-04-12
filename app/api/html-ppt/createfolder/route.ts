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

    // 验证输入：确保提供了 folderName
    if (!folderName || typeof folderName !== 'string' || folderName.trim() === '') {
      return NextResponse.json({ error: 'Folder name is required and must be a non-empty string' }, { status: 400 });
    }
    // Perform the insert operation and check for errors
    const { data: folder, error: insertError } = await supabase
      .from("folders")
      .insert({
        name: folderName.trim(), // Trim whitespace from folder name
        profile_id: user.id
      })
      .select()
      .single();

    // Handle potential insert errors
    if (insertError) {
        console.error('Supabase insert error:', insertError);
        // Provide a more specific error message if possible
        let errorMessage = 'Failed to create folder due to a database error.';
        if (insertError.code === '23505') { // Unique constraint violation
            errorMessage = 'A folder with this name already exists.';
        } else if (insertError.message.includes('RLS policy')) {
            errorMessage = 'Failed to create folder due to permission policy.';
        }
        return NextResponse.json({ error: errorMessage, details: insertError.message }, { status: 500 });
    }

    // Check if the folder data was actually returned
    if (!folder) {
        console.error('Folder data was null after insert, though no explicit error was thrown.');
        return NextResponse.json({ error: 'Failed to create folder or retrieve its data after creation.' }, { status: 500 });
    }

    // If successful, return the folder details
    return NextResponse.json({ data: { folderId: folder.id , folderName: folder.name , createdAt: folder.created_at } });
  }catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}