export const ANILIST_QUERIES = {
  HOME_FEED: `
    query HomeFeed {
      trendingAnime: Page(perPage: 6) {
        media(sort: TRENDING_DESC, type: ANIME) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          type
          format
          status
          description(asHtml: false)
          synonyms
          isAdult
          countryOfOrigin
          source
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          season
          seasonYear
          seasonInt
          episodes
          duration
          averageScore
          meanScore
          popularity
          favourites
          trending
          genres
          tags {
            name
            rank
            isGeneralSpoiler
            isMediaSpoiler
            isAdult
          }
          studios {
            nodes {
              id
              name
              isAnimationStudio
              isMainStudio
              siteUrl
            }
            edges {
              isMain
            }
          }
          rankings {
            rank
            type
            allTime
            context
            year
            season
            format
          }
          externalLinks {
            id
            url
            site
            type
            language
            color
            icon
          }
          streamingEpisodes {
            title
            thumbnail
            url
            site
          }
          trailer {
            id
            site
            thumbnail
          }
          coverImage {
            extraLarge
            large
            medium
            color
          }
          bannerImage
          bannerSkipImage
          siteUrl
        }
      }
      popularManga: Page(perPage: 6) {
        media(sort: POPULARITY_DESC, type: MANGA) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          type
          format
          status
          description(asHtml: false)
          synonyms
          isAdult
          countryOfOrigin
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          chapters
          volumes
          averageScore
          meanScore
          popularity
          favourites
          genres
          tags {
            name
            rank
            isGeneralSpoiler
            isMediaSpoiler
            isAdult
          }
          rankings {
            rank
            type
            allTime
            context
            year
            format
          }
          externalLinks {
            id
            url
            site
            type
            language
            color
            icon
          }
          coverImage {
            extraLarge
            large
            medium
            color
          }
          bannerImage
          bannerSkipImage
          siteUrl
        }
      }
      manhwa: Page(perPage: 6) {
        media(sort: POPULARITY_DESC, type: MANGA, countryOfOrigin: KR) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          type
          format
          status
          description(asHtml: false)
          synonyms
          isAdult
          countryOfOrigin
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          chapters
          volumes
          averageScore
          meanScore
          popularity
          favourites
          genres
          tags {
            name
            rank
            isGeneralSpoiler
            isMediaSpoiler
            isAdult
          }
          rankings {
            rank
            type
            allTime
            context
            year
            format
          }
          externalLinks {
            id
            url
            site
            type
            language
            color
            icon
          }
          coverImage {
            extraLarge
            large
            medium
            color
          }
          bannerImage
          bannerSkipImage
          siteUrl
        }
      }
      lightNovels: Page(perPage: 6) {
        media(sort: POPULARITY_DESC, type: MANGA, format: NOVEL) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          type
          format
          status
          description(asHtml: false)
          synonyms
          isAdult
          countryOfOrigin
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          chapters
          volumes
          averageScore
          meanScore
          popularity
          favourites
          genres
          tags {
            name
            rank
            isGeneralSpoiler
            isMediaSpoiler
            isAdult
          }
          rankings {
            rank
            type
            allTime
            context
            year
            format
          }
          externalLinks {
            id
            url
            site
            type
            language
            color
            icon
          }
          coverImage {
            extraLarge
            large
            medium
            color
          }
          bannerImage
          bannerSkipImage
          siteUrl
        }
      }
    }
  `,
  GET_MEDIA_BY_ID: `
    query GetMediaById($id: Int!) {
      Media(id: $id) {
        id
        title {
          romaji
          english
          native
          userPreferred
        }
        type
        format
        status
        description(asHtml: false)
        synonyms
        isAdult
        countryOfOrigin
        source
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        seasonYear
        seasonInt
        episodes
        duration
        chapters
        volumes
        averageScore
        meanScore
        popularity
        favourites
        trending
        genres
        tags {
          name
          rank
          isGeneralSpoiler
          isMediaSpoiler
          isAdult
        }
        studios {
          nodes {
            id
            name
            isAnimationStudio
            isMainStudio
            siteUrl
          }
        }
        rankings {
          rank
          type
          allTime
          context
        }
        externalLinks {
          id
          url
          site
          type
          language
        }
        streamingEpisodes {
          title
          thumbnail
          url
          site
        }
        trailer {
          id
          site
          thumbnail
        }
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
        bannerSkipImage
        siteUrl
      }
    }
  `,
  SEARCH_MEDIA: `
    query SearchMedia($search: String!, $type: MediaType!, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        media(search: $search, type: $type, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          type
          format
          status
          coverImage {
            extraLarge
            large
            color
          }
          averageScore
          episodes
          chapters
          genres
          isAdult
          seasonYear
          popularity
        }
      }
    }
  `,
  GET_SEASONAL_ANIME: `
    query GetSeasonalAnime($season: MediaSeason!, $year: Int!) {
      Page(page: 1, perPage: 20) {
        media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          type
          format
          status
          description(asHtml: false)
          isAdult
          countryOfOrigin
          source
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          season
          seasonYear
          episodes
          duration
          averageScore
          popularity
          favourites
          trending
          genres
          tags {
            name
            rank
          }
          studios {
            nodes {
              id
              name
              isAnimationStudio
            }
          }
          rankings {
            rank
            type
            allTime
          }
          externalLinks {
            id
            url
            site
            type
          }
          streamingEpisodes {
            title
            thumbnail
            url
            site
          }
          trailer {
            id
            site
            thumbnail
          }
          coverImage {
            extraLarge
            large
            color
          }
          bannerImage
          siteUrl
        }
      }
    }
  `,
  GET_TRENDING_MEDIA: `
    query GetTrendingMedia($type: MediaType!) {
      Page(page: 1, perPage: 20) {
        media(type: $type, sort: TRENDING_DESC) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          type
          format
          status
          coverImage {
            extraLarge
            large
            color
          }
          averageScore
          episodes
          chapters
          genres
          isAdult
          seasonYear
          popularity
          trending
          description(asHtml: false)
        }
      }
    }
  `,
} as const

export type AnilistQuery = keyof typeof ANILIST_QUERIES