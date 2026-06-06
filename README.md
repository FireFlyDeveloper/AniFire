# AniFire 🎬

Anime/Manga API service powered by Hono.js and AniList GraphQL.

## Features

- **🔥 Fast & Lightweight**: Built with Hono.js for blazing-fast performance
- **🎯 GraphQL-powered**: Direct integration with AniList's GraphQL API
- **📚 Comprehensive Content**: Fetch anime, manga, manhwa, and novels in one request
- **🏠 Home Feed**: Pre-configured feed with trending and popular content
- **📊 Rich Data Structure**: Complete anime/manga data including studios, ratings, external links, and more
- **🔍 Multiple Query Types**: Home feed, detailed media lookup, search, seasonal, and trending queries
- **📅 Full Metadata**: Start/end dates, season/year, episode counts, duration, and source material
- **🎨 Visual Assets**: Multiple image sizes, banners, and trailers
- **🏆 Rankings & Stats**: Popularity, favorites, trending, and all-time rankings
- **🔗 External Integration**: Streaming platforms, official sites, and external links
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

### Search Media
**Endpoint:** `GET /api/meta/search`

Search for anime or manga with support for pagination.

**Required Parameters:**
- `search` - Search query string
- `type` - Media type: either `ANIME` or `MANGA`

**Optional Parameters:**
- `page` - Page number (default: 1, minimum: 1)
- `perPage` - Results per page (default: 20, range: 1-50)

**Example Request:**
```
GET /api/meta/search?search=one%20piece&type=ANIME&page=1&perPage=10
```

