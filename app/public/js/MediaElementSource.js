/**
 * Created by s2 on 4/16/15.
 */
MediaElementSource = function(sourceEl,audioContext,canvasEl){
  var self = this;
  this.isPlaying = false;
  this.sourceEl = sourceEl;
  this.canvasEl = canvasEl;
  this.sourceNode = audioContext.createMediaElementSource(sourceEl);
  this.audioContext = audioContext;

  this.analyserNode = audioContext.createAnalyser();
  this.analyserNode.smoothingTimeConstant = 0.0;
  this.analyserNode.fftSize = 1024;
  //var sampleSize = 1024;  // number of samples to collect before analyzing
  // decreasing this gives a faster sonogram, increasing it slows it down


  this.amplitudeArray = new Uint8Array(this.analyserNode.frequencyBinCount);

  //var fftSize = 1024; // must be power of two

  // array to hold frequency data
  this.frequencyArray = new Uint8Array(this.analyserNode.frequencyBinCount);

  //this.jsNode = audioContext.createScriptProcessor(1024, 1, 1);
  this.jsNode = audioContext.createScriptProcessor(256, 1, 1);
  // decreasing the sample size gives a faster sonogram, increasing it slows it down

  this.setSource = function(html5audioElement){
    self.removeEventListening();
    self.sourceEl = html5audioElement;
    self.sourceNode = audioContext.createMediaElementSource(self.sourceEl);
    self.sourceNode.connect(self.analyserNode);
    self.sourceNode.connect(self.audioContext.destination);
    //self.jsNode.onaudioprocess = self.jsOnAudioProcess
    self.addEventListening();
  }

  // setup the event handler that is triggered every time enough samples have been collected
  // trigger the audio analysis and draw one column in the display based on the results
  this.jsNode.onaudioprocess = null;

  this.jsOnAudioProcess = function () {
    if(!self.isPlaying) return; //TODO: should end processing, not just ignore it?

    /// Q: DO I really need to re-init amplitudeArray? Don't think so
    self.amplitudeArray = new Uint8Array(self.analyserNode.frequencyBinCount);

    ///TIME DOMAIN
    self.analyserNode.getByteTimeDomainData(self.amplitudeArray);

    ///FREQUENCY DOMAIN
    self.analyserNode.getByteFrequencyData(self.frequencyArray);

    //requestAnimFrame(draw);
    self.draw();
  }

  // Now connect the nodes together
  this.sourceNode.connect(this.analyserNode);
  this.analyserNode.connect(this.jsNode);
  this.jsNode.connect(audioContext.destination);
  this.sourceNode.connect(audioContext.destination);

  this.setPlayingTrue = function () {
    self.jsNode.onaudioprocess = self.jsOnAudioProcess;
    self.isPlaying = true;
  }
  this.setPlayingFalse = function () {
    self.jsNode.onaudioprocess = null;
    self.isPlaying = false;
  }

  this.addEventListening = function(){
    self.sourceEl.addEventListener('playing', self.setPlayingTrue, true);
    self.sourceEl.addEventListener('pause', self.setPlayingFalse, true);
    //this.sourceEl.addEventListener("play", function() { console.log("PLAY AUDIO") }, true);
    self.sourceEl.addEventListener('ended', self.setPlayingFalse, true);
  }
  this.removeEventListening = function(){
    self.sourceEl.removeEventListener('playing', self.setPlayingTrue);
    self.sourceEl.removeEventListener('pause', self.setPlayingFalse);
    //this.sourceEl.addEventListener("play", function() { console.log("PLAY AUDIO") }, true);
    self.sourceEl.removeEventListener('ended', self.setPlayingFalse);
  }
  this.addEventListening();


  this.canvasEl = this.canvasEl;
  this.canvasContext = this.canvasEl.getContext("2d");
  this.canvasW = this.canvasEl.width;//512;
  this.canvasH = this.canvasEl.height; //256;

  this.col = 0;

  var canvas_temp = $('<canvas>')[0];
  canvas_temp.height = this.canvasH
  canvas_temp.width =  this.canvasW
  var ctx_temp = canvas_temp.getContext('2d');
  var barW = 1;

  this.setW = function(val){
    self.canvasEl.width =  self.canvasW =  canvas_temp.width = val;
  }

  this.draw = function(){
    //console.log(" draw")
    ctx_temp.clearRect(0, 0, self.canvasW, self.canvasH);
    ctx_temp.drawImage(self.canvasEl, -barW, 0, self.canvasW, self.canvasH);
    self.canvasContext.clearRect(0, 0, self.canvasW, self.canvasH);

        ////// UNCOMMENT FOR TIME DOMAIN in same canvas
/*
    ///TIME DOMAIN
    var minValue = 9999999;
    var maxValue = 0;

    for (var i = 0; i < self.amplitudeArray.length; i++) {
      var value = self.amplitudeArray[i] / 256;
      if (value > maxValue) {
        maxValue = value;
      } else if (value < minValue) {
        minValue = value;
      }
    }

    var y_lo = self.canvasH - (self.canvasH * minValue) - 1;
    var y_hi = self.canvasH - (self.canvasH * maxValue) - 1;

    self.canvasContext.fillStyle = '#000000';
    // self.canvasContext.fillRect(self.canvasW - barW, y_lo, barW, y_hi - y_lo);
*/

    ///FREQUENCY SPECTROGRAM
    for (var i = 0; i < self.frequencyArray.length; i++) {
      var alpha = self.frequencyArray[i] / 256.0;
      self.canvasContext.fillStyle = 'rgba(231, 0, 31, ' + alpha + ' )';
      self.canvasContext.fillRect(self.canvasW - barW, self.canvasH - i, barW, 1);
    }

    // draw the copied image
    self.canvasContext.drawImage(canvas_temp, 0, 0, self.canvasW, self.canvasH);

  }

  this.clearCanvas = function () {
    self.canvasContext.clearRect(0, 0, self.canvasW, self.canvasH);
    self.canvasContext.strokeStyle = '#E7001F';
  }
  this.clearCanvas();

  this.play = function(){
    self.sourceEl.play()
  }
}