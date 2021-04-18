'use strict';
import * as post from './post.js';

export class Audio {
  constructor() {
    const audioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new audioContext();
    this.buffer = 2048;
    this.processor = this.audioCtx.createScriptProcessor(this.buffer, 2, 1);
    this.audioData = [];
  }

  getStream(constraints) {
    const mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
      getUserMedia: function(c) {
        return new Promise(function (y, n) {
          (navigator.mozGetUserMedia ||
            navigator.webkitGetUserMedia).call(navigator, c, y, n);
        });
      }
    } : null);
    
    if (!mediaDevices) {
      console.log("getUserMedia() not supported.");
      return;
    }

    mediaDevices.getUserMedia(constraints).then((stream) => {
      console.log("stream: ", stream);
      this.stream = stream;
      // return stream;
      console.log('mediaDevice.getMedia() constraints:', constraints);
    })
    .catch((err) => {
      // Web Audio APIが使えなかった時
      console.log(`${err.name}: ${err.message}`);
    });
  }

  startRec() {
    console.log('audio start rec');
    this.audioCtx.resume();
    this.input = this.audioCtx.createMediaStreamSource(this.stream);
    this.processor.connect(this.audioCtx.destination);

    this.input.connect(this.processor);
    this.processor.onaudioprocess = (audio) => {
      this.putAudioData(audio);
    }
  }

  stopRec() {
    // socket.emit('stop', this.audioData);
    const returnAudioData = this.audioData;
    this.audioData = [];
    this.input.disconnect(this.processor);
    this.processor.disconnect(this.audioCtx.destination);
    return returnAudioData;
  }

  putAudioData(audio) {
    var input = audio.inputBuffer.getChannelData(0);
    // var bufferData = this.convertoFloat32ToInt16(input)

    var bufferData = new Float32Array(this.buffer);

    for (var i = 0; i < this.buffer; i++) {
      bufferData[i] = input[i];
    }
    // console.log(bufferData)
    this.audioData.push(bufferData);
  }

  convertoFloat32ToInt16(buffer) {
    var l = buffer.length;
    var buf = new Int16Array(l/3); //<-----Only change here
    
    while (l--) {
      if(l%3==0){
        buf[l/3] = buffer[l]*0x7FFF;
      }
    }
    return buf
  }

}