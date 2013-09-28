var NOISE_FACTOR = 0.05;

function MicrophoneSample() {
  this.WIDTH = 600;
  this.HEIGHT = 440;
  this.getMicrophoneInput();
  this.canvasBefore = document.querySelector('.beforeAudio');
  this.canvasAfter = document.querySelector('.afterAudio');
  this.BUFFER_SIZE = 2048;
  this.isPlaying = false;
  this.isNoise = true;
  this.isChannelFlip = false;
}



MicrophoneSample.prototype.getMicrophoneInput = function() {
  navigator.webkitGetUserMedia({audio: true},
                               this.onStream.bind(this),
                               this.onStreamError.bind(this));
};

MicrophoneSample.prototype.play = function() {
  // Create some sweet sweet nodes.
  this.oscillator = context.createOscillator();
  var processor = context.createScriptProcessor(this.BUFFER_SIZE);
  processor.onaudioprocess = this.onProcess;

  requestAnimFrame(this.visualizeBefore.bind(this));
  requestAnimFrame(this.visualizeAfter.bind(this));

  var filter = context.createBiquadFilter();
  filter.frequency.value = 200.0;
  filter.type = filter.HIGHPASS;
  filter.Q = 10.0;

  var analyserBefore = context.createAnalyser();
  analyserBefore.fftSize = 2048;
  this.analyserBefore = analyserBefore;
  console.log('analyserBefore', analyserBefore);

  var analyserAfter = context.createAnalyser();
  analyserAfter.fftSize = 2048;
  this.analyserAfter = analyserAfter;
  console.log('analyserAfter', analyserAfter);
  this.analyser = context.createAnalyser();

  // Connect graph.
  this.oscillator.connect(analyserBefore);
  analyserBefore.connect(processor);
  processor.connect(filter);
  filter.connect(analyserAfter);
  analyserAfter.connect(context.destination);

  this.oscillator.start(0);
};

MicrophoneSample.prototype.stop = function() {
  this.oscillator.stop(0);
};

MicrophoneSample.prototype.toggle = function() {
  (this.isPlaying ? this.stop() : this.play());
  this.isPlaying = !this.isPlaying;

};

MicrophoneSample.prototype.changeFrequency = function(val) {
  this.oscillator.frequency.value = val;
};

MicrophoneSample.prototype.changeDetune = function(val) {
  this.oscillator.detune.value = val;
};

MicrophoneSample.prototype.onStream = function(stream) {

  var source = context.createMediaStreamSource(stream);
  source.buffer = this.buffer;

  var processor = context.createScriptProcessor(this.BUFFER_SIZE);
  processor.onaudioprocess = this.onProcess;

  requestAnimFrame(this.visualizeBefore.bind(this));
  requestAnimFrame(this.visualizeAfter.bind(this));

  var filter = context.createBiquadFilter();
  filter.frequency.value = 200.0;
  filter.type = filter.HIGHPASS;
  filter.Q = 10.0;

  var analyserBefore = context.createAnalyser();
  analyserBefore.fftSize = 2048;
  this.analyserBefore = analyserBefore;
  console.log('analyserBefore', analyserBefore);

  var analyserAfter = context.createAnalyser();
  analyserAfter.fftSize = 2048;
  this.analyserAfter = analyserAfter;
  console.log('analyserAfter', analyserAfter);


  // Connect graph.
  source.connect(analyserBefore);
  analyserBefore.connect(processor);
  processor.connect(filter);
  filter.connect(analyserAfter);
  analyserAfter.connect(context.destination);

};

MicrophoneSample.prototype.onStreamError = function(e) {
  console.error('Error getting microphone', e);
};


