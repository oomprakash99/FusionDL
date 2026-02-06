import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getDownload, deleteDownload } from '@/lib/db';
import fs from 'fs';

// DELETE - 删除下载记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const downloadId = parseInt(id);

    if (isNaN(downloadId)) {
      return NextResponse.json(
        { success: false, error: '无效的下载 ID' },
        { status: 400 }
      );
    }

    const download = getDownload(downloadId);

    if (!download) {
      return NextResponse.json(
        { success: false, error: '下载记录不存在' },
        { status: 404 }
      );
    }

    // 普通用户只能删除自己的下载，管理员可以删除任何下载
    if (!session.isAdmin && download.user_id !== session.userId) {
      return NextResponse.json(
        { success: false, error: '无权删除此下载记录' },
        { status: 403 }
      );
    }

    // 删除源文件（如果存在）
    if (download.file_path) {
      try {
        if (fs.existsSync(download.file_path)) {
          fs.unlinkSync(download.file_path);
          console.log(`已删除文件: ${download.file_path}`);
        } else {
          console.warn(`文件不存在，跳过删除: ${download.file_path}`);
        }
      } catch (fileError: any) {
        // 文件删除失败不影响数据库记录的删除，但记录错误
        console.error(`删除文件失败: ${download.file_path}`, fileError);
        // 可以选择继续删除数据库记录，或者返回错误
        // 这里选择继续，因为文件可能已经被手动删除
      }
    }

    // 删除数据库记录
    deleteDownload(downloadId);

    return NextResponse.json({
      success: true,
      message: '下载记录和文件已删除',
    });
  } catch (error: any) {
    console.error('Error deleting download:', error);
    return NextResponse.json(
      { success: false, error: error.message || '删除下载记录失败' },
      { status: 500 }
    );
  }
}
