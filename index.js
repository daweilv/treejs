if (process.env.NODE_ENV === 'production') {
    module.exports = require('./dist/tree.min.js');
} else {
    module.exports = require('./dist/tree.js');
}
