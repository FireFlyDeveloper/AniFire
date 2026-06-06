/**
 * Request Pool - In-flight request deduplication
 * Prevents duplicate API calls for the same request
 */

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

export class RequestPool {
  private pendingRequests: Map<string, PendingRequest<unknown>>;
  private timeoutMs: number;

  constructor(timeoutMs: number = 30000) {
    this.pendingRequests = new Map();
    this.timeoutMs = timeoutMs;
  }

  /**
   * Execute a request, deduplicating if already in progress
   */
  async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Check if request is already in progress
    const existing = this.pendingRequests.get(key);

    if (existing) {
      // Check if pending request is still valid
      const age = Date.now() - existing.timestamp;
      if (age < this.timeoutMs) {
        console.log(`[RequestPool] Reusing in-flight request: ${key}`);
        return existing.promise as Promise<T>;
      } else {
        // Clean up stale request
        this.pendingRequests.delete(key);
      }
    }

    // Create new pending request
    const promise = fn();

    this.pendingRequests.set(key, {
      promise: promise.then((result) => {
        // Clean up on success
        this.pendingRequests.delete(key);
        return result;
      }),
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Get count of active requests
   */
  getActiveCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear();
  }

  /**
   * Clean up stale requests
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.timeoutMs) {
        this.pendingRequests.delete(key);
      }
    }
  }
}