MicrophoneSample.prototype.visualizeBefore = function() {
  this.canvasBefore.width = this.WIDTH;
  this.canvasBefore.height = this.HEIGHT;
  var drawContext = this.canvasBefore.getContext('2d');

  var times = new Uint8Array(this.analyserBefore.frequencyBinCount);
  this.analyserBefore.getByteTimeDomainData(times);
  
  for (var i = 0; i < times.length; i++) {
    var value = times[i];
    var percent = value / 256;
    var height = this.HEIGHT * percent;
    var offset = this.HEIGHT - height - 1;
    var barWidth = this.WIDTH/times.length;
    drawContext.fillStyle = 'black';
    drawContext.fillRect(i * barWidth, offset, 1, 1);
  }

  var freqDomain = new Uint8Array(this.analyserBefore.frequencyBinCount);
  this.analyserBefore.getByteFrequencyData(freqDomain);
  

  for (var i = 0; i < this.analyserBefore.frequencyBinCount; i++) {
    var value = freqDomain[i]; var percent = value / 256;
    var height = this.HEIGHT * percent; var offset = this.HEIGHT - height - 1;
    var barWidth = this.WIDTH/this.analyserBefore.frequencyBinCount;
    var hue = i/this.analyserBefore.frequencyBinCount * 360; 
    drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)'; 
    drawContext.fillRect(i * barWidth, offset, barWidth, height);
  }

  requestAnimFrame(this.visualizeBefore.bind(this));
};

MicrophoneSample.prototype.visualizeAfter = function() {
  this.canvasAfter.width = this.WIDTH;
  this.canvasAfter.height = this.HEIGHT;
  var drawContext = this.canvasAfter.getContext('2d');

  var times = new Uint8Array(this.analyserAfter.frequencyBinCount);
  this.analyserAfter.getByteTimeDomainData(times);
  
  for (var i = 0; i < times.length; i++) {
    var value = times[i];
    var percent = value / 256;
    var height = this.HEIGHT * percent;
    var offset = this.HEIGHT - height - 1;
    var barWidth = this.WIDTH/times.length;
    drawContext.fillStyle = 'black';
    drawContext.fillRect(i * barWidth, offset, 1, 1);
  }

  var freqDomain = new Uint8Array(this.analyserAfter.frequencyBinCount);
  this.analyserAfter.getByteFrequencyData(freqDomain);
  

  for (var i = 0; i < this.analyserAfter.frequencyBinCount; i++) {
    var value = freqDomain[i]; var percent = value / 256;
    var height = this.HEIGHT * percent; var offset = this.HEIGHT - height - 1;
    var barWidth = this.WIDTH/this.analyserAfter.frequencyBinCount;
    var hue = i/this.analyserAfter.frequencyBinCount * 360; 
    drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)'; 
    drawContext.fillRect(i * barWidth, offset, barWidth, height);
  }

  requestAnimFrame(this.visualizeAfter.bind(this));
};

MicrophoneSample.prototype.onProcess = function(e) {
  var leftIn = e.inputBuffer.getChannelData(0);
  var rightIn = e.inputBuffer.getChannelData(1);
  var leftOut = e.outputBuffer.getChannelData(0);
  var rightOut = e.outputBuffer.getChannelData(1);

  // var adjustedBufer = new FFT(2048,44100);
  //console.log('adjustedBufer', adjustedBufer);
  // adjustedBufer.inverse(leftIn,leftOut);

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
      leftOut[i] += (Math.random() - 5.0) * NOISE_FACTOR;
      rightOut[i] += (Math.random() - 5.0) * NOISE_FACTOR;
    }
  }
};

// // Google FFT

// // Copyright (c) 2010 Corban Brook, released under the MIT license
// // Fourier Transform Module used by DFT, FFT, RFT
// // Slightly modified for packed DC/nyquist...

// function FourierTransform(bufferSize, sampleRate) {
//   this.bufferSize = bufferSize;
//   this.sampleRate = sampleRate;
//   this.bandwidth  = 2 / bufferSize * sampleRate / 2;

//   this.spectrum   = new Float32Array(bufferSize/2);
//   this.real       = new Float32Array(bufferSize);
//   this.imag       = new Float32Array(bufferSize);

//   this.peakBand   = 0;
//   this.peak       = 0;

//   /**
//    * Calculates the *middle* frequency of an FFT band.
//    *
//    * @param {Number} index The index of the FFT band.
//    *
//    * @returns The middle frequency in Hz.
//    */
//   this.getBandFrequency = function(index) {
//     return this.bandwidth * index + this.bandwidth / 2;
//   };

