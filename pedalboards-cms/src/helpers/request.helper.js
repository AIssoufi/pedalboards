// Default Handlers

const handleResponse = response => response.json();

const handleError = (response) => {
  console.log({ errorMessage: response });
};

// Default header

const header = {
  'Content-Type': 'application/json; charset=utf-8'
};

//

const get = url => fetch(url)
  .then(handleResponse)
  .catch(handleError);

const post = (url, body = {}) => fetch(
  url,
  {
    method: 'POST',
    header,
    body
  }
)
  .then(handleResponse)
  .catch(handleError);

const put = (url, body = {}) => fetch(
  url,
  {
    method: 'PUT',
    header,
    body
  }
)
  .then(handleResponse)
  .catch(handleError);

const remove = url => fetch(
  url,
  { method: 'DELETE' }
)
  .then(handleResponse)
  .catch(handleError);

export {
  get,
  post,
  put,
  remove
};
