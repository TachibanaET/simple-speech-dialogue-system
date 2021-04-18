const express = require("express");
const http = require('http');
const session = require("express-session");
const WavEncoder = require('wav-encoder');
const fs = require('fs');

let bodyParser = require('body-parser');

const app = express();

const appServerInfo = process.env.app_server;
console.log(`rec server info : ${appServerInfo}`)

app.set("trust proxy", true);

app.use(bodyParser.json({
  limit: '100mb',
  extended: true
}));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,POST,HEAD,OPTIONS");
  next();
});

app.use(
  session({
    secret: "secret-sign",
    resave: false,
    saveUninitialized: false
  })
);

app.post('*/send_audio_data', (req, res, next) => {
  console.log('send audio data');
  var self_res = res;
  console.log(req.body.start_time_stamp);
  const audioData = req.body.audio_data;
  
  const newAudioData = convAudioData(audioData, 48000);

  WavEncoder.encode(newAudioData).then((buffer) => {
    let base64String = Buffer.from(buffer).toString('base64');
    // console.log(base64String);
    const options = {
      host: appServerInfo,
      port: 80,
      path: '/send_audio_data',
      method: 'POST',
      headers: {
        'Content-Type':'application/json'
      }
    };
    var req2 = http.request(options, (res)=>{
      res.setEncoding(`utf8`);
      console.log('headers: ', res.headers);
      let raw_data = '';
      res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
          raw_data += chunk;
      });
      res.on('end', () => {
          console.log('No more data in response.');
          self_res.send(raw_data);
      });
    } );

    console.log('req2', req2);
    req2.on('error', (e) => {
        console.log(`Got error: ${e.message}`);
        self_res.send(`fail`);
    });

    req2.write(JSON.stringify({
      index: 0,
      audio_data: base64String
    }));
    req2.end();
  });
  
});

app.post('*/get_system_text', (req, res, next) => {
  console.log('get system text');
  var self_res = res;
  console.log(req.body)

  const options = {
    host: '172.21.65.74',
    port: 80,
    path: '/get_system_text',
    method: 'POST',
    headers: {
      'Content-Type':'application/json'
    }
  };
  var req2 = http.request(options, (res)=>{
    res.setEncoding(`utf8`);
    console.log('headers: ', res.headers);
    let raw_data = '';
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
        raw_data += chunk;
    });
    res.on('end', () => {
        console.log('No more data in response.');
        self_res.send(raw_data);
    });
  } );

  console.log('req2', req2);
  req2.on('error', (e) => {
      console.log(`Got error: ${e.message}`);
      self_res.send(`fail`);
  });

  req2.write(JSON.stringify(req.body));

  req2.end();
  
});

app.use('/', express.static('websource'));

const appServer = app.listen(80, () => {
  const host = appServer.address().address;
  const port = appServer.address().port;
  console.log('webserver startup, listening at http://%s:%s', host, port);
});
appServer.timeout = 1000 * 60 * 5;

// jsonの要素数
const Objlen = (data) => {
    return Object.keys(data).length;
}

const convAudioData = (audioData, sampleRate = 48000) => {
  var mergeBuffers = (data) => {
    var sampleLength = 0;
    for(var i = 0; i < data.length; i++) {
      sampleLength += Objlen(data[i]);
    }

    var samples = new Float32Array(sampleLength);
    var sampleIndex = 0;

    for(var i = 0; i < data.length; i++) {
      for(var j = 0; j < Objlen(data[i]); j++) {
        samples[sampleIndex] = data[i][j]
        sampleIndex++;
      }
    }
    return samples;
  }

  var newAudioData = {
    sampleRate: sampleRate,
    channelData: [mergeBuffers(audioData)]
  };

  return newAudioData;
}