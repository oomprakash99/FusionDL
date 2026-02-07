// Next.js instrumentation file - 在服务器启动时执行
// 用于初始化定时任务等服务器端功能

export async function register() {
  // 只在生产环境或明确启用时运行
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startCleanupTask } = await import('./lib/cleanup');
    
    // 从环境变量读取配置，默认值：每30分钟检查一次，保留2小时
    const intervalMinutes = parseInt(process.env.CLEANUP_INTERVAL_MINUTES || '30', 10);
    const retentionHours = parseInt(process.env.CLEANUP_RETENTION_HOURS || '2', 10);
    
    // 启动定时清理任务
    startCleanupTask(intervalMinutes, retentionHours);
    
    console.log(`[系统初始化] 定时清理任务已启动`);
  }
}
