const mongoose =  require('mongoose');
const redis = require('redis');
const { promisify } = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = promisify(client.hget);
const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function(options = {}) {
    this.cacheKey = JSON.stringify(options.key || '');
    this.useCache = true;
    return this;
}

mongoose.Query.prototype.exec = async function() {
    if (!this.useCache) {
        return await exec.apply(this, arguments);
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    const cachedRes = await client.hget(this.cacheKey, key);
    if (cachedRes) {
        const data = JSON.parse(cachedRes);
        return Array.isArray(data) ? data.map(item => new this.model(item)) : new this.model(data);

    }
    const res  = await exec.apply(this, arguments);
    client.hset(this.cacheKey, key, JSON.stringify(res));
    return res;
}

module.exports = {
    clearCache(key) {
        console.log(key)
        client.del(JSON.stringify(key));
    }
}