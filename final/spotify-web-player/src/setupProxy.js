const { createProxyMiddleware } = require('http-proxy-middleware');

//setting up the server port
module.exports = function (app) {
    app.use('/auth/**', 
        createProxyMiddleware({ 
            target: 'http://localhost:5000'
        })
    );
};
