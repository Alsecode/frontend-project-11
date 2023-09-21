import uniqueId from 'lodash/uniqueId.js';

export const downloadRSS = async (url) => {
  const response = await fetch(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);

  if (response.ok) {
    return response.json();
  }
  throw new Error('Network response was not ok.');
};

export const parseRSS = (rss) => {
  const parser = new DOMParser();

  const doc = parser.parseFromString(rss.contents, 'text/xml');

  return doc.querySelector('channel');
};

export const extractFeed = (channel) => {
  const titleEl = channel.querySelector('title');
  const descriptionEl = channel.querySelector('description');

  const title = titleEl.textContent;
  const description = descriptionEl.textContent;

  const feedId = uniqueId('feed');
  return { title, description, id: feedId };
};

export const extractPosts = (channel) => {
  const posts = Array.from(channel.querySelectorAll('item')).map((item) => {
    const postTitleEl = item.querySelector('title');
    const postTitle = postTitleEl.textContent;

    const postDescriptionEl = item.querySelector('description');
    const postDescription = postDescriptionEl.textContent;

    const linkEl = item.querySelector('link');
    const link = linkEl.textContent;

    const postId = uniqueId('post');

    const post = {
      title: postTitle,
      description: postDescription,
      link,
      id: postId,
    };

    return post;
  });

  return posts.reverse();
};

export const addRSS = (channel, state) => {
  const feed = extractFeed(channel);
  state.feeds.push(feed);

  const posts = extractPosts(channel)
    .map((post) => ({ ...post, feedId: feed.id }));
  state.posts.push(...posts);
};
