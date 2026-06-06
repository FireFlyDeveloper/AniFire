/**
 * Parallel Executor - Execute multiple tasks concurrently
 * Optimizes performance by running tasks in parallel instead of sequentially
 */

export interface ConcurrencyResult<T> {
  results: T[];
  errors: Error[];
  duration: number;
  successful: number;
  failed: number;
}

export class ParallelExecutor {
  private maxConcurrency: number;

  constructor(maxConcurrency: number = 10) {
    this.maxConcurrency = maxConcurrency;
  }

  /**
   * Execute multiple tasks concurrently with limited concurrency
   */
  async executeAll<T>(tasks: Array<() => Promise<T>>): Promise<ConcurrencyResult<T>> {
    const startTime = Date.now();
    const results: T[] = [];
    const errors: Error[] = [];

    if (tasks.length === 0) {
      return {
        results,
        errors,
        duration: Date.now() - startTime,
        successful: 0,
        failed: 0,
      };
    }

    // Execute in batches to limit concurrency
    const batchSize = Math.min(this.maxConcurrency, tasks.length);

    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map((task) => task())
      );

      for (const settled of batchResults) {
        if (settled.status === "fulfilled") {
          results.push(settled.value);
        } else {
          errors.push(settled.reason);
          console.error(`[ParallelExecutor] Task failed:`, settled.reason);
        }
      }
    }

    const duration = Date.now() - startTime;

    console.log(
      `[ParallelExecutor] Executed ${tasks.length} tasks in ${duration}ms (${results.length} successful, ${errors.length} failed)`
    );

    return {
      results,
      errors,
      duration,
      successful: results.length,
      failed: errors.length,
    };
  }

  /**
   * Execute all tasks without concurrency limit (full parallel)
   */
  async executeAllUnbounded<T>(
    tasks: Array<() => Promise<T>>
  ): Promise<ConcurrencyResult<T>> {
    const startTime = Date.now();

    const results = await Promise.allSettled(tasks.map((task) => task()));

    const successResults: T[] = [];
    const errors: Error[] = [];

    for (const settled of results) {
      if (settled.status === "fulfilled") {
        successResults.push(settled.value);
      } else {
        errors.push(settled.reason);
      }
    }

    const duration = Date.now() - startTime;

    console.log(
      `[ParallelExecutor] Unbounded: ${tasks.length} tasks in ${duration}ms (${successResults.length} successful, ${errors.length} failed)`
    );

    return {
      results: successResults,
      errors,
      duration,
      successful: successResults.length,
      failed: errors.length,
    };
  }

  /**
   * Execute tasks with timeout per task
   */
  async executeWithTimeout<T>(
    tasks: Array<() => Promise<T>>,
    timeoutMs: number
  ): Promise<ConcurrencyResult<T>> {
    const startTime = Date.now();

    const results = await Promise.allSettled(
      tasks.map((task) =>
        Promise.race([
          task(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Task timeout")), timeoutMs)
          ),
        ])
      )
    );

    const successResults: T[] = [];
    const errors: Error[] = [];

    for (const settled of results) {
      if (settled.status === "fulfilled") {
        successResults.push(settled.value);
      } else {
        errors.push(settled.reason);
      }
    }

    const duration = Date.now() - startTime;

    console.log(
      `[ParallelExecutor] Timeout: ${tasks.length} tasks in ${duration}ms (${successResults.length} successful, ${errors.length} failed)`
    );

    return {
      results: successResults,
      errors,
      duration,
      successful: successResults.length,
      failed: errors.length,
    };
  }
}
