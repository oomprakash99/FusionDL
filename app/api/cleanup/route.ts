import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { cleanupOldDownloads } from '@/lib/cleanup';

// POST - 手动触发清理任务（仅管理员）
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    // 只有管理员可以手动触发清理
    if (!session.isAdmin) {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      );
    }

    // 从请求中获取保留时间（可选，默认2小时）
    const body = await request.json().catch(() => ({}));
    const retentionHours = body.retentionHours || 2;

    // 执行清理
    const result = await cleanupOldDownloads(retentionHours);

    return NextResponse.json({
      success: true,
      message: '清理任务执行完成',
      cleanedCount: result.cleanedCount,
      errorCount: result.errorCount,
    });
  } catch (error: any) {
    console.error('Error running cleanup:', error);
    return NextResponse.json(
      { success: false, error: error.message || '执行清理任务失败' },
      { status: 500 }
    );
  }
}

// GET - 获取清理任务信息（仅管理员）
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    if (!session.isAdmin) {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      );
    }

    // 返回清理任务配置信息
    const intervalMinutes = parseInt(process.env.CLEANUP_INTERVAL_MINUTES || '30', 10);
    const retentionHours = parseInt(process.env.CLEANUP_RETENTION_HOURS || '2', 10);

    return NextResponse.json({
      success: true,
      config: {
        intervalMinutes,
        retentionHours,
        description: `每 ${intervalMinutes} 分钟检查一次，自动删除完成时间超过 ${retentionHours} 小时的下载文件`,
      },
    });
  } catch (error: any) {
    console.error('Error getting cleanup info:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取清理任务信息失败' },
      { status: 500 }
    );
  }
}
