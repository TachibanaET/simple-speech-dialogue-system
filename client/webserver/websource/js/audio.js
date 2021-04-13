'use strict';

export class Audio {
  constructor() {
    const audioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new audioContext();
    this.buffer = 2048;
    this.processor = this.audioCtx.createScriptProcessor(this.buffer, 2, 1);
    this.processor.connect(this.audioCtx.destination);
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
    socket.emit('start', '');
    this.audioCtx.resume();
    var input = this.audioCtx.createStreamSource(this.stream);
    input.connect(this.processor);
    this.processor.onaudioprocess = (audio) => {
      putAudioData(audio)
    }
  }

  stopRec() {
    socket.emit('stop', this.audioData);
  }

  putAudioData(audio) {
    var input = audio.inputBuffer.getChannelData(0);
    var bufferData = new Float32Array(buffer);

    for (var i = 0; i < buffer; i++) {
      bufferData[i] = input[i];
    }
    this.audioData.push(bufferData);
  }

}