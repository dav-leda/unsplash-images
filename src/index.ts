import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import * as path from 'path';
import * as stream from 'stream';
import { promisify } from 'util';
import inquirer from 'inquirer';
import { config } from 'dotenv';

// Load environment variables
config();

interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

interface UnsplashResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

class UnsplashImageDownloader {
  private apiKey: string;
  private baseUrl: string;
  private imagesDir: string;

  constructor() {
    this.apiKey = process.env.UNSPLASH_ACCESS_KEY || '';
    this.baseUrl = 'https://api.unsplash.com';
    this.imagesDir = path.join(__dirname, '..', 'images');

    if (!this.apiKey) {
      throw new Error('UNSPLASH_ACCESS_KEY is required in .env file');
    }
  }

  async searchImages(query: string, count: number): Promise<UnsplashImage[]> {
    try {
      const url = new URL(`${this.baseUrl}/search/photos`);
      url.searchParams.append('query', query);
      url.searchParams.append('per_page', count.toString());
      url.searchParams.append('client_id', this.apiKey);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as UnsplashResponse;
      return data.results;
    } catch (error) {
      console.error('Error searching images:', error);
      throw error;
    }
  }

  async downloadImage(imageUrl: string, fileName: string, folderPath: string): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await mkdir(folderPath, { recursive: true });
      const filePath = path.join(folderPath, fileName);

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const fileStream = createWriteStream(filePath);
      const pipeline = promisify(stream.pipeline);

      // Convert the ReadableStream to a Node.js stream
      const nodeStream = stream.Readable.fromWeb(response.body as any);
      
      await pipeline(nodeStream, fileStream);
    } catch (error) {
      console.error(`Error downloading image ${fileName}:`, error);
      throw error;
    }
  }

  private sanitizeFolderName(name: string): string {
    return name.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  }

  async promptUser(): Promise<{ searchTerm: string; imageCount: number; imageSize: keyof UnsplashImage['urls'] }> {
    const searchTermAnswer = await inquirer.prompt({
      type: 'input',
      name: 'searchTerm',
      message: 'Enter search term for images:',
      validate: (input: string) => input.trim().length > 0 || 'Search term cannot be empty',
    });

    const imageCountAnswer = await inquirer.prompt({
      type: 'number',
      name: 'imageCount',
      message: 'How many images do you want to download? (max 20):',
      default: 10,
      validate: (input: number | undefined) => {
        if (input === undefined || input < 1) return 'Number must be at least 1';
        if (input > 20) return 'Number cannot exceed 20';
        return true;
      },
    });

    const imageSizeAnswer = await inquirer.prompt({
      type: 'list',
      name: 'imageSize',
      message: 'Select image size:',
      choices: [
        { name: 'Raw (Original size - varies by photo)', value: 'raw' },
        { name: 'Full (2048px width)', value: 'full' },
        { name: 'Regular (1080px width) - Recommended', value: 'regular' },
        { name: 'Small (400px width)', value: 'small' },
        { name: 'Thumb (200px width)', value: 'thumb' },
      ],
      default: 'regular',
    });

    return {
      searchTerm: searchTermAnswer.searchTerm,
      imageCount: imageCountAnswer.imageCount,
      imageSize: imageSizeAnswer.imageSize as keyof UnsplashImage['urls'],
    };
  }

  async run(): Promise<void> {
    try {
      console.log('🖼️  Welcome to Unsplash Image Downloader!\n');

      const { searchTerm, imageCount, imageSize } = await this.promptUser();

      console.log(`\n🔍 Searching for "${searchTerm}" images...`);
      const images = await this.searchImages(searchTerm, imageCount);

      if (images.length === 0) {
        console.log('❌ No images found for the search term.');
        return;
      }

      const folderName = this.sanitizeFolderName(searchTerm);
      const downloadPath = path.join(this.imagesDir, folderName);

      console.log(`\n📁 Creating folder: ${folderName}`);
      console.log(`📂 Download path: ${downloadPath}`);
      console.log(`📏 Image size: ${imageSize}`);
      console.log(`\n⬇️  Downloading ${images.length} images...`);

      const downloadPromises = images.map(async (image, index) => {
        const fileName = `${folderName}-${index + 1}-${image.id}.jpg`;
        const imageUrl = image.urls[imageSize];
        
        try {
          await this.downloadImage(imageUrl, fileName, downloadPath);
          console.log(`✅ Downloaded: ${fileName}`);
        } catch (error) {
          console.error(`❌ Failed to download: ${fileName}`, error);
        }
      });

      await Promise.all(downloadPromises);

      console.log(`\n🎉 Download complete! Images saved to: ${downloadPath}`);
    } catch (error) {
      console.error('❌ Application error:', error);
      process.exit(1);
    }
  }
}

// Run the application
if (require.main === module) {
  const downloader = new UnsplashImageDownloader();
  downloader.run().catch(console.error);
}

export default UnsplashImageDownloader;
