import EventEmitter from 'events';
import request from 'request';
import FeedMe from 'feedme';

class FeedSub extends EventEmitter {
  constructor(urls, options = {}) {
    super();
    this.urls = urls;
    this.options = Object.assign({
      interval: 60,
      Promise,
    }, options);
    this.Promise = this.options.Promise;
    this.cache = {};
  }

  /**
   * @description Start the stream
   */
  start() {
    this.makeRequests();
    this.intervalId = setInterval(this.makeRequests.bind(this), this.options.interval * 1000);
  }

  /**
   * @description Stop the stream
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      delete this.intervalId;
    }
  }

  /**
   * @description Stop the stream
   * @param {function} func Function called before sending the requests
   */
  getUrls(func) {
    this.getUrlsFunc = func;
  }

  /**
   * @description Start the requests
   */
  makeRequests() {
    this.Promise.resolve().then(() => {
      if (this.getUrlsFunc) {
        return this.getUrlsFunc();
      }
      return this.urls;
    }).then((urls) => {
      this.urls = urls;
      const promises = this.urls.map(this.checkUpdate.bind(this));
      return this.Promise.all(promises);
    })
    .catch(this.error.bind(this));
  }

  /**
   * @description Check if there is an update on the feed
   * @param {string} url Url to check
   */
  checkUpdate(url) {
    return this.request(url).then((res) => {
      let feed;
      try {
        const parser = new FeedMe(true);
        parser.write(res);
        feed = parser.done();
      } catch (err) {
        err.url = url;
        this.error(err);
        return;
      }
      feed.updated = new Date(feed.updated).getTime();
      // If date is in cache
      if (this.cache[url]) {
        // If feed is more recent
        if (feed.updated > this.cache[url].updated) {
          this.cache[url] = { updated: feed.updated };
          this.emit('update', feed);
        }
      } else {
        this.cache[url] = { updated: feed.updated };
      }
    }).catch(this.error.bind(this));
  }

  /**
   * @private
   * @description Make a promisified request
   * @param {string} url
   */
  request(url) {
    return new this.Promise((resolve, reject) => {
      request(url, (err, res, body) => {
        if (err) {
          reject({ ...err, url });
        } else if (res.statusCode !== 200) {
          const error = new Error(`Error during request statusCode: ${res.statusCode}`);
          error.url = url;
          error.statusCode = res.statusCode;
          error.body = body;
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  error(err) {
    this.emit('error', err);
  }
}

export default FeedSub;
