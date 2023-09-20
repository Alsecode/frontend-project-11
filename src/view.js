import onChange from 'on-change';

export default (elements, i18n, state) => {
  const {
    feedback, input, form, button, postsContainer, feedsContainer,
  } = elements;

  const renderError = () => {
    if (state.form.error === '') {
      input.classList.remove('is-invalid');
      feedback.textContent = '';
    } else {
      feedback.classList.add('text-danger');
      input.classList.add('is-invalid');
      feedback.textContent = i18n.t(state.form.error);
    }
  };

  const clearForm = (value) => {
    if (value === true) {
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18n.t('form.success');
      form.reset();
      input.focus();
    }
  };

  const disableHandler = (value) => {
    if (value === 'filling') {
      button.disabled = false;
      input.readOnly = false;
    }
    if (value === 'sending') {
      button.disabled = true;
      input.readOnly = true;
    }
  };

  const buildContainerWithHeader = (title) => {
    const container = document.createElement('div');
    const headerBody = document.createElement('div');
    const headerText = document.createElement('h2');
    headerText.classList.add('h4', 'p-3');
    headerText.textContent = title;
    headerBody.append(headerText);

    container.append(headerBody);

    return container;
  };

  const renderFeeds = (feeds) => {
    feedsContainer.innerHTML = '';
    const container = buildContainerWithHeader(i18n.t('feeds'));

    const contentBody = document.createElement('div');
    const ul = document.createElement('ul');
    ul.classList.add('list-group');

    feeds.forEach((feed) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0');

      const h3 = document.createElement('h3');
      h3.classList.add('h6', 'm-0');
      h3.textContent = feed.title;

      const p = document.createElement('p');
      p.classList.add('small', 'm-0', 'text-secondary');
      p.textContent = feed.description;

      li.append(h3, p);
      ul.prepend(li);
    });

    contentBody.append(ul);

    container.append(contentBody);
    feedsContainer.append(container);
  };

  const renderPosts = () => {
    const { posts } = state;
    postsContainer.innerHTML = '';
    const container = buildContainerWithHeader(i18n.t('posts'));

    const contentBody = document.createElement('div');
    const ul = document.createElement('ul');
    ul.classList.add('list-group');

    posts.forEach((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'row', 'border-0', 'justify-content-between', 'align-items-start');

      const a = document.createElement('a');
      if (state.visitedPosts.includes(post.link)) {
        a.classList.add('fw-normal', 'text-secondary', 'col');
      } else {
        a.classList.add('fw-bold', 'col');
      }
      a.textContent = post.title;
      a.setAttribute('href', post.link);
      a.setAttribute('target', '_blank');

      const viewBtn = document.createElement('button');
      viewBtn.classList.add('col-auto', 'btn', 'btn-sm', 'btn-outline-primary', 'px-auto');
      viewBtn.textContent = i18n.t('buttons.view');
      viewBtn.type = 'button';
      viewBtn.dataset.bsToggle = 'modal';
      viewBtn.dataset.bsTarget = '#modal';

      document.querySelector('#closeBtn').textContent = i18n.t('buttons.modalWindow.close');
      document.querySelector('#readMoreBtn').textContent = i18n.t('buttons.modalWindow.readMore');

      viewBtn.addEventListener('click', () => {
        document.querySelector('#readMoreBtn').href = post.link;
        document.querySelector('.modal-title').textContent = post.title;
        document.querySelector('.modal-body').textContent = post.description;
      });

      li.append(a, viewBtn);
      ul.prepend(li);
    });

    contentBody.append(ul);

    container.append(contentBody);
    postsContainer.append(container);
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.status':
        disableHandler(value);
        break;
      case 'form.error':
        renderError();
        break;
      case 'form.valid':
        clearForm(value);
        break;
      case 'feeds':
        renderFeeds(value);
        break;
      case 'posts':
        renderPosts();
        break;
      case 'visitedPosts':
        renderPosts();
        break;
      default:
        break;
    }
  });

  return watchedState;
};
