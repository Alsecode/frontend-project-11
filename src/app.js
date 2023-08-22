import i18next from 'i18next';
import * as yup from 'yup';
import resources from './locales/index';
import watch from './view';

export default async () => {
  const elements = {
    form: document.querySelector('#form'),
    input: document.querySelector('#inputRSS'),
    button: document.querySelector('#addButton'),
    feedback: document.querySelector('.feedback'),
  };

  const defaultLang = 'ru';

  const state = {
    form: {
      status: null,
      valid: false,
      error: '',
    },
    feeds: [],
    posts: [],
  };

  yup.setLocale({
    string: {
      url: () => ({ key: 'form.errors.url' }),
    },
  });

  const i18n = i18next.createInstance();
  await i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  });

  const watchedState = watch(elements, i18n, state);
  watchedState.form.status = 'filling';

  const schema = yup.object({
    url: yup.string().url(),
  });

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentUrl = formData.get('inputRSS');

    if (watchedState.feeds.map(({ url }) => url).includes(currentUrl)) {
      watchedState.form.error = 'form.errors.existingUrl';
      return;
    }

    try {
      await schema.validate({ url: currentUrl });
      watchedState.form.status = 'sending';
      watchedState.form.error = '';
      watchedState.form.valid = true;
      watchedState.feeds.push({ url: currentUrl });
    } catch (err) {
      const message = err.errors.map((errorMessage) => errorMessage.key);
      watchedState.form.error = message;
    }
    watchedState.form.status = 'filling';
    watchedState.form.valid = false;
  });
};
