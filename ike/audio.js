
// HTML5 Audio realtime synthesis

var SAMPLE_MULT   = 4;
var sampleCount   = 0;
var sampleRem     = 0;
var sampleIndex   = 0;
var bufferedAudio = [];

function getAudioSample() {
	// multiply samples out:
	if (sampleRem == SAMPLE_MULT-1) { sampleRem = 0; sampleIndex++; }
	else { sampleRem++; }
	
	// fetch more samples from K if we're out of buffered ones:
	if (sampleIndex >= bufferedAudio.length) {
		var samples = null;
		var playval = env.lookup(ks("play"));
		if (playval.t == 3) {
			samples = playval;
		}
		else {
			samples = callk1("play", sampleCount);
			if (samples.t == 0) { samples = k(3, [samples]); }
		}
		sampleCount += len(samples);
		bufferedAudio = [];
		sampleIndex = 0;
		for(var z = 0; z < len(samples); z++) {
			bufferedAudio.push(samples.v ? samples.v[z].v : 0);
		}
	}

	// discharge a sample from our prepared buffer:
	return bufferedAudio[sampleIndex];
}

var audio;
var soundSource;
var scriptNode;

function audioSetup() {
	if (audio && soundSource) { return true; }
	if (!audio) {
		if (typeof AudioContext !== 'undefined') {
			audio = new AudioContext();
		}
		else if (typeof webkitAudioContext !== 'undefined') {
			audio = new webkitAudioContext();
		}
	}
	if (audio) {
		scriptNode  = audio.createScriptProcessor(4096, 1, 1);
		scriptNode.onaudioprocess = function(audioProcessingEvent) {
			var inputBuffer  = audioProcessingEvent.inputBuffer;
			var outputBuffer = audioProcessingEvent.outputBuffer;
			for(var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
				var inputData  = inputBuffer.getChannelData(channel);
				var outputData = outputBuffer.getChannelData(channel);
				if (env.contains(ks("play"))) {
					setvar("srate", num(Math.floor(outputBuffer.sampleRate / SAMPLE_MULT)));
					for(var sample = 0; sample < inputBuffer.length; sample += 1) {
						outputData[sample] = getAudioSample();
					}
				}
			}
		}
		return true;
	}
	return false;
}

function audioPlay() {
	if (running && audioSetup()) {
		sampleCount   = 0;
		sampleRem     = 0;
		sampleIndex   = 0;
		bufferedAudio = [];
		soundSource = audio.createBufferSource();
		soundSource.buffer = audio.createBuffer(1, 4096, audio.sampleRate);
		soundSource.connect(scriptNode);
		scriptNode.connect(audio.destination);
		soundSource.loop = true;
		soundSource.start(0);
	}
}

function audioStop() {
	if (soundSource != null) {
		scriptNode.disconnect();
		soundSource.loop = false;
		soundSource.disconnect();
		soundSource = null;
	}
}
