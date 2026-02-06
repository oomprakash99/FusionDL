import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getDownload } from '@/lib/db';
import { logTraffic } from '@/lib/traffic';
import fs from 'fs';
import path from 'path';

// GET - 下载文件
export async function GET(
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

    // 普通用户只能下载自己的文件，管理员可以下载任何文件
    if (!session.isAdmin && download.user_id !== session.userId) {
      return NextResponse.json(
        { success: false, error: '无权下载此文件' },
        { status: 403 }
      );
    }

    if (download.status !== 'completed' || !download.file_path) {
      return NextResponse.json(
        { success: false, error: '文件尚未准备好' },
        { status: 400 }
      );
    }

    // 检查文件是否存在
    if (!fs.existsSync(download.file_path)) {
      return NextResponse.json(
        { success: false, error: '文件不存在' },
        { status: 404 }
      );
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(download.file_path);
    const fileName = path.basename(download.file_path);

    // 记录流量使用（下载到用户）
    if (download.file_size) {
      logTraffic({
        user_id: session.userId,
        download_id: downloadId,
        type: 'download_to_user',
        bytes: download.file_size,
        description: `下载文件: ${fileName}`,
      });
    }

    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { success: false, error: error.message || '下载文件失败' },
      { status: 500 }
    );
  }
}