//   this.calculateSpectrum = function() {
//     var spectrum  = this.spectrum,
//         real      = this.real,
//         imag      = this.imag,
//         bSi       = 2 / this.bufferSize,
//         sqrt      = Math.sqrt,
//         rval, 
//         ival,
//         mag;

//     for (var i = 0, N = bufferSize/2; i < N; i++) {
//       rval = real[i];
//       ival = imag[i];
//       mag = bSi * sqrt(rval * rval + ival * ival);

//       if (mag > this.peak) {
//         this.peakBand = i;
//         this.peak = mag;
//       }

//       spectrum[i] = mag;
//     }
//   };
// }

// /**
//  * FFT is a class for calculating the Discrete Fourier Transform of a signal
//  * with the Fast Fourier Transform algorithm.
//  *
//  * @param {Number} bufferSize The size of the sample buffer to be computed. Must be power of 2
//  * @param {Number} sampleRate The sampleRate of the buffer (eg. 44100)
//  *
//  * @constructor
//  */
// function FFT(bufferSize, sampleRate) {
//   FourierTransform.call(this, bufferSize, sampleRate);
   
//   this.reverseTable = new Uint32Array(bufferSize);

//   var limit = 1;
//   var bit = bufferSize >> 1;

//   var i;

//   while (limit < bufferSize) {
//     for (i = 0; i < limit; i++) {
//       this.reverseTable[i + limit] = this.reverseTable[i] + bit;
//     }

//     limit = limit << 1;
//     bit = bit >> 1;
//   }

//   this.sinTable = new Float32Array(bufferSize);
//   this.cosTable = new Float32Array(bufferSize);

//   for (i = 0; i < bufferSize; i++) {
//     this.sinTable[i] = Math.sin(-Math.PI/i);
//     this.cosTable[i] = Math.cos(-Math.PI/i);
//   }
// }

// /**
//  * Performs a forward tranform on the sample buffer.
//  * Converts a time domain signal to frequency domain spectra.
//  *
//  * @param {Array} buffer The sample buffer. Buffer Length must be power of 2
//  *
//  * @returns The frequency spectrum array
//  */
// FFT.prototype.forward = function(buffer) {
//   // Locally scope variables for speed up
//   var bufferSize      = this.bufferSize,
//       cosTable        = this.cosTable,
//       sinTable        = this.sinTable,
//       reverseTable    = this.reverseTable,
//       real            = this.real,
//       imag            = this.imag,
//       spectrum        = this.spectrum;

//   var k = Math.floor(Math.log(bufferSize) / Math.LN2);

//   if (Math.pow(2, k) !== bufferSize) { throw "Invalid buffer size, must be a power of 2."; }
//   if (bufferSize !== buffer.length)  { throw "Supplied buffer is not the same size as defined FFT. FFT Size: " + bufferSize + " Buffer Size: " + buffer.length; }

//   var halfSize = 1,
//       phaseShiftStepReal,
//       phaseShiftStepImag,
//       currentPhaseShiftReal,
//       currentPhaseShiftImag,
//       off,
//       tr,
//       ti,
//       tmpReal,
//       i;

//   for (i = 0; i < bufferSize; i++) {
//     real[i] = buffer[reverseTable[i]];
//     imag[i] = 0;
//   }

//   while (halfSize < bufferSize) {
//     //phaseShiftStepReal = Math.cos(-Math.PI/halfSize);
//     //phaseShiftStepImag = Math.sin(-Math.PI/halfSize);
//     phaseShiftStepReal = cosTable[halfSize];
//     phaseShiftStepImag = sinTable[halfSize];
    
//     currentPhaseShiftReal = 1;
//     currentPhaseShiftImag = 0;

//     for (var fftStep = 0; fftStep < halfSize; fftStep++) {
//       i = fftStep;

//       while (i < bufferSize) {
//         off = i + halfSize;
//         tr = (currentPhaseShiftReal * real[off]) - (currentPhaseShiftImag * imag[off]);
//         ti = (currentPhaseShiftReal * imag[off]) + (currentPhaseShiftImag * real[off]);

