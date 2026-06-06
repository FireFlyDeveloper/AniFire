import axios from "axios";

export class ImageService {
  private static instance: ImageService;

  private constructor() {}

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  async downloadImage(url: string): Promise<{ data: Buffer; mimeType: string } | null> {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 10000,
      });

      const contentType = response.headers["content-type"];
      const mimeType = contentType || "image/jpeg";

      return {
        data: Buffer.from(response.data),
        mimeType,
      };
    } catch (error) {
      console.error(`Failed to download image from ${url}:`, error);
      return null;
    }
  }

  async downloadCoverImage(coverImage?: {
    large?: string;
    medium?: string;
    extraLarge?: string;
  }): Promise<{ data: Buffer; mimeType: string } | null> {
    if (!coverImage) return null;

    const imageUrl = coverImage.extraLarge || coverImage.large || coverImage.medium;
    if (!imageUrl) return null;

    return this.downloadImage(imageUrl);
  }

  isValidImage(data: Buffer): boolean {
    if (!data || data.length < 10) return false;

    const signatures = {
      "image/jpeg": [0xff, 0xd8, 0xff],
      "image/png": [0x89, 0x50, 0x4e, 0x47],
      "image/gif": [0x47, 0x49, 0x46],
      "image/webp": [0x52, 0x49, 0x46, 0x46],
    };

    for (const [, signature] of Object.entries(signatures)) {
      let match = true;
      for (let i = 0; i < signature.length; i++) {
        if (data[i] !== signature[i]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }

    return false;
  }
}

export default ImageService.getInstance();
