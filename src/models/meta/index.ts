export default abstract class MetaModel {
  abstract url: string;
  abstract name: string;

  protected async request<T = JSON>(
    url: string,
    options?: RequestInit,
  ): Promise<T> {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Fetch failed:", err);
      throw err;
    }
  }
}
