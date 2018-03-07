const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const request = require('sync-request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true }));

const server = app.listen(process.env.PORT || 8080, () => {
	console.log('server listening.');
});

app.get('/',(req,res) => {
	handleQueries(req.query,res);
});

app.post('/',(req,res) => {
	handleQueries(req.body,res);
});

// 大阪の天気を取得し,配列で返す
function getOsakaForecast() {
	const url = 'http://weather.livedoor.com/forecast/webservice/json/v1?city=270000';
	const options = {
		json: true,
	};
	let forecast = [];
	// JSONデータの取得
	let response = request('GET',url,options);
	let resToJson = JSON.parse(response.getBody('utf8'));

	// 場所
	forecast.push(resToJson['title']);
	// 今日の予報文
	forecast.push(resToJson['description']['text']);
	// 今日の概況
	forecast.push(resToJson['forecasts'][0]['telop']);
	// 明日の概況
	forecast.push(resToJson['forecasts'][1]['telop']);
	// 今日の最高気温
	forecast.push(resToJson['forecasts'][0]['temperature']['max']['celsius'])
	return forecast;
}

function handleQueries(q,res) {
	let osaka = getOsakaForecast();
	console.log(osaka[4]);
	if (osaka[4]) {
		let data = {
			'response_type': 'in_channel',
			'text': osaka[0]+'の天気をお知らせします。今日の天気は'+osaka[2]+'になるでしょう。最高気温は'+osaka[4]+'度の見込みです。',
			'attachments': [
				{
					'text' : osaka[1],
				}
			]
		};
	res.json(data);
	} else {
		let data = {
			'response_type': 'in_channel',
			'text': osaka[0]+'の天気をお知らせします。今日の天気は'+osaka[2]+'になるでしょう。',
			'attachments': [
				{
					'text' : osaka[1],
				}
			]
		};
		res.json(data);
	}
}