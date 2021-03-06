// requirements
var Twitter = require('twitter');
var fs = require('fs');
var emojis = require('emojis-list');
var cities = require('./data/cities.json');
var basename = require('twemoji-basename')
var svg_to_png = require('svg-to-png');

// connect to twitter
var keys = require('../twitter.json');
var client = new Twitter({
    consumer_key: keys.consumerKey,
    consumer_secret: keys.consumerSecret,
    access_token_key: keys.accessKey,
    access_token_secret: keys.accessSecret
});

// randomise elements
var randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
var randomCity = cities.cities[Math.floor(Math.random() * cities.cities.length)];
randomCity.city = decodeURIComponent(randomCity.city);

// get twemoji svg file
var emojiPath = './node_modules/twemoji/2/svg/' + basename(randomEmoji) + '.svg';

// convert svg to png for use in canvas
svg_to_png.convert(emojiPath, '.emojis', {
    'defaultWidth': '400px',
    'defaultHeight': '400px'
}).then(function(){
    // create canvas
    var Canvas = require('canvas'),
        Image = Canvas.Image,
        Font = Canvas.Font,
        canvas = new Canvas(1200, 673),
        ctx = canvas.getContext('2d');

    // fill background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 1200, 673);

    // load font
    var americanTypewriter = new Font('AmericanTypewriter', './src/fonts/american-typewriter.ttf');
    ctx.addFont(americanTypewriter);

    // draw 'I'
    ctx.fillStyle = '#333';
    ctx.font = '490px AmericanTypewriter';
    ctx.fillText('I', 280, 430);

    // draw city name
    var citySize = 200;

    while (citySize > 0) {
        ctx.font = citySize + 'px AmericanTypewriter';
        width = ctx.measureText(randomCity.city.toUpperCase(), 280, 590).width;

        if (width < 640) {
            ctx.fillText(randomCity.city.toUpperCase(), 280, 590);
            break;
        } else {
            citySize -= 1;
        }
    }

    // Draw emoji
    fs.readFile('./.emojis/' + basename(randomEmoji) + '.png', function(err, emoji){
        if (err) throw err;
        img = new Image;
        img.src = emoji;
        ctx.drawImage(img, 550, 85, 360, 360);

        // prep canvas for upload
        var canvasToBuffer = canvas.toBuffer();

        // make tweet
        client.post('media/upload', {media: canvasToBuffer}, function(error, media, response) {
            if (error) throw error;
            var status = {
                status:  'I ' + randomEmoji + ' ' + randomCity.city,
                media_ids: media.media_id_string,
                lat: randomCity.lat,
                long: randomCity.lon
            };
            client.post('statuses/update', status,  function(error, tweet, response) {
                if(error) throw error;
                console.log('tweet succesful');
            });
        });
    });
});

