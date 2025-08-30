interface ScrapingMetrics {
  operation: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'running' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errors: string[];
  memoryUsage?: NodeJS.MemoryUsage;
  targetUrl?: string;
  universityName?: string;
}

interface SystemMetrics {
  timestamp: Date;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
  activeConnections: number;
  errorRate: number;
  requestCount: number;
}

export class MonitoringService {
  private scrapingLogs: ScrapingMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private errorCounts: Map<string, number> = new Map();
  private readonly maxLogRetention = 1000; // Keep last 1000 operations
  private readonly maxMetricsRetention = 500; // Keep last 500 system snapshots

  constructor() {
    // Start system monitoring
    this.startSystemMonitoring();
  }

  /**
   * Starts tracking a scraping operation
   */
  startScrapingOperation(operationId: string, details: {
    operation: string;
    targetUrl?: string;
    universityName?: string;
  }): string {
    const metrics: ScrapingMetrics = {
      operation: `${operationId}_${details.operation}`,
      startTime: new Date(),
      status: 'running',
      recordsProcessed: 0,
      recordsSuccessful: 0,
      recordsFailed: 0,
      errors: [],
      memoryUsage: process.memoryUsage(),
      targetUrl: details.targetUrl,
      universityName: details.universityName
    };

    this.scrapingLogs.push(metrics);
    this.trimLogs();

    console.log(`[MONITORING] Started operation: ${metrics.operation}`);
    return metrics.operation;
  }

  /**
   * Updates progress of a scraping operation
   */
  updateScrapingProgress(operationId: string, update: {
    recordsProcessed?: number;
    recordsSuccessful?: number;
    recordsFailed?: number;
    errors?: string[];
  }): void {
    const metrics = this.scrapingLogs.find(log => log.operation === operationId);
    if (!metrics) {
      console.warn(`[MONITORING] Operation not found: ${operationId}`);
      return;
    }

    if (update.recordsProcessed !== undefined) {
      metrics.recordsProcessed = update.recordsProcessed;
    }
    if (update.recordsSuccessful !== undefined) {
      metrics.recordsSuccessful = update.recordsSuccessful;
    }
    if (update.recordsFailed !== undefined) {
      metrics.recordsFailed = update.recordsFailed;
    }
    if (update.errors) {
      metrics.errors.push(...update.errors);
      
      // Track error frequencies
      update.errors.forEach(error => {
        const errorKey = this.extractErrorType(error);
        this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
      });
    }
  }

  /**
   * Completes a scraping operation
   */
  completeScrapingOperation(operationId: string, status: 'completed' | 'failed'): void {
    const metrics = this.scrapingLogs.find(log => log.operation === operationId);
    if (!metrics) {
      console.warn(`[MONITORING] Operation not found: ${operationId}`);
      return;
    }

    metrics.endTime = new Date();
    metrics.duration = metrics.endTime.getTime() - metrics.startTime.getTime();
    metrics.status = status;
    metrics.memoryUsage = process.memoryUsage();

    const logMessage = `[MONITORING] ${status.toUpperCase()}: ${operationId} (${metrics.duration}ms, ${metrics.recordsSuccessful}/${metrics.recordsProcessed} successful)`;
    
    if (status === 'completed') {
      console.log(logMessage);
    } else {
      console.error(logMessage, 'Errors:', metrics.errors);
    }
  }

