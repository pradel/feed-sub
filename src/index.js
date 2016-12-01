import EventEmitter from 'events';
import request from 'request';
import FeedMe from 'feedme';

class FeedSub extends EventEmitter {
  constructor(urls, options = {}) {
    super();
    this.urls = urls;
    this.options = Object.assign({
      interval: 10,
      Promise,
    }, options);
    this.Promise = this.options.Promise;
    this.cache = [];
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
   * @description Start the requests
   */
  makeRequests() {
    const promises = this.urls.map(this.checkUpdate.bind(this));
    this.Promise.all(promises).catch(this.error.bind(this));
  }

  /**
   * @description Check if there is an update on the feed
   */
  checkUpdate(url, index) {
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
      if (this.cache[this.urls[index]]) {
        // If feed is more recent
        if (feed.updated > this.cache[this.urls[index]].updated) {
          this.cache[this.urls[index]] = { updated: feed.updated };
          this.emit('update', feed);
        }
      } else {
        this.cache[this.urls[index]] = { updated: feed.updated };
      }
    }).catch(this.error.bind(this));
  }

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