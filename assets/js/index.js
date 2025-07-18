//me when vibe coding im sorry idk how to work with audio

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const audio = document.getElementById('music');
const audioCtx = new AudioContext();
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();

source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 1024; // higher resolution

const bufferLength = analyser.frequencyBinCount; // fftSize/2
const dataArray = new Uint8Array(bufferLength);

// Calculate frequency per bin:
const sampleRate = audioCtx.sampleRate; // usually 44100
const freqPerBin = sampleRate / analyser.fftSize; // e.g. 44100/1024 ≈ 43Hz per bin

const bassStartBin = Math.floor(10 / freqPerBin);
const bassEndBin = Math.ceil(100 / freqPerBin);

const midsStartBin = Math.floor(101 / freqPerBin);
const midsEndBin = Math.ceil(2000 / freqPerBin);

const highsStartBin = Math.floor(2001 / freqPerBin);
const highsEndBin = Math.min(bufferLength - 1, Math.ceil(8000 / freqPerBin));

function getBassAverage(data) {
    let sum = 0;
    let count = 0;
    for (let i = bassStartBin; i <= bassEndBin; i++) {
        sum += data[i];
        count++;
    }
    return count > 0 ? sum / count : 0;
}

function getMidsAverage(data) {
    let sum = 0;
    let count = 0;
    for (let i = midsStartBin; i <= midsEndBin; i++) {
        sum += data[i];
        count++;
    }
    return count > 0 ? sum / count : 0;
}

function getHighsAverage(data) {
    let sum = 0;
    let count = 0;
    for (let i = highsStartBin; i <= highsEndBin; i++) {
        sum += data[i];
        count++;
    }
    return count > 0 ? sum / count : 0;
}


window.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    audio.play();
});


let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);
    const bass = getBassAverage(dataArray);
    const mids = getMidsAverage(dataArray);
    const highs = getHighsAverage(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const bassRadius = 50 + bass;
    const midsRadius = 100 + mids;
    const highsRadius = 160 + highs;

    // Parallax offsets (increased for more visible movement)
    // If mouse is outside canvas, keep last known position, but also listen to window mousemove
    
    const bassOffset = 0;
    const midsOffset = 0.025;
    const highsOffset = 0.05;

    // Calculate parallax positions
    // Add slight randomness to each circle's position
    const randomRange = (amount) => (Math.random() - 0.5) * amount;

    const bassX = centerX + (mouseX - centerX) * bassOffset + randomRange(10);
    const bassY = centerY + (mouseY - centerY) * bassOffset + randomRange(10);
    const midsX = centerX + (mouseX - centerX) * midsOffset + randomRange(15);
    const midsY = centerY + (mouseY - centerY) * midsOffset + randomRange(15);
    const highsX = centerX + (mouseX - centerX) * highsOffset + randomRange(20);
    const highsY = centerY + (mouseY - centerY) * highsOffset + randomRange(20);
    // Save current context state
    ctx.save();

    // Apply blur filter for soft edges
    ctx.filter = 'blur(10px)';

    // Bass circle
    ctx.beginPath();
    ctx.arc(bassX, bassY, bassRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${bass / 20}, 50, 100, 0.4)`;
    ctx.fill();

    // Mids circle
    ctx.beginPath();
    ctx.arc(midsX, midsY, midsRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${mids / 10}, 75, 100, 0.3)`;
    ctx.fill();

    // Highs circle
    ctx.beginPath();
    ctx.arc(highsX, highsY, highsRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${highs / 5}, 50, 75, 0.2)`;
    ctx.fill();

    // Restore context state to remove blur for other drawing
    ctx.restore();
    drawFrequencyBars();

}

function drawFrequencyBars() {
    const barCount = 1024; // desired number of visual bars
    const half = barCount / 2;
    const barWidth = canvas.width / barCount;

    const scale = bufferLength / half; // how much data we have per half of bars

    for (let i = 0; i < half; i++) {
        const reversedIndex = (half - 1) - i;
        const dataIndex = reversedIndex * scale;

        // Interpolate between two bins if needed
        const lower = Math.floor(dataIndex);
        const upper = Math.ceil(dataIndex);
        const t = dataIndex - lower;
        const value = (1 - t) * dataArray[lower] + t * dataArray[upper];

        const barHeight = value * 1.5;
        const color = `#149cea10`;

        // Left bar
        const xLeft = canvas.width / 2 - (i + 1) * barWidth;
        ctx.fillStyle = color;
        ctx.fillRect(xLeft, canvas.height - barHeight, barWidth, barHeight);

        // Right bar
        const xRight = canvas.width / 2 + i * barWidth;
        ctx.fillStyle = color;
        ctx.fillRect(xRight, canvas.height - barHeight, barWidth, barHeight);
    }
}



draw();

//im sorry no more vibe coding

window.addEventListener('DOMContentLoaded', () => {
    const text = document.getElementById('nowplaying').textContent;
    document.getElementById('nowplaying').innerHTML = '';
    Array.from(text).forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--i', i);
        document.getElementById('nowplaying').appendChild(span);
    });
});

window.addEventListener('click', function handler() {
    document.getElementById('musicprompt').remove();
    window.removeEventListener('click', handler);
});

document.getElementById('mutecontrol').addEventListener('click', () => {
    if (audio.muted) {
        audio.muted = false;
        document.getElementById('mutecontrol').classList.add('fa-volume-high');
        document.getElementById('mutecontrol').classList.remove('fa-volume-mute');
        canvas.style.display = 'block';
    } else {
        audio.muted = true;
        document.getElementById('mutecontrol').classList.add('fa-volume-mute');
        document.getElementById('mutecontrol').classList.remove('fa-volume-high');
        canvas.style.display = 'none';
    }
});