const FeedSub = require('../lib').default;

const sub = new FeedSub([
  'https://github.com/facebook/react/tags.atom',
  'https://github.com/facebook/jest/tags.atom',
  'https://github.com/meteor/meteor/tags.atom',
]);

sub.start();

sub.on('update', (data) => {
  console.log('update => ', data);
});

sub.on('error', (err) => {
  console.error(err.message);
  console.error(err.url);
});
