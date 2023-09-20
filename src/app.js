import i18next from 'i18next';
import * as yup from 'yup';
import resources from './locales/init';
import watch from './view';
import { downloadRSS, parseRSS, addRSS } from './rss-functions';
import updateRSS from './updater';

const autoUpdate = (state) => {
  updateRSS(state);
  setTimeout(autoUpdate, 5000, state);
};

export default async () => {
  const elements = {
    form: document.querySelector('#form'),
    input: document.querySelector('#inputRSS'),
    button: document.querySelector('#addButton'),
    feedback: document.querySelector('.feedback'),
    postsContainer: document.querySelector('#posts'),
    feedsContainer: document.querySelector('#feeds'),
    modalContainer: document.querySelector('#modal'),
  };

  const defaultLang = 'ru';

  const state = {
    form: {
      status: null,
      valid: false,
      error: '',
    },
    validatedLinks: [],
    feeds: [],
    posts: [],
    visitedPosts: [],
  };

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'form.errors.existingUrl' }),
    },
    string: {
      url: () => ({ key: 'form.errors.url' }),
    },
  });

  const getSchema = (validatedLinks) => yup.string().required().url().notOneOf(validatedLinks);

  const i18n = i18next.createInstance();
  await i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  });

  const watchedState = watch(elements, i18n, state);
  watchedState.form.status = 'filling';

  const cb = (e) => {
    const clickedLink = e.target.href;
    if (clickedLink) {
      watchedState.visitedPosts.push(clickedLink);
    }
  };

  elements.postsContainer.addEventListener('click', (e) => cb(e));
  elements.modalContainer.addEventListener('click', (e) => cb(e));

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentUrl = formData.get('inputRSS');

    const schema = getSchema(watchedState.validatedLinks);

    try {
      await schema.validate(currentUrl);
      watchedState.form.status = 'sending';
      const rss = await downloadRSS(currentUrl);
      const parsedRSS = parseRSS(rss);

      if (parsedRSS === null) {
        throw new Error('ParserError');
      }

      addRSS(parsedRSS, watchedState);

      watchedState.form.error = '';
      watchedState.form.valid = true;
      watchedState.validatedLinks.push(currentUrl);

      setTimeout(autoUpdate, 5000, watchedState);

      watchedState.form.status = 'filling';
      watchedState.form.valid = false;
    } catch (error) {
      switch (error.name) {
        // Ошибки валидации
        case 'ValidationError': {
          const message = error.errors.map((errorMessage) => errorMessage.key);
          watchedState.form.error = message;
          break;
        }
        // Если ресурс не содержит валидный RSS
        case 'Error': {
          watchedState.form.error = 'form.errors.notValidRss';
          watchedState.form.status = 'filling';
          break;
        }
        // Ошибки сети
        case 'TypeError': {
          watchedState.form.error = 'form.errors.network';
          watchedState.form.status = 'filling';
          break;
        }
        default:
          throw new Error(`Unknown error: ${error}`);
      }
    }
  });
};
