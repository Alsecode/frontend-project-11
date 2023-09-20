import { downloadRSS, parseRSS, extractPosts } from './rss-functions';

export default async (state) => {
  const promices = state.validatedLinks.map((link) => downloadRSS(link));
  const rsses = await Promise.all(promices);
  const currentPostsInArray = rsses.map((rss) => parseRSS(rss))
    .map((parsedRSS) => extractPosts(parsedRSS));
  const currentPosts = currentPostsInArray.flat();

  const addedPosts = JSON.parse(JSON.stringify(state.posts));

  // eslint-disable-next-line max-len
  const newPosts = currentPosts.filter(({ link }) => (!addedPosts.find((existing) => existing.link === link)));

  state.posts.push(...newPosts);
};
