// ==== Code Breaker – The Array Heist ====

const ARRAY_SIZE = 8;
const EMPTY = null;

// Game Levels
const LEVELS = [
  {id:1, desc:"Find any 2-digit pattern", len:2, reverse:false},
  {id:2, desc:"Find a 3-digit pattern", len:3, reverse:false},
  {id:3, desc:"Find a pattern in reverse order!", len:3, reverse:true}
];

let array = Array(ARRAY_SIZE).fill(EMPTY);
let secretPattern = [];
let currentLevel = 0;
let timer = null, seconds = 0, timerRunning = false;
let found = false;

// Short sound (Web Audio API)
function playSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  g.gain.value = 0.15;
  if (type==='beep') { o.type='triangle'; o.frequency.value=660; }
  if (type==='buzz') { o.type='sawtooth'; o.frequency.value=110; }
  if (type==='fanfare') { o.type='square'; o.frequency.value=880; }
  o.start();
  if(type==='fanfare'){
    setTimeout(()=>{o.frequency.value=1100;},120);
    setTimeout(()=>{o.frequency.value=660;},230);
  }
  setTimeout(()=>{g.gain.linearRampToValueAtTime(0, ctx.currentTime+0.05); o.stop();}, type==='fanfare' ? 380 : 210);
}

function randomPattern(len) {
  let p = [];
  while (p.length < len) {
    let n = Math.floor(Math.random()*9)+1;
    if (!p.includes(n) || len > 2) p.push(n);
  }
  return p;
}

function renderArray(highlights = [], matchStart = -1, matchLen = 0) {
  const arr = document.getElementById('array');
  arr.innerHTML = '';
  for (let i = 0; i < ARRAY_SIZE; ++i) {
    let v = array[i];
    let cell = document.createElement('div');
    cell.className = 'cell';
    if (v === EMPTY) cell.classList.add('empty');
    cell.textContent = v === EMPTY ? '' : v;
    if (highlights.includes(i)) cell.classList.add('search-check');
    if (matchStart !== -1 && i >= matchStart && i < matchStart+matchLen)
      cell.classList.add('search-match');
    arr.appendChild(cell);
  }
}

function showFeedback(msg, type='') {
  const fb = document.getElementById('feedback');
  fb.textContent = msg;
  fb.className = type;
}

function setSecretClue() {
  let clue = secretPattern.slice();
  if (LEVELS[currentLevel].reverse) clue = clue.slice().reverse();
  document.getElementById('secret-clue').textContent = `Secret Pattern: [${clue.join(', ')}]`;
}

function startLevel(levelIdx) {
  array = Array(ARRAY_SIZE).fill(EMPTY);
  found = false;
  currentLevel = levelIdx;
  secretPattern = randomPattern(LEVELS[levelIdx].len);
  setSecretClue();
  renderArray();
  showFeedback('Level ' + (levelIdx+1) + ': ' + LEVELS[levelIdx].desc);
  document.getElementById('level-info').textContent = 'Level ' + (levelIdx+1);
  // Start timer
  seconds = 0;
  timerRunning = true;
  document.getElementById('timer').textContent = '60s';
  if (timer) clearInterval(timer);
  timer = setInterval(()=>{
    if (!timerRunning) return;
    seconds++;
    document.getElementById('timer').textContent = (60-seconds)+'s';
    if (seconds >= 60) {
      timerRunning = false;
      showFeedback('⏰ Time up! Try again.', 'fail');
      playSound('buzz');
      clearInterval(timer);
    }
  },1000);
}

