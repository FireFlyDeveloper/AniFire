# AniFire 🎬

Anime/Manga API service powered by Hono.js and AniList GraphQL.

## Features

- **🔥 Fast & Lightweight**: Built with Hono.js for blazing-fast performance
- **🎯 GraphQL-powered**: Direct integration with AniList's GraphQL API
- **📚 Comprehensive Content**: Fetch anime, manga, manhwa, and novels in one request
- **🏠 Home Feed**: Pre-configured feed with trending and popular content
- **📊 Sorted Results**: Content sorted by average score
- **🎨 TypeScript**: Fully typed codebase for better DX
- **⚡ Bun**: Ultra-fast runtime and package manager

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono.js v4.x
- **Language**: TypeScript
- **Data Source**: AniList GraphQL API

## Installation

```bash
# Clone the repository
git clone https://github.com/FireFlyDeveloper/AniFire.git
cd AniFire

# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Run production build
bun run start
```

## API Endpoints

### Get Home Feed
**Endpoint:** `GET /api/meta/home`

Returns a combined feed of anime, manga, manhwa, and novels, sorted by average score.

**Response Example:**
```json
[
  {
    "id": 12345,
    "title": {
      "romaji": "Attack on Titan",
      "english": "Attack on Titan",
      "native": "進撃の巨人"
    },
    "type": "ANIME",
    "format": "TV",
    "coverImage": {
      "extraLarge": "https://example.com/image.jpg",
      "color": "#1a1a1a"
    },
    "averageScore": 92,
    "episodes": 75,
    "status": "FINISHED",
    "description": "Humanity fights for survival against giant humanoid creatures...",
    "genres": ["Action", "Drama", "Fantasy"],
    "category": "Anime"
  },
  // ... more items
]
```

### Health Check
**Endpoint:** `GET /`

Returns a simple "Hello, World!" response to verify server status.

## Project Structure

```
AniFire/
├── dist/                    # Build output
├── src/
│   ├── controllers/
│   │   └── meta/
│   │       └── AnilistController.ts    # Request handlers
│   ├── services/
│   │   └── meta/
│   │       └── AnilistService.ts       # Business logic
│   ├── models/
│   │   ├── meta/
│   │   │   ├── Anilist/                # AniList-specific module
│   │   │   │   ├── Anilist.model.ts    # Data fetching & API integration
│   │   │   │   └── anilist.queries.ts  # GraphQL query definitions
│   │   │   └── index.ts               # Base model with request handler
│   └── routers/
│       ├── index.ts                   # Main router
│       └── meta/
│           ├── index.ts               # Meta routes
│           └── anilist.route.ts       # AniList specific routes
│   └── types/
│       └── meta/
│           └── anilist.ts             # TypeScript types
├── app.ts                  # Application entry point
├── package.json            # Dependencies & scripts
└── README.md              # This file
```

## Data Structure

### MediaItem
- `id`: Unique identifier
- `title`: Object containing `romaji`, `english`, `native` titles
- `type`: Media type (ANIME, MANGA)
- `format`: Format (TV, MOVIE, NOVEL, etc.)
- `coverImage`: Cover image URLs and color
- `averageScore`: Score 0-100
- `episodes`: Episode count (anime)
- `chapters`: Chapter count (manga/manhwa)
- `volumes`: Volume count
- `status`: Publishing status
- `description`: Summary text
- `genres`: Array of genre strings

### Categories
The API returns a unified feed with content categorized as:
- `Anime`: Trending anime series
- `Manga`: Popular manga
- `Manhwa`: Korean manhwa
- `Novel`: Light novels

## Development

### Code Style
```bash
# Format code with Prettier
bun run prettier
```

### Scripts
- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run start` - Run production build
- `bun run prettier` - Format code

### Environment Variables
- `PORT` - Server port (default: 3000)

## How It Works

1. **Request Flow**
   - Client makes request to `GET /api/meta/home`
   - Hono router directs to AnilistController.getHomeFeed
   - Controller calls AnilistService.getHomeFeed
   - Service uses AnilistModel to fetch data from AniList GraphQL API

2. **GraphQL Queries**
   - Queries are defined in `src/models/meta/Anilist/anilist.queries.ts`
   - Organized as typed constants in the Anilist module
   - Models import and execute queries from the same module (co-located)
   - Fetches:
     - 6 trending anime
     - 6 popular manga
     - 6 Korean manhwa
     - 6 light novels
   - Combines all results
   - Sorts by average score (descending)

3. **Response Formatting**
   - Adds category labels (Anime/Manga/Manhwa/Novel)
   - Returns unified JSON array

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Add search functionality
- [ ] Implement caching for better performance
- [ ] Add pagination support
- [ ] Create user authentication
- [ ] Add favorites and watchlist features
- [ ] Implement rate limiting
- [ ] Add Docker support
- [ ] Create comprehensive API documentation with Swagger

## Performance

- **Bundle Size**: ~52KB (production)
- **Build Time**: ~156ms
- **First Response Time**: <100ms (with proper caching)

## License

ISC

## Credits

- **AniList** - For providing the amazing GraphQL API
- **Hono.js** - For the blazing-fast web framework
- **Bun** - For the ultra-fast runtime

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ using Hono.js and Bun