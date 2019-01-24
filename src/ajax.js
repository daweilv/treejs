export default function(_options) {
  const defaultOptions = {
    method: 'GET',
    url: '',
    async: true,
    success: null,
    failed: null,
    'Content-Type': 'application/json; charset=utf-8',
  };
  const options = Object.assign(defaultOptions, _options);
  const xhr = new XMLHttpRequest();

  const postData = Object.entries(options.data)
    .reduce((acc, [key, value]) => {
      acc.push(`${key}=${value}`);
      return acc;
    }, [])
    .join('&');

  if (options.method.toUpperCase() === 'POST') {
    xhr.open(options.method, options.url, options.async);
    xhr.setRequestHeader('Content-Type', options['Content-Type']);
    xhr.send(postData);
  } else if (options.method.toUpperCase() === 'GET') {
    let {url} = options;
    if (postData) {
      if (url.indexOf('?') !== -1) {
        url += `&${postData}`;
      } else {
        url += `&${postData}`;
      }
    }
    xhr.open(options.method, url, options.async);
    xhr.setRequestHeader('Content-Type', options['Content-Type']);
    xhr.send(null);
  }
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      let res = xhr.responseText;
      if (options['Content-Type'] === defaultOptions['Content-Type']) {
        res = JSON.parse(res);
      }
      options.success && options.success(res);
    } else {
      options.failed && options.failed(xhr.status);
    }
  };
}
