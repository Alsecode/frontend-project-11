import onChange from 'on-change';

export default (elements, i18n, state) => {
  const {
    feedback, input, form, button,
  } = elements;

  const handleError = () => {
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

  const statusHandler = (value) => {
    if (value === 'filling') {
      button.disabled = false;
      input.readOnly = false;
    }
    if (value === 'sending') {
      button.disabled = true;
      input.readOnly = true;
    }
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.status':
        statusHandler(value);
        break;
      case 'form.error':
        handleError();
        break;
      case 'form.valid':
        clearForm(value);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
