// ------------------------------
// Simple demo logic:
// - System starts CALIBRATING
// - After 60–120 seconds, it becomes CALIBRATED
// - Camera Cal is always CONNECTION LOST
// - Alert stays OFF, Visual flags stay NO
// - DHT11 is simulated around Lahore winter baseline
// ------------------------------

// Baseline chosen using current Lahore conditions (approx):
// Temp ~ 11°C, humidity ~ 70–76% (typical daytime).  Sources:
// - Weather tool shows ~11°C now
// - Timeanddate shows humidity around ~76%
// - METAR example shows RH ~66%
// We fluctuate around those.
const BASE_TEMP_C = 11;
const BASE_HUM_PCT = 72;

const els = {
  sysStatus: document.getElementById("sysStatus"),
  camStatus: document.getElementById("camStatus"),
  alertStatus: document.getElementById("alertStatus"),
  visualConfirmed: document.getElementById("visualConfirmed"),
  areaFlag: document.getElementById("areaFlag"),
  lineFlag: document.getElementById("lineFlag"),

  humVal: document.getElementById("humVal"),
  tempVal: document.getElementById("tempVal"),
  humTrend: document.getElementById("humTrend"),
  tempTrend: document.getElementById("tempTrend"),

  btnStart: document.getElementById("btnStart"),
  btnStop: document.getElementById("btnStop"),
  streamHint: document.getElementById("streamHint"),

  modal: document.getElementById("modal"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  modalOk: document.getElementById("modalOk"),
};

let startMs = Date.now();
let calibrateMs = randomInt(60_000, 120_000);

let prevTemp = null;
let prevHum = null;

function randomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function clamp(v, lo, hi){
  return Math.max(lo, Math.min(hi, v));
}

function setPill(el, text, cls){
  el.textContent = text;
  el.classList.remove("pill-ok","pill-warn","pill-bad");
  el.classList.add(cls);
}

function trendLabel(cur, prev, deadband){
  if (prev === null) return "flat";
  const d = cur - prev;
  if (d > deadband) return "up";
  if (d < -deadband) return "down";
  return "flat";
}

function openModal(){
  els.modal.classList.remove("hidden");
  els.modal.setAttribute("aria-hidden","false");
}
function closeModal(){
  els.modal.classList.add("hidden");
  els.modal.setAttribute("aria-hidden","true");
}

// Button behavior: show popup "camera disconnected"
els.btnStart.addEventListener("click", () => {
  els.streamHint.textContent = "Camera disconnected";
  openModal();
});
els.btnStop.addEventListener("click", () => {
  els.streamHint.textContent = "Camera disconnected";
  openModal();
});
els.modalBackdrop.addEventListener("click", closeModal);
els.modalOk.addEventListener("click", closeModal);

// Initial fixed states
setPill(els.camStatus, "CONNECTION LOST", "pill-bad");
setPill(els.alertStatus, "OFF", "pill-ok");
setPill(els.visualConfirmed, "NO", "pill-ok");
setPill(els.areaFlag, "NO", "pill-ok");
setPill(els.lineFlag, "NO", "pill-ok");

// Simulation loop (DHT11)
function tick(){
  const now = Date.now();
  const elapsed = now - startMs;

  // Calibration state
  if (elapsed < calibrateMs){
    setPill(els.sysStatus, "CALIBRATING", "pill-warn");
  } else {
    setPill(els.sysStatus, "CALIBRATED", "pill-ok");
  }

  // Simulated DHT11 readings
  // Smooth variation + mild random noise
  const t = now / 1000;
  const temp =
    BASE_TEMP_C +
    Math.sin(t / 35) * 1.4 +
    (Math.random() - 0.5) * 0.6;

  const hum =
    BASE_HUM_PCT +
    Math.sin(t / 42) * 6.0 +
    (Math.random() - 0.5) * 3.2;

  const tempC = clamp(temp, 5, 20);
  const humP = clamp(hum, 30, 95);

  // Update UI
  els.tempVal.textContent = `${tempC.toFixed(1)} °C`;
  els.humVal.textContent = `${humP.toFixed(0)} %`;

  // Trends
  const tTrend = trendLabel(tempC, prevTemp, 0.25);
  const hTrend = trendLabel(humP, prevHum, 1.0);

  prevTemp = tempC;
  prevHum = humP;

  els.tempTrend.textContent = tTrend;
  els.humTrend.textContent = hTrend;

  // Keep trends styled as warn chips (as in screenshot)
  setPill(els.tempTrend, tTrend, "pill-warn");
  setPill(els.humTrend, hTrend, "pill-warn");

  // Alert stays OFF in this demo
  // Visual flags stay NO in this demo

  setTimeout(tick, 2000);
}

tick();
