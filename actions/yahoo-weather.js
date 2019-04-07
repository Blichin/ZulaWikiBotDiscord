"use strict";

var https = require('https');

var YahooWeather = function(){}

/*
{
 "query": {
  "count": 1,
  "created": "2016-01-10T08:45:33Z",
  "lang": "en-us",
  "results": {
   "channel": {
    "title": "Yahoo! Weather - Colorado Springs, CO",
    "link": "http://us.rd.yahoo.com/dailynews/rss/weather/Colorado_Springs__CO/*http://weather.yahoo.com/forecast/USCO0078_f.html",
    "description": "Yahoo! Weather for Colorado Springs, CO",
    "language": "en-us",
    "lastBuildDate": "Sun, 10 Jan 2016 12:54 am MST",
    "ttl": "60",
    "location": {
     "city": "Colorado Springs",
     "country": "United States",
     "region": "CO"
    },
    "units": {
     "distance": "mi",
     "pressure": "in",
     "speed": "mph",
     "temperature": "F"
    },
    "wind": {
     "chill": "4",
     "direction": "360",
     "speed": "6"
    },
    "atmosphere": {
     "humidity": "86",
     "pressure": "30",
     "rising": "2",
     "visibility": "4"
    },
    "astronomy": {
     "sunrise": "7:16 am",
     "sunset": "4:56 pm"
    },
    "image": {
     "title": "Yahoo! Weather",
     "width": "142",
     "height": "18",
     "link": "http://weather.yahoo.com",
     "url": "http://l.yimg.com/a/i/brand/purplelogo//uh/us/news-wea.gif"
    },
    "item": {
     "title": "Conditions for Colorado Springs, CO at 12:54 am MST",
     "lat": "38.87",
     "long": "-104.76",
     "link": "http://us.rd.yahoo.com/dailynews/rss/weather/Colorado_Springs__CO/*http://weather.yahoo.com/forecast/USCO0078_f.html",
     "pubDate": "Sun, 10 Jan 2016 12:54 am MST",
     "condition": {
      "code": "29",
      "date": "Sun, 10 Jan 2016 12:54 am MST",
      "temp": "13",
      "text": "Partly Cloudy"
     },
     "description": "\n<img src=\"http://l.yimg.com/a/i/us/we/52/29.gif\"/><br />\n<b>Current Conditions:</b><br />\nPartly Cloudy, 13 F<BR />\n<BR /><b>Forecast:</b><BR />\nSat - Mostly Clear. High: 22 Low: 7<br />\nSun - Sunny. High: 35 Low: 9<br />\nMon - Sunny. High: 41 Low: 15<br />\nTue - Sunny. High: 42 Low: 19<br />\nWed - Sunny. High: 43 Low: 21<br />\n<br />\n<a href=\"http://us.rd.yahoo.com/dailynews/rss/weather/Colorado_Springs__CO/*http://weather.yahoo.com/forecast/USCO0078_f.html\">Full Forecast at Yahoo! Weather</a><BR/><BR/>\n(provided by <a href=\"http://www.weather.com\" >The Weather Channel</a>)<br/>\n",
     "forecast": [
      {
       "code": "33",
       "date": "9 Jan 2016",
       "day": "Sat",
       "high": "22",
       "low": "7",
       "text": "Mostly Clear"
      },
      {
       "code": "32",
       "date": "10 Jan 2016",
       "day": "Sun",
       "high": "35",
       "low": "9",
       "text": "Sunny"
      },
      {
       "code": "32",
       "date": "11 Jan 2016",
       "day": "Mon",
       "high": "41",
       "low": "15",
       "text": "Sunny"
      },
      {
       "code": "32",
       "date": "12 Jan 2016",
       "day": "Tue",
       "high": "42",
       "low": "19",
       "text": "Sunny"
      },
      {
       "code": "32",
       "date": "13 Jan 2016",
       "day": "Wed",
       "high": "43",
       "low": "21",
       "text": "Sunny"
      }
     ],
     "guid": {
      "isPermaLink": "false",
      "content": "USCO0078_2016_01_13_7_00_MST"
     }
    }
   }
  }
 }
}

input: location (for example "gainesville, fl")
output: full yahoo weather info in json format (see above)
*/
var getWeather = function (location) {

	return new Promise( function(response,reject){
	// select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="nome, ak")
	// 	var locationQuery = escape("select item from weather.forecast where woeid in (select woeid from geo.places where text='" + location + "') and u='f'");
	// 	var locationUrl = "https://query.yahooapis.com/v1/public/yql?q=" + locationQuery + "&format=json";

	// var locationUrl = 'https://query.yahooapis.com/v1/public/yql?q=select * from geo.places where text="colorado springs, co"&format=json';

		var locationUrl = 'https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="'+location+'")&format=json&env=store://datatables.org/alltableswithkeys';
	// var locationUrl = 'https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="colorado springs, co")&format=json';

		https.get(locationUrl, function (res) {
			res.setEncoding('binary');

			var resData = "";
			res.on('data', function (chunk) {
				return resData += chunk;
			});
			res.on('end', function () {
				var result = JSON.parse(resData);
				response( result );
			});
		});
	
	});

	
}

// input: location (for example "gainesville, fl")
// output: full yahoo weather info in json format (see above)
YahooWeather.prototype.getFullWeather = function (location) {
	return new Promise( function(response,reject){
		getWeather(location).then(function(ans){response(ans);});
	});
}

// input: location (for example "gainesville, fl")
// output: simplified yahoo weather info in json format
YahooWeather.prototype.getSimpleWeather = function (location) {
	return new Promise( function(response,reject){
		getWeather(location).then( function(yw){
			console.log('yw: ' + yw);
			var ans = {};
			try {
				// try to shorten the calls
				var gen = yw.query.results.channel;
				var info = yw.query.results.channel.item;
		
				ans.date = info.condition.date;
				ans.location = {lat: info.lat, long: info.long};
				ans.weather = {	temperature: {value: info.condition.temp, units: gen.units.temperature},
								wind: {value: gen.wind.speed, units: gen.units.speed},
								windChill: {value: gen.wind.chill, units: gen.units.temperature},
								condition: info.condition.text
							  };
				ans.forecast = info.forecast;
				console.log('ans: '+ans);
				response(ans);
			} catch(err){
				console.log(err);
			}
		});
	});
}

module.exports = new YahooWeather();
