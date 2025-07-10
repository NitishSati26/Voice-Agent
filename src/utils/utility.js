export async function detectSilence(threshold = 0.01, silenceDuration = 2000, callback) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    let silenceStart = null;

    function checkSilence() {
        analyser.getByteFrequencyData(dataArray);
        let average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;

        if (average < threshold * 255) {
            if (silenceStart === null) {
                silenceStart = Date.now();
            } else if (Date.now() - silenceStart >= silenceDuration) {
                callback();
                silenceStart = null; // Reset after detection
            }
        } else {
            silenceStart = null; // Reset if noise is detected
        }

        requestAnimationFrame(checkSilence);
    }

    checkSilence();
}
