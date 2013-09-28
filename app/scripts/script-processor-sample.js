var NOISE_FACTOR = 0.05;

function ScriptSample() {
  this.BUFFER_SIZE = 2048;
  this.isPlaying = false;
  this.isNoise = true;
  this.isChannelFlip = false;
  // Load a sound.
  loadSounds(this, {
    buffer: 'chrono.mp3'
  });
}

ScriptSample.prototype.play = function() {
  var source = context.createBufferSource();
  source.buffer = this.buffer;

  // Hook it up to a ScriptProcessorNode.
  var processor = context.createScriptProcessor(this.BUFFER_SIZE);
  processor.onaudioprocess = this.onProcess;

  source.connect(processor);
  processor.connect(context.destination);

  console.log('start');
  source.start(0);
  this.source = source;
};

ScriptSample.prototype.stop = function() {
  console.log('stop');
  this.source.stop(0);
};

ScriptSample.prototype.onProcess = function(e) {
  var leftIn = e.inputBuffer.getChannelData(0);
  var rightIn = e.inputBuffer.getChannelData(1);
  var leftOut = e.outputBuffer.getChannelData(0);
  var rightOut = e.outputBuffer.getChannelData(1);

  for (var i = 0; i < leftIn.length; i++) {
    // Flip left and right channels.
    if (this.isChannelFlip) {
      leftOut[i] = rightIn[i];
      rightOut[i] = leftIn[i];
    } else {
      leftOut[i] = leftIn[i];
      rightOut[i] = rightIn[i];
    }

    // Add some noise
    if (true) {
      leftOut[i] += (Math.random() - 0.5) * NOISE_FACTOR;
      rightOut[i] += (Math.random() - 0.5) * NOISE_FACTOR;
    }

  }
};

ScriptSample.prototype.toggle = function() {
  (this.isPlaying ? this.stop() : this.play());
  this.isPlaying = !this.isPlaying;
};