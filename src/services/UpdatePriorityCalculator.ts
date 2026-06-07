import { createHash } from 'crypto';

export interface UpdateScore {
  itemId: string;

  // Database fields
  lastUpdate: Date;
  updateFrequency: number;

  // Request tracking (highest priority)
  recentRequestCount: number;
  lastRequestTime: Date;
  totalRequestCount: number;

  // Stats
  views?: number;
  favorites?: number;
  activeReaders?: number;

  // Metadata
  addedAt: Date;
  dailyUpdate?: boolean;
  weeklyUpdate?: boolean;
}

export interface ItemStatistics {
  views?: number;
  favorites?: number;
  recentRequests?: number;
  totalRequests?: number;
  addedAt: Date;
  activeReaders?: number;
  dailyUpdate?: boolean;
  weeklyUpdate?: boolean;
}

/**
 * Update Priority Calculator with Request-Based Scoring
 * Calculates update priority using weighted factors including user requests
 */
export class UpdatePriorityCalculator {
  /**
   * Calculate overall priority score for an item
   * Score determines update order in priority queue
   */
  calculateScore(item: UpdateScore): number {
    let score = 0;

    // Factor 0: User Request (HIGHEST PRIORITY - 30% weight)
    score += this.getRequestScore(item) * 1.0; // Multiplier for emphasis

    // Factor 1: Popularity (10% weight)
    score += this.getPopularityScore(item) * 0.33;

    // Factor 2: Update urgency (25% weight)
    score += this.getUrgencyScore(item) * 0.83;

    // Factor 3: Recency (15% weight)
    score += this.getRecencyScore(item.addedAt) * 0.5;

    // Factor 4: Activity level (10% weight)
    score += this.getActivityScore(item) * 0.33;

    // Factor 5: User engagement (10% weight)
    score += this.getEngagementScore(item) * 0.33;

    return Math.round(score * 100) / 100; // Round to 2 decimals
  }

  /**
   * Request Score (highest priority factor)
   * Items frequently requested by users get highest priority
   */
  private getRequestScore(item: UpdateScore): number {
    let score = 0;

    const hoursSinceLastRequest =
      (Date.now() - item.lastRequestTime.getTime()) / 3600000;

    // Recent requests (last 24 hours) - very high
    if (hoursSinceLastRequest < 1) {
      score += 20; // Requested within last hour - max priority!
    } else if (hoursSinceLastRequest < 6) {
      score += 15; // Requested within 6 hours
    } else if (hoursSinceLastRequest < 24) {
      score += 10; // Requested within last day
    } else if (hoursSinceLastRequest < 72) {
      score += 5; // Requested within 3 days
    }
    // No score if requested long ago

    // Request frequency
    score += item.recentRequestCount * 2; // Each recent request adds 2 points
    score += Math.log10(item.totalRequestCount + 1) * 5; // Total popularity (log scale)

    // Total requests overall
    if (item.totalRequestCount > 100) score += 5;
    else if (item.totalRequestCount > 50) score += 3;
    else if (item.totalRequestCount > 10) score += 1;

    return score;
  }

  /**
   * Popularity Score
   * Based on views, favorites, and general activity
   */
  private getPopularityScore(item: UpdateScore): number {
    let score = 0;
    score += (item.views || 0) * 0.00001;
    score += (item.favorites || 0) * 0.0001;
    return Math.round(score * 100) / 100;
  }

  /**
   * Urgency Score
   * Based on time since last update relative to expected update frequency
   */
  private getUrgencyScore(item: UpdateScore): number {
    const hoursSinceUpdate =
      (Date.now() - item.lastUpdate.getTime()) / 3600000;

    // How overdue is this item?
    const overdue = hoursSinceUpdate - item.updateFrequency;

    if (overdue > 0) {
      // Overdue items get exponential urgency
      return Math.log10(overdue + 1) * 5;
    } else {
      // Calculate progress toward next update
      const progress = hoursSinceUpdate / item.updateFrequency;
      return progress * 2; // Up to 2 points before deadline
    }
  }

  /**
   * Recency Score
   * Newer items need more frequent updates
   */
  private getRecencyScore(addedAt: Date): number {
    const daysSinceAdded = (Date.now() - addedAt.getTime()) / 86400000;

    if (daysSinceAdded < 1) return 15; // Added today - very high
    if (daysSinceAdded < 7) return 10; // Added this week
    if (daysSinceAdded < 30) return 5; // Added this month
    if (daysSinceAdded < 90) return 2; // Added this quarter
    return 0; // Old items - no recency bonus
  }

  /**
   * Activity Score
   * Based on known update patterns
   */
  private getActivityScore(item: UpdateScore): number {
    let score = 0;
    if (item.dailyUpdate) score += 5;
    if (item.weeklyUpdate) score += 2;
    return score;
  }

  /**
   * Engagement Score
   * Based on active readers and ongoing engagement
   */
  private getEngagementScore(item: UpdateScore): number {
    const activeReaders = item.activeReaders || 0;

    if (activeReaders > 100) return 5;
    if (activeReaders > 10) return 3;
    if (activeReaders > 1) return 1;
    return 0;
  }

  /**
   * Generate content hash for change detection
   */
  generateContentHash(data: any): string {
    const content = {
      chapterCount: data.chapters?.length || 0,
      latestChapter: data.chapters?.[data.chapters.length - 1]?.title,
      titles: data.chapters?.map((c: any) => c.title)
    };

    const hash = createHash('md5');
    hash.update(JSON.stringify(content));
    return hash.digest('hex');
  }

  /**
   * Check if hash indicates change
   */
  hasChanged(oldHash: string, newData: any): boolean {
    const newHash = this.generateContentHash(newData);
    return oldHash !== newHash;
  }
}
