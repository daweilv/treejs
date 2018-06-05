export default function(_options) {
    let defaultOptions = {
        method: 'GET',
        url: '',
        async: true,
        success: null,
        failed: null,
        'Content-Type': 'application/json; charset=utf-8',
    };
    let options = Object.assign(defaultOptions, _options);
    let xhq = new XMLHttpRequest();
    let params = [];
    for (let key in options.data) {
        if (options.data.hasOwnProperty(key)) {
            params.push(key + '=' + options.data[key]);
        }
    }
    let postData = params.join('&');

    if (options.method.toUpperCase() === 'POST') {
        xhq.open(options.method, options.url, options.async);
        xhq.setRequestHeader('Content-Type', options['Content-Type']);
        xhq.send(postData);
    } else if (options.method.toUpperCase() === 'GET') {
        let url = options.url;
        if (postData) {
            if (url.indexOf('?') !== -1) {
                url += '&' + postData;
            } else {
                url += '?' + postData;
            }
        }
        xhq.open(options.method, url, options.async);
        xhq.setRequestHeader('Content-Type', options['Content-Type']);
        xhq.send(null);
    }
    xhq.onreadystatechange = function() {
        if (xhq.readyState === 4 && xhq.status === 200) {
            let res = xhq.responseText;
            if (options['Content-Type'] === defaultOptions['Content-Type']) {
                res = JSON.parse(res);
            }
            options.success && options.success(res);
        } else {
            options.failed && options.failed(xhq.status);
        }
    };
}
