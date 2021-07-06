const cache = require ('express-redis-cache')({host:'redis', port:6379});

exports.cacheByValue = (title = 'id', value, body = true, expire = 60) => [
    (req, res, next) => {
        res.express_redis_cache_name = `${title}-${req[body ? 'body' : 'params'][value]}`;
        next();
    },
    cache.route({expire})
]

exports.cache = (expire) => cache.route({expire});