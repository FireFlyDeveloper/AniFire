/**
 * Performance Monitor - Track and analyze API performance
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

export interface PerformanceStats {
  totalCalls: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  recentMetrics: PerformanceMetric[];
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]>;
  private maxMetricsPerName: number;

  constructor(maxMetricsPerName: number = 100) {
    this.metrics = new Map();
    this.maxMetricsPerName = maxMetricsPerName;
  }

  /**
   * Start tracking a performance measurement
   */
  start(name: string): (metadata?: Record<string, unknown>) => void {
    const startTime = Date.now();

    return (metadata?: Record<string, unknown>) => {
      const duration = Date.now() - startTime;
      this.recordMetric(name, duration, true, metadata);
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      success,
      metadata,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only recent metrics
    if (metrics.length > this.maxMetricsPerName) {
      metrics.shift();
    }
  }

  /**
   * Get statistics for a specific operation
   */
  getStats(name: string): PerformanceStats | null {
    const metrics = this.metrics.get(name);

    if (!metrics || metrics.length === 0) {
      return null;
    }

    const totalCalls = metrics.length;
    const successCount = metrics.filter((m) => m.success).length;
    const durations = metrics.map((m) => m.duration);

    return {
      totalCalls,
      averageDuration: durations.reduce((a, b) => a + b, 0) / totalCalls,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successCount / totalCalls) * 100,
      recentMetrics: metrics.slice(-10), // Last 10 metrics
    };
  }

  /**
   * Get statistics for all operations
   */
  getAllStats(): Map<string, PerformanceStats> {
    const result = new Map<string, PerformanceStats>();

    for (const name of this.metrics.keys()) {
      const stats = this.getStats(name);
      if (stats) {
        result.set(name, stats);
      }
    }

    return result;
  }

  /**
   * Get all metrics as an object
   */
  getAllMetricsAsObject(): Record<string, PerformanceStats> {
    const obj: Record<string, PerformanceStats> = {};

    for (const [name, stats] of this.getAllStats()) {
      obj[name] = stats;
    }

    return obj;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Clear metrics for a specific operation
   */
  clearMetrics(name: string): void {
    this.metrics.delete(name);
  }

  /**
   * Get total number of recorded metrics
   */
  getTotalCount(): number {
    let count = 0;
    for (const metrics of this.metrics.values()) {
      count += metrics.length;
    }
    return count;
  }
}

// Global performance monitor instance
export const globalPerfMonitor = new PerformanceMonitor();