function insertAt(idx, val) {
  if (idx < 0 || idx > ARRAY_SIZE-1) { playSound('buzz'); showFeedback('Index out of bounds!','fail'); return; }
  if (array[ARRAY_SIZE-1] !== EMPTY) { playSound('buzz'); showFeedback('Array full!','fail'); return; }
  if (val < 0 || val > 9) { playSound('buzz'); showFeedback('Value must be 0–9!','fail'); return; }
  // Shift right
  for (let i = ARRAY_SIZE-1; i > idx; --i) array[i] = array[i-1];
  array[idx] = val;
  renderArray();
  // Animate inserted cell
  const arr = document.getElementById('array');
  arr.children[idx].classList.add('insert-anim');
  playSound('beep');
  showFeedback(`Inserted ${val} at index ${idx}!`);
}

function deleteAt(idx) {
  if (idx < 0 || idx > ARRAY_SIZE-1) { playSound('buzz'); showFeedback('Index out of bounds!','fail'); return; }
  if (array[idx] === EMPTY) { playSound('buzz'); showFeedback('Cell already empty!','fail'); return; }
  // Animate delete
  const arr = document.getElementById('array');
  arr.children[idx].classList.add('delete-anim');
  setTimeout(()=>{
    for (let i = idx; i < ARRAY_SIZE-1; ++i) array[i] = array[i+1];
    array[ARRAY_SIZE-1] = EMPTY;
    renderArray();
    playSound('beep');
    showFeedback(`Deleted element at index ${idx}.`);
  },300);
}

async function searchPattern(pattern) {
  if (!pattern.length) { playSound('buzz'); showFeedback('Enter a valid pattern (e.g., 1,2,3)','fail'); return; }
  let arrVals = array.map(x=>x===EMPTY?null:x);
  let foundAt = -1;
  let highlights = [];
  let checkPat = pattern.slice();
  if (LEVELS[currentLevel].reverse) checkPat = checkPat.slice().reverse();
  for (let i = 0; i <= arrVals.length - checkPat.length; ++i) {
    highlights = [];
    for (let k = 0; k < checkPat.length; ++k) highlights.push(i+k);
    renderArray(highlights);
    await new Promise(res => setTimeout(res, 350));
    let segment = arrVals.slice(i, i+checkPat.length);
    if (segment.every((v,j)=>v===checkPat[j])) {
      foundAt = i;
      renderArray([], i, checkPat.length);
      if (checkPat.join() === secretPattern.join() || (LEVELS[currentLevel].reverse && checkPat.join() === secretPattern.slice().reverse().join())) {
        // Level complete!
        timerRunning = false;
        showFeedback(`Level Complete! You cracked the code in ${seconds}s!`, 'success');
        playSound('fanfare');
        setTimeout(()=>{
          if (currentLevel+1 < LEVELS.length) {
            startLevel(currentLevel+1);
          } else {
            showFeedback('🎉 All levels complete!','success');
          }
        }, 1800);
      } else {
        showFeedback(`Pattern found at index ${i}.`);
        playSound('beep');
      }
      return;
    }
  }
  renderArray();
  showFeedback('Pattern not found.', 'fail');
  playSound('buzz');
}

function resetGame() {
  array = Array(ARRAY_SIZE).fill(EMPTY);
  renderArray();
  showFeedback('Array reset.');
  playSound('beep');
}

window.onload = ()=>{
  renderArray();
  startLevel(0);
  // Insert
  document.getElementById('btn-insert').onclick = ()=>{
    let idx = parseInt(document.getElementById('input-index').value, 10);
    let val = parseInt(document.getElementById('input-value').value, 10);
    insertAt(idx, val);
  };
  // Delete
  document.getElementById('btn-delete').onclick = ()=>{
    let idx = parseInt(document.getElementById('input-index').value, 10);
    deleteAt(idx);
  };
  // Search
  document.getElementById('btn-search').onclick = ()=>{
    let patternStr = document.getElementById('input-pattern').value;
    let pat = patternStr.split(',').map(x=>parseInt(x,10)).filter(x=>!isNaN(x));
    searchPattern(pat);
  };
  // Reset
  document.getElementById('btn-reset').onclick = ()=>{
    resetGame();
  };
};