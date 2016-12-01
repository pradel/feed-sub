# feed-sub

Tracks rss/atom feeds and get notified when they are updated.

[![Build Status](https://travis-ci.org/pradel/feed-sub.svg?branch=master)](https://travis-ci.org/pradel/feed-sub)

## Install

`npm install --save feed-sub`

`yarn add feed-sub`

## Usage

```javascript
import FeedSub from 'feed-sub';

const feed = new FeedSub([
  'https://github.com/facebook/react/tags.atom',
  'https://github.com/facebook/jest/tags.atom',
]);

// An item was updated
feed.on('update', (data) => {
  console.log(data);
});

// handle stream error
feed.on('error', (err) => {
  // An error occur
  console.log(err);
});

feed.start();
```

## Api

###`const feed = new FeedSub(urls, [options])`
Create a new `FeedSub` instance.
* `urls` - array  - Array of urls.
* `options.interval` - number - Number of seconds between two checks.

###`feed.start()`
Start to stream.

###`feed.stop()`
Stop the stream.
