const GAME_DURATION = 90;
const ALERT_LIMIT = 100;
const BEST_SCORE_KEY = "oi-fish-game-best-score";

const commandInput = document.getElementById("commandInput");
const runBtn = document.getElementById("runBtn");
const startBtn = document.getElementById("startBtn");
const hintBtn = document.getElementById("hintBtn");
const hintText = document.getElementById("hintText");
const logList = document.getElementById("logList");
const difficultySelect = document.getElementById("difficultySelect");

const timeLeftEl = document.getElementById("timeLeft");
const scoreEl = document.getElementById("score");
const alertEl = document.getElementById("alert");
const comboEl = document.getElementById("combo");
const bestScoreEl = document.getElementById("bestScore");
const alertBarEl = document.getElementById("alertBar");
const comboBarEl = document.getElementById("comboBar");

const DIFFICULTY_CONFIG = {
  casual: { scoreMul: 0.9, alertMul: 0.85, label: "轻松" },
  standard: { scoreMul: 1, alertMul: 1, label: "标准" },
  hard: { scoreMul: 1.25, alertMul: 1.2, label: "冲榜" },
};

const HINTS = [
  "`while(true)` 很赚分，但会快速提升 alertLevel。",
  "`ios::sync_with_stdio(false);` 收益中等、风险较低，适合稳扎稳打。",
  "`memset` 可以降低 alertLevel，属于续命神技。",
  "连续 3 次成功操作后，Combo 倍率会明显提升。",
  "`priority_queue` 单次收益高，但也更容易被发现。",
  "`sort` 属于伪装型操作，收益稳定但风险不算低。",
];

const COMMAND_TABLE = [
  {
    keyword: "vector",
    score: [8, 14],
    alert: [4, 8],
    text: "开了个 vector 当鱼缸，摸鱼值稳步上涨。",
  },
  {
    keyword: "while",
    score: [14, 22],
    alert: [10, 18],
    text: "你进入 while 循环，摸鱼效率爆表。",
  },
  {
    keyword: "priority_queue",
    score: [16, 26],
    alert: [12, 20],
    text: "用优先队列安排摸鱼任务，效率极高。",
  },
  {
    keyword: "bitset",
    score: [10, 18],
    alert: [7, 12],
    text: "位运算优化了摸鱼流程，十分丝滑。",
  },
  {
    keyword: "unordered_map",
    score: [11, 19],
    alert: [6, 11],
    text: "哈希映射已建立，摸鱼路径更加灵活。",
  },
  {
    keyword: "sort",
    score: [9, 16],
    alert: [5, 10],
    text: "你摆出正在优化排序的样子，暂时安全。",
  },
  {
    keyword: "memset",
    score: [4, 8],
    alert: [-16, -8],
    text: "你重置了状态，alertLevel 大幅下降。",
  },
  {
    keyword: "ios::sync_with_stdio",
    score: [6, 12],
    alert: [2, 6],
    text: "IO 提速完成，摸鱼更隐蔽了。",
  },
];

