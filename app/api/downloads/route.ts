import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { createDownload, getAllDownloads, getUserDownloads, updateDownload } from '@/lib/db';
import { executeYtDlp } from '@/lib/ytdlp';
import { getDownloadDir } from '@/lib/config';
import { logTraffic } from '@/lib/traffic';
import { getUserTraffic } from '@/lib/traffic';
import path from 'path';
import fs from 'fs';

// 后台下载处理函数
async function processDownload(downloadId: number, url: string, userId: number, videoInfo?: any) {
  try {
    // 更新状态为下载中
    updateDownload(downloadId, { status: 'downloading', progress: 0 });

    const downloadDir = getDownloadDir();
    
    // 如果提供了视频信息，更新标题、缩略图、时长等
    if (videoInfo) {
      updateDownload(downloadId, {
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        duration: videoInfo.duration,
      });
    } else {
      // 如果没有提供视频信息，先获取信息
      try {
        const stdout = await executeYtDlp(`--dump-json "${url}"`);
        const info = JSON.parse(stdout);
        updateDownload(downloadId, {
          title: info.title,
          thumbnail: info.thumbnail,
          duration: info.duration_string || `${info.duration}s`,
        });
      } catch (error) {
        console.error('Failed to fetch video info:', error);
      }
    }

    // 构建下载命令
    // 使用最佳质量：优先选择最佳视频+最佳音频（需要 FFmpeg 合并）
    // 格式说明：
    // - bv*+ba: 最佳视频流（任意编码）+ 最佳音频流，然后合并
    // - /b: 如果无法合并，回退到最佳单一流
    // - 这确保了下载最高质量的视频（1080p, 2K, 4K 等）
    // 额外选项：
    // - --merge-output-format mp4: 合并后输出为 mp4 格式
    // - --embed-metadata: 嵌入视频元数据
    // - --no-warnings: 减少警告输出
    const outputTemplate = path.join(downloadDir, '%(title)s.%(ext)s');
    const command = `-f "bv*+ba/b" --merge-output-format mp4 --embed-metadata --no-warnings -o "${outputTemplate}" "${url}"`;

    // 记录下载前的文件列表
    const filesBefore = new Set(fs.readdirSync(downloadDir));

    // 执行下载
    await executeYtDlp(command);

    // 查找新下载的文件（比较下载前后的文件列表）
    const filesAfter = fs.readdirSync(downloadDir);
    const newFiles = filesAfter.filter((file: string) => !filesBefore.has(file));

    // 如果找到了新文件，使用最新的（按修改时间排序）
    let downloadedFile: string | undefined;
    if (newFiles.length > 0) {
      const filesWithStats = newFiles.map((file: string) => ({
        name: file,
        path: path.join(downloadDir, file),
        mtime: fs.statSync(path.join(downloadDir, file)).mtime.getTime(),
      }));
      filesWithStats.sort((a: { mtime: number }, b: { mtime: number }) => b.mtime - a.mtime);
      downloadedFile = filesWithStats[0].name;
    } else {
      // 如果没有新文件，可能是文件名冲突，尝试使用最新的文件
      const allFiles = filesAfter.map((file: string) => ({
        name: file,
        path: path.join(downloadDir, file),
        mtime: fs.statSync(path.join(downloadDir, file)).mtime.getTime(),
      }));
      allFiles.sort((a: { mtime: number }, b: { mtime: number }) => b.mtime - a.mtime);
      // 使用最近修改的文件（假设是刚下载的）
      downloadedFile = allFiles[0]?.name;
    }

    if (downloadedFile) {
      const filePath = path.join(downloadDir, downloadedFile);
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // 检查用户流量是否足够
      const traffic = getUserTraffic(userId);
      if (traffic && traffic.traffic_remaining < fileSize) {
        updateDownload(downloadId, {
          status: 'failed',
          error_message: '流量不足，无法完成下载',
        });
        return;
      }

      // 更新下载记录
      updateDownload(downloadId, {
        status: 'completed',
        progress: 100,
        file_path: filePath,
        file_size: fileSize,
      });

      // 记录流量使用
      logTraffic({
        user_id: userId,
        download_id: downloadId,
        type: 'download_from_youtube',
        bytes: fileSize,
        description: `下载视频: ${videoInfo?.title || downloadedFile}`,
      });
    } else {
      updateDownload(downloadId, {
        status: 'failed',
        error_message: '无法找到下载的文件',
      });
    }
  } catch (error: any) {
    console.error('Download error:', error);
    updateDownload(downloadId, {
      status: 'failed',
      error_message: error.message || '下载失败',
    });
  }
}

// GET - 获取下载列表
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    // 管理员可以查看所有下载，普通用户只能查看自己的
    const downloads = session.isAdmin 
      ? getAllDownloads()
      : getUserDownloads(session.userId);

    return NextResponse.json({
      success: true,
      downloads,
    });
  } catch (error: any) {
    console.error('Error fetching downloads:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取下载列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建下载任务
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    const { url, videoInfo } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL 是必需的' },
        { status: 400 }
      );
    }

    // 创建下载记录
    const download = createDownload(url, session.userId);

    // 异步处理下载（不等待完成）
    processDownload(download.id!, url, session.userId, videoInfo).catch(error => {
      console.error('Background download error:', error);
    });

    return NextResponse.json({
      success: true,
      download,
    });
  } catch (error: any) {
    console.error('Error creating download:', error);
    return NextResponse.json(
      { success: false, error: error.message || '创建下载任务失败' },
      { status: 500 }
    );
  }
}
