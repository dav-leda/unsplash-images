# Unsplash Image Downloader

A Node.js TypeScript application that downloads images from Unsplash API based on user search terms.

## Features

- 🔍 Search images by keyword
- 📊 Choose number of images to download (max 20)
- 📏 Select image size (raw, full, regular, small, thumb)
- 📁 Automatically creates organized folders based on search terms
- 🛡️ Input validation and error handling
- 💻 Interactive command-line interface

## Prerequisites

- Node.js (v18 or higher) - Required for native `fetch` API support
- pnpm package manager
- Unsplash API access key

## Get API Keys from Unsplash

- Create an account -> https://unsplash.com/join

- Once you’re in, go to the Menu -> Product -> Developers/API

- Click on Your Apps.

- Click on New Application and agree to the guidelines.

- Add your application’s name and description.

- Scroll down to 🔑 Keys section (this is where you’ll need to copy your Access key for API requests).

- At the bottom 🔒Permissions section, select: Public access, Read photos and Read collections access.

## Setup

1. **Clone or navigate to the project directory**

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Unsplash API**
   - Copy `.env.example` to `.env`
   - Get your API access key from [Unsplash Developers](https://unsplash.com/developers)
   - Add your access key to the `.env` file:
     ```
     UNSPLASH_ACCESS_KEY=your_access_key_here
     ```

## Usage

### Running the application

```bash
# Start the application
pnpm start

# Or use dev command
pnpm dev
```

### How it works

1. **Search Term**: Enter a keyword to search for images (e.g., "nature", "city", "animals")
2. **Number of Images**: Choose how many images to download (1-20)
3. **Image Size**: Select from available sizes:
   - Raw (Original size - varies by photo)
   - Full (2048px width)
   - Regular (1080px width) - Default/Recommended
   - Small (400px width)
   - Thumb (200px width)

The application will:
- Create a folder in `/images` named after your search term
- Download the selected number of images in your chosen size
- Show progress as images are downloaded
- Handle errors gracefully if any downloads fail

### Example

```
🖼️  Welcome to Unsplash Image Downloader!

? Enter search term for images: mountains
? How many images do you want to download? (max 20): 5
? Select image size: Regular (1080px width) - Recommended

🔍 Searching for "mountains" images...

📁 Creating folder: mountains
📂 Download path: /Users/yourname/project/images/mountains
📏 Image size: regular

⬇️  Downloading 5 images...
✅ Downloaded: mountains-1-abc123.jpg
✅ Downloaded: mountains-2-def456.jpg
✅ Downloaded: mountains-3-ghi789.jpg
✅ Downloaded: mountains-4-jkl012.jpg
✅ Downloaded: mountains-5-mno345.jpg

🎉 Download complete! Images saved to: /Users/yourname/project/images/mountains
```

## Project Structure

```
├── src/
│   └── index.ts          # Main application file
├── images/               # Downloaded images folder
│   └── [search-term]/   # Organized by search terms
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── .env                 # Environment variables (create from .env.example)
└── .env.example         # Environment variables template
```

## Scripts

- `pnpm start` - Run the application
- `pnpm dev` - Run the application (alias for start)
- `pnpm build` - Compile TypeScript to JavaScript

## Dependencies

- **dotenv** - Environment variable management
- **inquirer** - Interactive command-line prompts
- **typescript** - TypeScript compiler
- **ts-node** - Run TypeScript directly

Uses Node.js built-in modules:
- **`fetch` API** for HTTP requests (requires Node.js 18+)
- **`fs/promises`** for file system operations
- **`stream`** for file streaming

## Error Handling

The application includes comprehensive error handling for:
- Missing API credentials
- Network connectivity issues
- Invalid search terms
- Download failures
- File system errors

## API Usage

This application uses the Unsplash API. Please respect Unsplash's API guidelines and rate limits. For more information, visit [Unsplash API Documentation](https://unsplash.com/documentation).

## License

ISC