let state = {
  running: false,
  timeLeft: GAME_DURATION,
  score: 0,
  alert: 0,
  combo: 1,
  streak: 0,
  timer: null,
  difficulty: "standard",
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function readBestScore() {
  const raw = localStorage.getItem(BEST_SCORE_KEY);
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function writeBestScore(score) {
  localStorage.setItem(BEST_SCORE_KEY, String(score));
}

function appendLog(text, type = "info") {
  const item = document.createElement("li");
  item.className = `log-item log-${type}`;
  item.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logList.prepend(item);
  const maxLogs = 60;
  while (logList.childElementCount > maxLogs) {
    logList.removeChild(logList.lastElementChild);
  }
}

function updateBars() {
  alertBarEl.style.width = `${Math.min(100, state.alert)}%`;
  const comboPercent = Math.min(100, Math.round((state.combo / 4) * 100));
  comboBarEl.style.width = `${comboPercent}%`;
}

function render() {
  timeLeftEl.textContent = String(state.timeLeft);
  scoreEl.textContent = String(state.score);
  alertEl.textContent = String(state.alert);
  comboEl.textContent = `x${state.combo}`;
  bestScoreEl.textContent = String(readBestScore());

  const disabled = !state.running;
  runBtn.disabled = disabled;
  commandInput.disabled = disabled;
  difficultySelect.disabled = state.running;
  updateBars();
}

function maybeTriggerRandomEvent() {
  if (!state.running) return;
  if (Math.random() > 0.2) return;

  if (Math.random() > 0.55) {
    const reduce = randInt(4, 9);
    state.alert = Math.max(0, state.alert - reduce);
    appendLog(`同学帮你挡了一波巡查，alert -${reduce}。`, "good");
  } else {
    const increase = randInt(5, 12);
    state.alert = Math.min(ALERT_LIMIT, state.alert + increase);
    appendLog(`教练突然巡场，alert +${increase}！`, "warn");
  }
}

function updateBestScoreIfNeeded() {
  const best = readBestScore();
  if (state.score > best) {
    writeBestScore(state.score);
    appendLog(`🎉 新纪录！最高摸鱼值刷新为 ${state.score}`, "result");
  }
}

function stopGame(reason) {
  state.running = false;
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  appendLog(reason, "warn");
  updateBestScoreIfNeeded();
  appendLog(`本局结束，最终摸鱼值：${state.score}`, "result");
  render();
}

function tick() {
  if (!state.running) return;
  state.timeLeft -= 1;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    stopGame("时间到！你卡点切回题解页面，成功伪装。");
    return;
  }

  maybeTriggerRandomEvent();

  if (state.alert >= ALERT_LIMIT) {
    stopGame("alertLevel 爆表，你被教练当场逮住。");
    return;
  }
  render();
}

function resetState() {
  state = {
    running: true,
    timeLeft: GAME_DURATION,
    score: 0,
    alert: 0,
    combo: 1,
    streak: 0,
    timer: null,
    difficulty: difficultySelect.value,
  };
  logList.innerHTML = "";
  const cfg = DIFFICULTY_CONFIG[state.difficulty] || DIFFICULTY_CONFIG.standard;
  appendLog(`新的一局开始！当前难度：${cfg.label}`, "info");
}

function findCommandConfig(input) {
  const lowered = input.toLowerCase();
  return COMMAND_TABLE.find((item) => lowered.includes(item.keyword.toLowerCase()));
}

function applyDifficulty(num, kind) {
  const cfg = DIFFICULTY_CONFIG[state.difficulty] || DIFFICULTY_CONFIG.standard;
  const factor = kind === "score" ? cfg.scoreMul : cfg.alertMul;
  return Math.round(num * factor);
}

function runCommand() {
  if (!state.running) return;
  const raw = commandInput.value.trim();
  if (!raw) {
    appendLog("空指令会触发 CE（Compile Error）！", "warn");
    return;
  }

  const config = findCommandConfig(raw);
  if (!config) {
    state.streak = 0;
    state.combo = 1;
    const penalty = applyDifficulty(randInt(5, 10), "alert");
    state.alert = Math.min(ALERT_LIMIT, state.alert + penalty);
    appendLog(`指令“${raw}”未通过评测，摸鱼失败并引起注意（alert +${penalty}）。`, "warn");
    if (state.alert >= ALERT_LIMIT) {
      stopGame("alertLevel 爆表，你被教练当场逮住。");
      return;
    }
    render();
    return;
  }

  state.streak += 1;
  if (state.streak >= 10) state.combo = 4;
  else if (state.streak >= 6) state.combo = 3;
  else if (state.streak >= 3) state.combo = 2;

  const baseScore = applyDifficulty(randInt(config.score[0], config.score[1]), "score");
  const scoreGain = baseScore * state.combo;
  const alertChange = applyDifficulty(randInt(config.alert[0], config.alert[1]), "alert");

  state.score += scoreGain;
  state.alert = Math.max(0, Math.min(ALERT_LIMIT, state.alert + alertChange));

  const alertText = alertChange >= 0 ? `alert +${alertChange}` : `alert ${alertChange}`;
  appendLog(`${config.text} +${scoreGain} 分（${alertText}）`, "good");

  if (state.alert >= ALERT_LIMIT) {
    stopGame("alertLevel 爆表，你被教练当场逮住。");
    return;
  }

  commandInput.value = "";
  render();
}

function startGame() {
  if (state.timer) {
    clearInterval(state.timer);
  }
  resetState();
  state.timer = setInterval(tick, 1000);
  render();
}

startBtn.addEventListener("click", startGame);
runBtn.addEventListener("click", runCommand);
hintBtn.addEventListener("click", () => {
  hintText.textContent = HINTS[randInt(0, HINTS.length - 1)];
});

commandInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    runCommand();
  }
});

document.querySelectorAll(".preset-btn").forEach((button) => {
  button.addEventListener("click", () => {
    commandInput.value = button.dataset.command || "";
    commandInput.focus();
  });
});

render();
