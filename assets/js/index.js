

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
analyser.fftSize = 1024;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);


const sampleRate = audioCtx.sampleRate;
const freqPerBin = sampleRate / analyser.fftSize;

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

    const bassOffset = 0;
    const midsOffset = 0.025;
    const highsOffset = 0.05;



    const randomRange = (amount) => (Math.random() - 0.5) * amount;

    const bassX = centerX + (mouseX - centerX) * bassOffset + randomRange(10);
    const bassY = centerY + (mouseY - centerY) * bassOffset + randomRange(10);
    const midsX = centerX + (mouseX - centerX) * midsOffset + randomRange(15);
    const midsY = centerY + (mouseY - centerY) * midsOffset + randomRange(15);
    const highsX = centerX + (mouseX - centerX) * highsOffset + randomRange(20);
    const highsY = centerY + (mouseY - centerY) * highsOffset + randomRange(20);

    ctx.save();


    ctx.filter = 'blur(10px)';


    ctx.beginPath();
    ctx.arc(bassX, bassY, bassRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${bass / 20}, 50, 100, 0.4)`;
    ctx.fill();


    ctx.beginPath();
    ctx.arc(midsX, midsY, midsRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${mids / 10}, 75, 100, 0.3)`;
    ctx.fill();


    ctx.beginPath();
    ctx.arc(highsX, highsY, highsRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${highs / 5}, 50, 75, 0.2)`;
    ctx.fill();


    ctx.restore();
    drawFrequencyBars();

    

}


function drawFrequencyBars() {
    const barCount = 1024;
    const half = barCount / 2;
    const barWidth = canvas.width / barCount;

    const scale = bufferLength / half;

    for (let i = 0; i < half; i++) {
        const reversedIndex = (half - 1) - i;
        const dataIndex = reversedIndex * scale;


        const lower = Math.floor(dataIndex);
        const upper = Math.ceil(dataIndex);
        const t = dataIndex - lower;
        const value = (1 - t) * dataArray[lower] + t * dataArray[upper];

        const barHeight = value * 1.5;
        const color = `#149cea10`;

        const xLeft = canvas.width / 2 - (i + 1) * barWidth;
        ctx.fillStyle = color;
        ctx.fillRect(xLeft, 0, barWidth, barHeight);
        const xRight = canvas.width / 2 + i * barWidth;
        ctx.fillStyle = color;
        ctx.fillRect(xRight, 0, barWidth, barHeight);
    }
}




draw();



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
        document.getElementById('mutecontrol').textContent = 'volume_up';
        canvas.style.display = 'block';
    } else {
        audio.muted = true;
        document.getElementById('mutecontrol').textContent = 'volume_off';
        canvas.style.display = 'none';
    }
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
        document.querySelector('.i-header').style.height = '50px';
        document.querySelector('.i-header').style.fontSize = 'calc(50px * 0.25)';
    } else {
        document.querySelector('.i-header').style.height = '75px';
        document.querySelector('.i-header').style.fontSize = 'calc(75px * 0.25)';
    }
});

let isScrolling = false;
let scrollTimeout;

window.addEventListener('scroll', () => {
    if (!isScrolling) {
        isScrolling = true;
        document.getElementById('musiccontrols').style.bottom = '-50px';
    }
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        document.getElementById('musiccontrols').style.bottom = '10px';
    }, 1000);
});

window.addEventListener('scroll', () => {
    const maxScroll = 300;
    const opacity = 1 - window.scrollY / maxScroll;
    canvas.style.opacity = opacity;
    const zoom = 1 + (window.scrollY / maxScroll) * 1;
    canvas.style.transform = `scale(${zoom})`;
    canvas.style.transformOrigin = 'center center';
});

function timeAgoIntl(date) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return rtf.format(-count, interval.label);
    }
  }
  return rtf.format(0, 'second');
}


let lastFetchTime = Date.now();

function updateStatus() {
  fetch("https://status-worker.enzopassini.workers.dev/status")
    .then(res => res.json())
    .then(data => {
      lastFetchTime = Date.now();

      document.getElementById("statusText").innerHTML = `
        I am currently <b>${data.status}</b> 
        <small id="lastUpdate" style="color: gray;">
          (last changed ${timeAgoIntl(new Date(data.updatedAt))})
        </small>
        <small id="updateCounter" style="color: gray;">(fetching...)</small> 
        
      `;
    })
    .catch(() => {
      document.getElementById("statusText").textContent = "Failed to fetch status.";
    });
}

function updateCounter() {
  const updateCounterElem = document.getElementById("updateCounter");
  if (updateCounterElem) {
    const seconds = Math.floor((Date.now() - lastFetchTime) / 1000);
    updateCounterElem.textContent = `(fetched ${seconds}s ago)`;
  }
}

updateStatus();
setInterval(updateStatus, 30000);
setInterval(updateCounter, 1000);
