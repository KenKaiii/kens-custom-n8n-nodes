```javascript
// Real-world web scraping test - scrape Hacker News front page
const url = 'https://news.ycombinator.com';

try {
  console.log('Fetching Hacker News...');
  const response = await axios.get(url);
  
  // Load HTML into cheerio
  const $ = cheerio.load(response.data);
  
  const stories = [];
  
  // Extract top 10 stories
  $('.athing').slice(0, 10).each((index, element) => {
    const titleElement = $(element).find('.titleline > a');
    const scoreElement = $(element).next().find('.score');
    const commentsElement = $(element).next().find('a').last();
    
    stories.push({
      rank: index + 1,
      title: titleElement.text(),
      url: titleElement.attr('href'),
      points: scoreElement.text() || '0 points',
      comments: commentsElement.text() || '0 comments',
      scraped_at: dayjs().format()
    });
  });
  
  return [{
    json: {
      success: true,
      source: 'Hacker News',
      total_stories: stories.length,
      scraped_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      stories: stories
    }
  }];
  
} catch (error) {
  return [{
    json: {
      success: false,
      error: error.message,
      tested_libraries: ['axios', 'cheerio', 'dayjs']
    }
  }];
}
```