//         real[off] = real[i] - tr;
//         imag[off] = imag[i] - ti;
//         real[i] += tr;
//         imag[i] += ti;

//         i += halfSize << 1;
//       }

//       tmpReal = currentPhaseShiftReal;
//       currentPhaseShiftReal = (tmpReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag);
//       currentPhaseShiftImag = (tmpReal * phaseShiftStepImag) + (currentPhaseShiftImag * phaseShiftStepReal);
//     }

//     halfSize = halfSize << 1;
//   }
  
//   // Pack nyquist component.
//   imag[0] = real[bufferSize / 2];
// };

// // The real parameter represents an array of cosine terms (traditionally the A terms). In audio terminology, the first element (index 0) is the DC-offset of the periodic waveform and is usually set to zero. The second element (index 1) represents the fundamental frequency. The third element represents the first overtone, and so on.

// // The imag parameter represents an array of sine terms (traditionally the B terms). The first element (index 0) should be set to zero (and will be ignored) since this term does not exist in the Fourier series. The second element (index 1) represents the fundamental frequency. The third element represents the first overtone, and so on.

// FFT.prototype.inverse = function(real, imag) {
//   // Locally scope variables for speed up
//   var bufferSize      = this.bufferSize,
//       cosTable        = this.cosTable,
//       sinTable        = this.sinTable,
//       reverseTable    = this.reverseTable,
//       spectrum        = this.spectrum;
     
//       real = real || this.real;
//       imag = imag || this.imag;

//   var halfSize = 1,
//       phaseShiftStepReal,
//       phaseShiftStepImag,
//       currentPhaseShiftReal,
//       currentPhaseShiftImag,
//       off,
//       tr,
//       ti,
//       tmpReal,
//       i;

//       // Unpack and create mirror image.
//       // This isn't that efficient, but let's us avoid having to deal with the mirror image part
//       // when processing.
//       var n = bufferSize;
//       var nyquist = imag[0];
//       imag[0] = 0;
//       real[n / 2] = nyquist;
//       imag[n / 2] = 0;

//       // Mirror image complex conjugate.
//       for (i = 1 + n / 2; i < n; i++) {
//           real[i] = real[n - i];
//           imag[i] = -imag[n - i];
//       }

//   for (i = 0; i < bufferSize; i++) {
//     imag[i] *= -1;
//   }

//   var revReal = new Float32Array(bufferSize);
//   var revImag = new Float32Array(bufferSize);

  
  
  
   
//   for (i = 0; i < real.length; i++) {
//     revReal[i] = real[reverseTable[i]];
//     revImag[i] = imag[reverseTable[i]];
//   }
   
//   real = revReal;
//   imag = revImag;
  
//   while (halfSize < bufferSize) {
//     phaseShiftStepReal = cosTable[halfSize];
//     phaseShiftStepImag = sinTable[halfSize];
//     currentPhaseShiftReal = 1;
//     currentPhaseShiftImag = 0;
  
//     for (var fftStep = 0; fftStep < halfSize; fftStep++) {
//       i = fftStep;
  
//       while (i < bufferSize) {
//         off = i + halfSize;
//         tr = (currentPhaseShiftReal * real[off]) - (currentPhaseShiftImag * imag[off]);
//         ti = (currentPhaseShiftReal * imag[off]) + (currentPhaseShiftImag * real[off]);
  
//         real[off] = real[i] - tr;
//         imag[off] = imag[i] - ti;
//         real[i] += tr;
//         imag[i] += ti;
  
//         i += halfSize << 1;
//       }
  
//       tmpReal = currentPhaseShiftReal;
//       currentPhaseShiftReal = (tmpReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag);
//       currentPhaseShiftImag = (tmpReal * phaseShiftStepImag) + (currentPhaseShiftImag * phaseShiftStepReal);
//     }
  
//     halfSize = halfSize << 1;
//   }
  
//   var buffer = new Float32Array(bufferSize); // this should be reused instead
//   for (i = 0; i < bufferSize; i++) {
//     buffer[i] = real[i] / bufferSize;
//   }

//   return buffer;
// };

// // END Google FFT
