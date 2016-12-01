const FeedSub = require('../lib').default;

const sub = new FeedSub([], { interval: 5 });

sub.getUrls(() => {
  // Logic
  console.log('get urls');
  return [
    'https://github.com/facebook/react/tags.atom',
    'https://github.com/facebook/jest/tags.atom',
    'https://github.com/meteor/meteor/tags.atom',
    'https://github.com/pradel/feed-sub/tags.atom',
  ];
});

sub.on('update', (data) => {
  console.log('update => ', data);
});

sub.on('error', (err) => {
  console.error(err.message);
  console.error(err.url);
});

sub.start();
