import uniqueId from 'lodash/uniqueId.js';

export const downloadRSS = async (url) => {
  const response = await fetch(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`);

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

const extractFeed = (channel) => {
  const titleEl = channel.querySelector('title');
  const descriptionEl = channel.querySelector('description');

  const title = titleEl.textContent;
  const description = descriptionEl.textContent;

  const feedId = uniqueId('feed');
  return { title, description, id: feedId };
};

const extractPosts = (channel, feedId) => {
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
      feedId,
      id: postId,
    };

    return post;
  });

  return posts.reverse();
};

export const addRSS = (channel, state) => {
  const feed = extractFeed(channel);
  state.feeds.push(feed);

  const posts = extractPosts(channel, feed.id);
  state.posts.push(...posts);
};
