const http = require('http');
const cheerio  = require('cheerio');


const request = require('request');
const fileSystem = require('fs');
let lineReader = require('readline');

const delayRequest = 0.2 * 1000; // 0.2 seconds in miliseconds

/*
const getLoginDetails = () => {     // bunda 301 aldım dolayısıyla redirection islemi yapılmasi gerekiyor bunun nasil yapilacagina bakmak lazim
    return http.get({               // ve tabii https nasil gonderilebilecegini
        hostname: 'twitter.com',
        port: 80,
        path: '/CMYLMZ/status/1109092596670976001'
    }, (response) => {
        console.log(`STATUS: ${response.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
        response.setEncoding('UTF-8');
        
        if(response.statusCode === 301){
            console.log(`Response: ${JSON.stringify(response.headers.location)}`);
        }
        response.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        response.on('end', () => {
            console.log('No more data in response');
        })
    }).on('error', (error) => {
        console.log(`Problem with request: ${error.message}`);
    });
}
getLoginDetails();
*/

const extractTweet = (html) => {
    let $ = cheerio.load(html);

    let tweet = $(".TweetTextSize.TweetTextSize--jumbo.js-tweet-text.tweet-text");
    let username = $(".username.u-dir.u-textTruncate").first().children("b");
    //let date = $("div .client-and-actions > span .metadata > span");
    let date = $("div .client-and-actions").children("span");
    let location = date.children("span .permalink-tweet-geo-text").children("a");
    //$("div .client-and-actions > span .metadata > span .permalink-tweet-geo-text > a");

    tweet = tweet.text();
    username = username.text();
    date = date.children("span").first().text();
    location = location.text();

    return {
        tweet,
        username,
        date,
        location
    };    
}

const downloadTweet = (tweetId) => request('https://www.twitter.com/CMYLMZ/status/' + tweetId, {
}, (error, response, body) => {
    if(error){
        console.log(`Problem with request: ${error.message}`);
        return;
    }
    console.log("Tweet has been downloaded !");

    extractedTweet = extractTweet(body);

    fileSystem.appendFileSync('./2016-panamapapers.txt', JSON.stringify({
        id: tweetId,
        tweet: extractedTweet.tweet,
        username: extractedTweet.username,
        date: extractedTweet.date,
        location: extractedTweet.location        
    }, null, 2) + ",\n");

    console.log("Written to a file !")


});



fileSystem.readFile("./2016-panamapapers.ids", "utf8",(err, data) => {
    if(err){
        console.log("Error has been occurred: " + err.message);
        return;
    }
    
    data = data.split("\n");

    for(var i = 0; i < data.length/8; i++){
        setTimeout((i) => {
            console.log(i);
            let tweetId = data[i]    
            downloadTweet(tweetId);
        }, delayRequest * i, i);        
    }
});

