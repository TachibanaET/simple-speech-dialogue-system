'use strict';

import * as post from './post.js';
import * as audio from './audio.js';

const audioClass = new audio.Audio();
const elemChatContainer = document.getElementById('chat-container');
const elemStartButton = document.getElementById('asr-start-button');
const elemStopButton = document.getElementById('asr-stop-button');

const addChat = (context, type) => {
  const htmlSource = `
    <div class="row m-3">
      <div class="${type === 'user' ? 'offset-2' : ''} col-10 bg-light rounded-3">
        <p>${context}</p>
      </div>
    </div>
  `
  elemChatContainer.insertAdjacentHTML('beforeend', htmlSource);
}

const changeButtonsStatus = () => {
  elemStartButton.disabled = !elemStartButton.disabled;
  elemStopButton.disabled = !elemStopButton.disabled;
}

const startEvent = () => {
  console.log('start event');
  changeButtonsStatus();
  audioClass.startRec();
}

const stopEvent = () => {
  console.log('stop event');
  changeButtonsStatus();
  const audioData = audioClass.stopRec();
  console.log(audioData);
  const jsonObj = {
    index : 0,
    // start_time_stamp : 0,
    audio_data : audioData
  }
  post.postTo('/send_audio_data', jsonObj, userTextCallBack)
}

const userTextCallBack = (json) => {
  console.log(json);
  const speech_text = json['speech_text'];
  addChat(speech_text, 'user');
  const jsonObj = {
    index : 0,
    // start_time_stamp : 0,
    user_text : speech_text
  }
  post.postTo('/get_system_text', jsonObj, systemTextCallBack)
}

const systemTextCallBack = (json) => {
  console.log(json);
  const systemText = json['system_text'];
  addChat(systemText, 'system');
}

window.onload = () => {

  elemStartButton.addEventListener('click', startEvent)
  elemStopButton.addEventListener('click', stopEvent)

  var constraints = {
    video: false,
    audio: true
  }
  audioClass.getStream(constraints);
};
