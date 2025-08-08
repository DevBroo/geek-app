import os from 'os';
import process from 'process';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      startTime: Date.now(),
      responseTimeHistory: [],
      memoryUsage: [],
      cpuUsage: []
    };
    
    this.startMonitoring();
  }

  startMonitoring() {
    // Monitor memory and CPU every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Clean old metrics every 5 minutes
    setInterval(() => {
      this.cleanOldMetrics();
    }, 300000);
  }

  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.memoryUsage.push({
      timestamp: Date.now(),
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external
    });

    this.metrics.cpuUsage.push({
      timestamp: Date.now(),
      user: cpuUsage.user,
      system: cpuUsage.system
    });
  }

  recordRequest(responseTime, isError = false) {
    this.metrics.requests++;
    if (isError) this.metrics.errors++;
    
    this.metrics.responseTimeHistory.push({
      timestamp: Date.now(),
      responseTime,
      isError
    });
  }

  cleanOldMetrics() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    this.metrics.responseTimeHistory = this.metrics.responseTimeHistory
      .filter(entry => entry.timestamp > oneHourAgo);
    
    this.metrics.memoryUsage = this.metrics.memoryUsage
      .filter(entry => entry.timestamp > oneHourAgo);
    
    this.metrics.cpuUsage = this.metrics.cpuUsage
      .filter(entry => entry.timestamp > oneHourAgo);
  }

  getSystemHealth() {
    const uptime = Date.now() - this.metrics.startTime;
    const recentRequests = this.metrics.responseTimeHistory
      .filter(entry => entry.timestamp > Date.now() - 300000); // Last 5 minutes
    
    const avgResponseTime = recentRequests.length > 0
      ? recentRequests.reduce((sum, entry) => sum + entry.responseTime, 0) / recentRequests.length
      : 0;

    const errorRate = recentRequests.length > 0
      ? (recentRequests.filter(entry => entry.isError).length / recentRequests.length) * 100
      : 0;

    const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    const memoryUsageMB = latestMemory 
      ? Math.round(latestMemory.heapUsed / 1024 / 1024) 
      : 0;

    return {
      status: this.getHealthStatus(avgResponseTime, errorRate, memoryUsageMB),
      uptime: Math.round(uptime / 1000), // seconds
      totalRequests: this.metrics.requests,
      totalErrors: this.metrics.errors,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      memoryUsageMB,
      requestsLast5Min: recentRequests.length,
      systemInfo: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        totalMemory: Math.round(os.totalmem() / 1024 / 1024),
        freeMemory: Math.round(os.freemem() / 1024 / 1024),
        cpuCount: os.cpus().length
      }
    };
  }

  getHealthStatus(avgResponseTime, errorRate, memoryUsage) {
    if (errorRate > 10 || avgResponseTime > 5000 || memoryUsage > 1000) {
      return 'critical';
    } else if (errorRate > 5 || avgResponseTime > 2000 || memoryUsage > 500) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  // Middleware to automatically track requests
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        const isError = res.statusCode >= 400;
        this.recordRequest(responseTime, isError);
      });
      
      next();
    };
  }

  // Get performance recommendations
  getOptimizationSuggestions() {
    const health = this.getSystemHealth();
    const suggestions = [];

    if (health.avgResponseTime > 2000) {
      suggestions.push('Consider adding database indexing or query optimization');
    }

    if (health.errorRate > 5) {
      suggestions.push('High error rate detected - check logs for recurring issues');
    }

    if (health.memoryUsageMB > 500) {
      suggestions.push('Memory usage is high - consider implementing caching strategies');
    }

    if (health.requestsLast5Min > 1000) {
      suggestions.push('High request volume - consider implementing rate limiting');
    }

    return suggestions;
  }
}

export const performanceMonitor = new PerformanceMonitor();