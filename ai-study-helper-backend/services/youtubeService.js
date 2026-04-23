const axios = require('axios');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  async searchVideos(searchTerms, maxResults = 6) {
    try {
      if (!this.apiKey) {
        console.log('YouTube API key not configured, using mock data');
        return this.getMockVideos(searchTerms);
      }

      const searchQuery = Array.isArray(searchTerms) ? searchTerms.join(' ') : searchTerms;

      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          key: this.apiKey,
          part: 'snippet',
          q: searchQuery,
          type: 'video',
          maxResults,
          order: 'viewCount',
          safeSearch: 'strict'
        }
      });

      const videoIds = response.data.items.map(item => item.id.videoId).join(',');

      // Get video statistics for view counts
      const statsResponse = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          key: this.apiKey,
          part: 'statistics',
          id: videoIds
        }
      });

      const videos = response.data.items.map((item, index) => {
        const stats = statsResponse.data.items[index]?.statistics;
        return {
          title: item.snippet.title,
          videoId: item.id.videoId,
          thumbnail: item.snippet.thumbnails.medium.url,
          views: this.formatViewCount(stats?.viewCount || '0'),
          url: `https://youtube.com/watch?v=${item.id.videoId}`,
          channelTitle: item.snippet.channelTitle,
          description: item.snippet.description.substring(0, 200)
        };
      });

      // Sort by view count (already ordered by API, but ensure proper sorting)
      return videos.sort((a, b) => {
        const aViews = parseInt(a.views.replace(/[^0-9]/g, '')) || 0;
        const bViews = parseInt(b.views.replace(/[^0-9]/g, '')) || 0;
        return bViews - aViews;
      });

    } catch (error) {
      console.error('YouTube API error:', error.response?.data || error.message);
      return this.getMockVideos(searchTerms);
    }
  }

  formatViewCount(viewCount) {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M views';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K views';
    } else {
      return count + ' views';
    }
  }

  getMockVideos(searchTerms) {
    const searchQuery = Array.isArray(searchTerms) ? searchTerms.join(' ') : searchTerms;

    return [
      {
        title: `Learn ${searchQuery} - Complete Tutorial`,
        videoId: 'dQw4w9WgXcQ',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        views: '10.2M views',
        url: `https://youtube.com/watch?v=dQw4w9WgXcQ`,
        channelTitle: 'Educational Channel',
        description: `Comprehensive guide to understanding ${searchQuery}...`
      },
      {
        title: `${searchQuery} Explained Simply`,
        videoId: 'dQw4w9WgXcQ',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        views: '5.8M views',
        url: `https://youtube.com/watch?v=dQw4w9WgXcQ`,
        channelTitle: 'Study Helper',
        description: `Simple explanation of ${searchQuery} concepts...`
      },
      {
        title: `Advanced ${searchQuery} Concepts`,
        videoId: 'dQw4w9WgXcQ',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        views: '3.1M views',
        url: `https://youtube.com/watch?v=dQw4w9WgXcQ`,
        channelTitle: 'Academic Tutorials',
        description: `Deep dive into ${searchQuery}...`
      }
    ];
  }
}

module.exports = new YouTubeService();