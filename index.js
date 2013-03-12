module.exports = process.env.TEST_COV ? require('./lib-cov/ajax.js') : require('./lib/ajax.js');
