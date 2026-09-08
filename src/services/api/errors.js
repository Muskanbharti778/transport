export const normalizeApiError = error => {
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;
    const message =
      data?.message || data?.error || 'Something went wrong. Please try again.';

    return {
      status,
      message,
      data,
      type: getErrorType(status),
    };
  }

  if (error?.code === 'ECONNABORTED') {
    return {
      status: null,
      message: 'The request timed out. Please check your connection.',
      data: null,
      type: 'timeout',
    };
  }

  if (error?.request) {
    return {
      status: null,
      message: 'Unable to connect. Please check your internet connection.',
      data: null,
      type: 'network',
    };
  }

  return {
    status: null,
    message: error?.message || 'Unexpected application error.',
    data: null,
    type: 'unknown',
  };
};

const getErrorType = status => {
  if (status === 400 || status === 422) {
    return 'validation';
  }
  if (status === 401) {
    return 'authentication';
  }
  if (status === 403) {
    return 'authorization';
  }
  if (status === 404) {
    return 'not_found';
  }
  if (status >= 500) {
    return 'server';
  }
  return 'http';
};