**Example Response:**
```json
{
  "items": [
    {
      "id": 21,
      "title": {
        "romaji": "One Piece",
        "english": "One Piece",
        "native": "ワンピース",
        "userPreferred": "One Piece"
      },
      "type": "ANIME",
      "format": "TV",
      "status": "RELEASING",
      "coverImage": {
        "extraLarge": "https://example.com/one-piece.jpg",
        "large": "https://example.com/one-piece-large.jpg",
        "color": "#0f1c47"
      },
      "averageScore": 87,
      "episodes": null,
      "genres": ["Action", "Adventure", "Comedy"],
      "popularity": 150000,
      "seasonYear": 1999,
      "siteUrl": "https://anilist.co/anime/21"
    }
  ],
  "pageInfo": {
    "total": 100,
    "perPage": 10,
    "currentPage": 1,
    "lastPage": 10,
    "hasNextPage": true
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing or invalid parameters
```json
{
  "error": "Missing required parameter: search"
}
```

- `500 Internal Server Error` - API error
```json
{
  "error": "Failed to fetch search results",
  "details": "Error message"
}
```

### Get Media by ID
**Endpoint:** `GET /api/meta/info/:id`

Get detailed information for a specific anime or manga by its AniList ID.

**Path Parameters:**
- `id` - The AniList media ID (positive integer)

**Example Request:**
```
GET /api/meta/info/21
```

**Example Response:**
```json
{
  "id": 21,
  "title": {
    "romaji": "One Piece",
    "english": "One Piece",
    "native": "ワンピース",
    "userPreferred": "One Piece"
  },
  "type": "ANIME",
  "format": "TV",
  "status": "RELEASING",
  "description": "Gold Roger was known as the 'Pirate King'...",
  "synonyms": ["OP"],
  "isAdult": false,
  "countryOfOrigin": "JP",
  "source": "MANGA",
  "startDate": {
    "year": 1999,
    "month": 10,
    "day": 20
  },
  "endDate": {
    "year": null,
    "month": null,
    "day": null
  },
  "season": "FALL",
  "seasonYear": 1999,
  "seasonInt": 35,
  "episodes": null,
  "duration": 24,
  "averageScore": 87,
  "meanScore": 86,
  "popularity": 710896,
  "favourites": 35000,
  "trending": 245,
  "genres": ["Action", "Adventure", "Comedy", "Fantasy"],
  "tags": [
    {
      "name": "Pirates",
      "rank": 98,
      "isGeneralSpoiler": false,
      "isMediaSpoiler": false
    }
  ],
  "studios": {
    "nodes": [
      {
        "id": 18,
        "name": "Toei Animation",
        "isAnimationStudio": true,
        "siteUrl": "https://anilist.co/studio/18"
      }
    ]
  },
  "rankings": [
    {
      "rank": 5,
      "type": "POPULARITY",
      "allTime": true,
      "context": "most popular anime"
    }
  ],
  "externalLinks": [
    {
      "id": 1,
      "url": "https://www.crunchyroll.com/one-piece",
      "site": "Crunchyroll",
      "type": "streaming"
    }
  ],
  "streamingEpisodes": [
    {
      "title": "Episode 1000",
      "thumbnail": "https://example.com/thumb.jpg",
      "url": "https://example.com/watch",
      "site": "Crunchyroll"
    }
  ],
  "trailer": {
    "id": "abc123",
    "site": "youtube",
    "thumbnail": "https://example.com/trailer.jpg"
  },
  "coverImage": {
    "extraLarge": "https://example.com/cover-xl.jpg",
    "large": "https://example.com/cover-lg.jpg",
    "medium": "https://example.com/cover-md.jpg",
    "color": "#0f1c47"
  },
  "bannerImage": "https://example.com/banner.jpg",
  "siteUrl": "https://anilist.co/anime/21"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid or missing ID
```json
{
  "error": "Missing or invalid parameter: id (must be a positive integer)"
}
```

- `404 Not Found` - Media ID doesn't exist (AniList returns null)
```json
{
  "error": "Failed to fetch media by ID",
  "details": "Media not found"
}
```

- `500 Internal Server Error` - API error
```json
{
  "error": "Failed to fetch media by ID",
  "details": "Error message"
}
```

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

### MediaItem - Comprehensive Fields

**Basic Information:**
- `id`: Unique identifier
- `title`: Object containing `romaji`, `english`, `native`, `userPreferred` titles
- `type`: Media type (ANIME, MANGA)
- `format`: Format (TV, MOVIE, NOVEL, ONE_SHOT, etc.)
- `status`: Publishing status (FINISHED, RELEASING, NOT_YET_RELEASED, etc.)
- `description`: Summary text (plain text)
- `synonyms`: Alternative titles
- `isAdult`: Adult content flag

**Dates & Season:**
- `startDate`: Object with `year`, `month`, `day`
- `endDate`: Object with `year`, `month`, `day`
- `season`: Season (WINTER, SPRING, SUMMER, FALL)
- `seasonYear`: Release year
- `countryOfOrigin`: Country code (JP, KR, CN, etc.)
- `source`: Source material (MANGA, NOVEL, ORIGINAL, etc.)

**Counts & Duration:**
- `episodes`: Episode count (anime)
- `chapters`: Chapter count (manga/manhwa)
- `volumes`: Volume count
- `duration`: Episode duration in minutes (anime)

**Ratings & Metrics:**
- `averageScore`: Average user score 0-100
- `meanScore`: Mean score alternative metric
- `popularity`: Popularity ranking
- `favourites`: User favorites count
- `trending`: Trending score

**Content Classification:**
- `genres`: Array of genre strings (Action, Drama, etc.)
- `tags`: Array of tag objects with name, rank, spoiler flags

**Studio & Team Information:**
- `studios`: Studio information including names, isMainStudio, siteUrl

**Rankings:**
- `rankings`: Array of rankings (popularity, score, all-time, etc.)

**External Integration:**
- `externalLinks`: Streaming platforms, official sites, social media
- `streamingEpisodes`: Available streaming episodes with thumbnails
- `trailer`: Trailer information with ID and thumbnail

**Visual Assets:**
- `coverImage`: Object with `extraLarge`, `large`, `medium` sizes and `color`
- `bannerImage`: Large banner image
- `siteUrl`: AniList site reference URL

### Query Types

1. **HOME_FEED**: Combined feed with trending anime, popular manga, manhwa, and novels
2. **GET_MEDIA_BY_ID**: Detailed information for a specific media item
3. **SEARCH_MEDIA**: Search anime/manga with pagination
4. **GET_SEASONAL_ANIME**: All anime from a specific season/year
5. **GET_TRENDING_MEDIA**: Currently trending media

### Categories
The API returns content categorized as:
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

- [x] Add search functionality
- [x] Implement pagination support
- [x] Implement media by ID endpoint
- [ ] Implement caching for better performance
- [ ] Create user authentication
- [ ] Add favorites and watchlist features
- [ ] Implement rate limiting
- [ ] Add Docker support
- [ ] Create comprehensive API documentation with Swagger
- [ ] Implement seasonal anime endpoint
- [ ] Implement trending media endpoint

## Recent Updates

### v2.2.0 - Media by ID Endpoint (Current)
- ✅ **New API Endpoint**: `GET /api/meta/info/:id` for detailed media lookup
- 🆔 **ID-Based Discovery**: Get comprehensive anime/manga details by AniList ID
- 📊 **Rich Data Returns**: All 50+ fields including studios, rankings, external links
- 🎬 **Streaming Info**: External links, streaming episodes, and trailers
- 🏢 **Studio Details**: Complete studio information and production details
- ⭐ **Rankings & Scores**: Multiple ranking types and scoring metrics
- 📚 **Complete Documentation**: Full API documentation with detailed examples
- ✅ **Parameter Validation**: Proper ID validation and error handling

### v2.1.0 - Search Endpoint
- ✅ **New API Endpoint**: `GET /api/meta/search` for anime/manga search
- 🔍 **Search Functionality**: Full search by title with query parameters
- 📄 **Pagination Support**: Configurable page (min 1) and perPage (1-50) parameters
- 🎯 **Type Filtering**: Search specifically for anime or manga
- ⚠️ **Input Validation**: Comprehensive error handling for invalid parameters
- 📊 **Rich Results**: Returns comprehensive media data with page info
- 📚 **Documentation**: Complete API documentation with examples
- 🎨 **Error Responses**: Proper HTTP status codes and error messages

### v2.0.1 - API Compatibility Fixes
- 🐛 **Fixed GraphQL Syntax Errors**: Removed `isMainStudio` and `bannerSkipImage` fields that don't exist in AniList API
- ✅ **Validated All Queries**: Tested all 5 query types against live AniList GraphQL endpoint
- 🔄 **Updated TypeScript Types**: Matched interfaces to actual AniList API schema
- 🚀 **Production Tested**: Verified API responses with successful data fetching
- 📝 **Error Resolution**: Fixed 400 Bad Request errors with corrected field names

### v2.0 - GraphQL Enhancement
- ✅ **Expanded GraphQL Queries**: Added 50+ additional fields per media item
- ✅ **Multiple Query Types**: Home feed, detailed lookup, search, seasonal, trending
- ✅ **Enhanced Data**: Studios, rankings, external links, streaming episodes, trailers
- ✅ **Rich Metadata**: Full date information, season/year, duration, source material
- ✅ **Multiple Image Sizes**: Extra large, large, medium covers + banners
- ✅ **Comprehensive Types**: Updated TypeScript interfaces for all new fields
- ✅ **Improved Documentation**: Complete data structure reference

### v1.0 - Initial Release
- Basic home feed with anime, manga, manhwa, novels
- Express.js framework
- Basic GraphQL integration

## Performance

- **Bundle Size**: ~62KB (production, with comprehensive types)
- **Build Time**: ~10ms
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