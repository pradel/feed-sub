import FeedSub from '../src';

describe('FeedSub', () => {
  it('should be a class', () => {
    expect(typeof FeedSub).toBe('function');
  });

  describe('#constructor', () => {
    it('should have default options', () => {
      const feed = new FeedSub();
      expect(feed.options).toBeTruthy();
      expect(feed.options.interval).toEqual(60);
      expect(feed.options.Promise).toEqual(Promise);
      expect(feed.Promise).toEqual(Promise);
      expect(feed.cache).toEqual([]);
    });

    it('should overwrite default options', () => {
      const feed = new FeedSub([], { interval: 5 });
      expect(feed.options).toBeTruthy();
      expect(feed.options.interval).toEqual(5);
    });
  });

  describe('#start', () => {
    it('should call makeRequests', () => {
      const feed = new FeedSub();
      feed.makeRequests = jest.fn();
      feed.start();
      feed.stop();
      expect(feed.makeRequests.mock.calls.length).toEqual(1);
    });

    it('should start setInterval', () => {
      const feed = new FeedSub([]);
      feed.start();
      expect(feed.intervalId).toBeTruthy();
      feed.stop();
    });
  });

  describe('#stop', () => {
    it('should stop the stream', () => {
      const feed = new FeedSub([]);
      feed.start();
      expect(feed.intervalId).toBeTruthy();
      feed.stop();
      expect(feed.intervalId).not.toBeTruthy();
    });

    it('should do nothing if there is no stream', () => {
      const feed = new FeedSub();
      feed.stop();
      expect(feed.intervalId).not.toBeTruthy();
    });
  });

  describe('#error', () => {
    it('should emit error event', (done) => {
      const feed = new FeedSub();
      feed.on('error', (err) => {
        expect(err.message).toEqual('message');
        done();
      });
      feed.error(new Error('message'));
    });
  });
});