  /**
   * Gets recent scraping operations with optional filtering
   */
  getScrapingLogs(options: {
    limit?: number;
    status?: 'running' | 'completed' | 'failed';
    since?: Date;
    universityName?: string;
  } = {}): ScrapingMetrics[] {
    let filtered = [...this.scrapingLogs];

    // Apply filters
    if (options.status) {
      filtered = filtered.filter(log => log.status === options.status);
    }
    if (options.since) {
      filtered = filtered.filter(log => log.startTime >= options.since!);
    }
    if (options.universityName) {
      filtered = filtered.filter(log => 
        log.universityName?.toLowerCase().includes(options.universityName!.toLowerCase())
      );
    }

    // Sort by start time (newest first)
    filtered.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    // Apply limit
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Gets aggregated scraping statistics
   */
  getScrapingStats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    runningOperations: number;
    averageDuration: number;
    totalRecordsProcessed: number;
    totalRecordsSuccessful: number;
    successRate: number;
    errorRate: number;
    topErrors: Array<{ error: string; count: number }>;
    operationsOverTime: Array<{ hour: string; count: number }>;
  } {
    const since = this.getTimeRangeStart(timeRange);
    const logs = this.getScrapingLogs({ since });

    const totalOperations = logs.length;
    const successfulOperations = logs.filter(log => log.status === 'completed').length;
    const failedOperations = logs.filter(log => log.status === 'failed').length;
    const runningOperations = logs.filter(log => log.status === 'running').length;

    const completedLogs = logs.filter(log => log.duration !== undefined);
    const averageDuration = completedLogs.length > 0 
      ? completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / completedLogs.length
      : 0;

    const totalRecordsProcessed = logs.reduce((sum, log) => sum + log.recordsProcessed, 0);
    const totalRecordsSuccessful = logs.reduce((sum, log) => sum + log.recordsSuccessful, 0);

    const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0;
    const errorRate = totalOperations > 0 ? (failedOperations / totalOperations) * 100 : 0;

    // Get top errors
    const topErrors = Array.from(this.errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Operations over time (hourly buckets)
    const operationsOverTime = this.getOperationsOverTime(logs, timeRange);

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      runningOperations,
      averageDuration: Math.round(averageDuration),
      totalRecordsProcessed,
      totalRecordsSuccessful,
      successRate: Math.round(successRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      topErrors,
      operationsOverTime
    };
  }

  /**
   * Gets current system metrics
   */
  getCurrentSystemMetrics(): {
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
    activeScrapingOperations: number;
    errorRate: number;
    timestamp: Date;
  } {
    const runningOps = this.scrapingLogs.filter(log => log.status === 'running').length;
    const recentErrors = this.getScrapingLogs({ 
      since: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      status: 'failed' 
    }).length;
    const recentTotal = this.getScrapingLogs({ 
      since: new Date(Date.now() - 60 * 60 * 1000) 
    }).length;

    return {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      activeScrapingOperations: runningOps,
      errorRate: recentTotal > 0 ? (recentErrors / recentTotal) * 100 : 0,
      timestamp: new Date()
    };
  }

  /**
   * Gets system health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: ReturnType<MonitoringService['getCurrentSystemMetrics']>;
  } {
    const metrics = this.getCurrentSystemMetrics();
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check memory usage
    const memoryUsagePercent = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      issues.push('High memory usage (>90%)');
      status = 'critical';
    } else if (memoryUsagePercent > 75) {
      issues.push('Elevated memory usage (>75%)');
      status = status === 'healthy' ? 'warning' : status;
    }

    // Check error rate
    if (metrics.errorRate > 50) {
      issues.push('High error rate (>50%)');
      status = 'critical';
    } else if (metrics.errorRate > 25) {
      issues.push('Elevated error rate (>25%)');
      status = status === 'healthy' ? 'warning' : status;
    }

    // Check for stuck operations (running for more than 1 hour)
    const stuckOps = this.scrapingLogs.filter(log => 
      log.status === 'running' && 
      (Date.now() - log.startTime.getTime()) > 60 * 60 * 1000
    ).length;

    if (stuckOps > 0) {
      issues.push(`${stuckOps} operations running for over 1 hour`);
      status = status === 'healthy' ? 'warning' : status;
    }

    return { status, issues, metrics };
  }

  /**
   * Logs a custom monitoring event
   */
  logEvent(event: {
    type: 'info' | 'warning' | 'error';
    message: string;
    context?: Record<string, any>;
  }): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[MONITORING:${event.type.toUpperCase()}] ${timestamp} - ${event.message}`;
    
    if (event.context) {
      console.log(logMessage, event.context);
    } else {
      console.log(logMessage);
    }

    // Track errors for statistics
    if (event.type === 'error') {
      const errorKey = this.extractErrorType(event.message);
      this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    }
  }

  /**
   * Starts periodic system monitoring
   */
  private startSystemMonitoring(): void {
    // Collect system metrics every 5 minutes
    setInterval(() => {
      const metrics: SystemMetrics = {
        timestamp: new Date(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        activeConnections: 0, // Could be enhanced to track actual connections
        errorRate: this.calculateCurrentErrorRate(),
        requestCount: 0 // Could be enhanced to track requests
      };

      this.systemMetrics.push(metrics);
      this.trimMetrics();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Calculates current error rate
   */
  private calculateCurrentErrorRate(): number {
    const recentLogs = this.getScrapingLogs({ 
      since: new Date(Date.now() - 60 * 60 * 1000) // Last hour
    });
    
    if (recentLogs.length === 0) return 0;
    
    const failures = recentLogs.filter(log => log.status === 'failed').length;
    return (failures / recentLogs.length) * 100;
  }

  /**
   * Extracts error type from error message
   */
  private extractErrorType(error: string): string {
    // Extract first meaningful part of error message
    const match = error.match(/^([A-Za-z]+Error|Error)/) || 
                  error.match(/^([A-Z][a-z]+)\s/) ||
                  [null, 'UnknownError'];
    
    return match[1] || 'UnknownError';
  }

  /**
   * Gets start time for a given time range
   */
  private getTimeRangeStart(timeRange: '1h' | '24h' | '7d' | '30d'): Date {
    const now = Date.now();
    switch (timeRange) {
      case '1h': return new Date(now - 60 * 60 * 1000);
      case '24h': return new Date(now - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now - 30 * 24 * 60 * 60 * 1000);
      default: return new Date(now - 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Groups operations by time buckets
   */
  private getOperationsOverTime(logs: ScrapingMetrics[], timeRange: string): Array<{ hour: string; count: number }> {
    const buckets = new Map<string, number>();
    const bucketSize = timeRange === '1h' ? 10 * 60 * 1000 : // 10 minutes for 1h view
                      timeRange === '24h' ? 60 * 60 * 1000 :   // 1 hour for 24h view
                      24 * 60 * 60 * 1000;                     // 1 day for longer views

    logs.forEach(log => {
      const bucketTime = Math.floor(log.startTime.getTime() / bucketSize) * bucketSize;
      const bucketKey = new Date(bucketTime).toISOString();
      buckets.set(bucketKey, (buckets.get(bucketKey) || 0) + 1);
    });

    return Array.from(buckets.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }

  /**
   * Trims old log entries to prevent memory issues
   */
  private trimLogs(): void {
    if (this.scrapingLogs.length > this.maxLogRetention) {
      this.scrapingLogs = this.scrapingLogs
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        .slice(0, this.maxLogRetention);
    }
  }

  /**
   * Trims old metrics to prevent memory issues
   */
  private trimMetrics(): void {
    if (this.systemMetrics.length > this.maxMetricsRetention) {
      this.systemMetrics = this.systemMetrics
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, this.maxMetricsRetention);
    }
  }
}

// Global monitoring instance
export const monitoring = new MonitoringService();