export default abstract class BaseModel {
  abstract url: string;
  abstract name: string;

  protected async request<T = JSON>(
    url: string,
    options?: RequestInit,
    maxRetries: number = 3,
    initialDelay: number = 1000,
  ): Promise<T> {
    let lastError: unknown;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, options);

        if (res.ok) {
          return (await res.json()) as T;
        }

        if (res.status >= 500 && attempt < maxRetries) {
          lastError = new Error(`HTTP error! Status: ${res.status}`);
          console.warn(
            `Attempt ${attempt} failed with status ${res.status}. Retrying in ${delay}ms...`,
          );
          await this.wait(delay);
          delay *= 2;
          continue;
        }

        throw new Error(`HTTP error! Status: ${res.status}`);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw err;
        }

        lastError = err;

        if (attempt < maxRetries) {
          console.warn(
            `Attempt ${attempt} failed. Retrying in ${delay}ms...`,
            err,
          );
          await this.wait(delay);
          delay *= 2;
        } else {
          console.error("Fetch failed after maximum retries:", err);
          throw err;
        }
      }
    }

    throw lastError;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
