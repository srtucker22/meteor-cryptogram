// configure first upperclass users
Meteor.startup(function () {
  var quotes = [
    "\"The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.\" - Helen Keller",
    "\"Start by doing what's necessary; then do what's possible; and suddenly you are doing the impossible.\" - Francis of Assisi",
    "\"I can't change the direction of the wind, but I can adjust my sails to always reach my destination.\" - Jimmy Dean",
    "\"Today I choose life. Every morning when I wake up I can choose joy, happiness, negativity, pain... To feel the freedom that comes from being able to continue to make mistakes and choices - today I choose to feel life, not to deny my humanity but embrace it.\" - Kevyn Aucoin",
    "\"I believe in pink. I believe that laughing is the best calorie burner. I believe in kissing, kissing a lot. I believe in being strong when everything seems to be going wrong. I believe that happy girls are the prettiest girls. I believe that tomorrow is another day and I believe in miracles.\" - Audrey Hepburn",
    "\"I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'\" - Muhammad Ali",
    "\"My mission in life is not merely to survive, but to thrive; and to do so with some passion, some compassion, some humor, and some style.\" - Maya Angelou",
    "\"Don't judge each day by the harvest you reap but by the seeds that you plant.\" - Robert Louis Stevenson",
    "\"When the sun is shining I can do anything; no mountain is too high, no trouble too difficult to overcome.\" - Wilma Rudolph",
    "\"When you are courting a nice girl an hour seems like a second. When you sit on a red-hot cinder a second seems like an hour. That's relativity.\" - Albert Einstein",
    "\"People who think they know everything are a great annoyance to those of us who do.\" - Isaac Asimov",
    "\"Any man who can drive safely while kissing a pretty girl is simply not giving the kiss the attention it deserves.\" - Albert Einstein"
  ];

  if (Cryptograms.find().fetch().length === 0) {
    _.each(quotes, function(quote){
      Cryptograms.insert({answer: quote});
    });

    // for(var i=0; i<10; i++){
    //   var quote = Meteor.call('getRandomQuote');
    //   Cryptograms.insert({answer: quote});
    // }
  }
});