const { createProxyMiddleware } = require('http-proxy-middleware');

//setting up the server port
module.exports = function (app) {
    app.use('/auth/**', 
        createProxyMiddleware({ 
            target: 'https://final-594659887782.us-west1.run.app'
        })
    );
};
