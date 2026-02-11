const GAME_DURATION = 90;
const ALERT_LIMIT = 100;

const commandInput = document.getElementById("commandInput");
const runBtn = document.getElementById("runBtn");
const startBtn = document.getElementById("startBtn");
const hintBtn = document.getElementById("hintBtn");
const hintText = document.getElementById("hintText");
const logList = document.getElementById("logList");

const timeLeftEl = document.getElementById("timeLeft");
const scoreEl = document.getElementById("score");
const alertEl = document.getElementById("alert");
const comboEl = document.getElementById("combo");

const HINTS = [
  "`while(true)` 很赚分，但会快速提升 alertLevel。",
  "`ios::sync_with_stdio(false);` 收益中等，风险较低，适合稳扎稳打。",
  "`memset` 可以降低 alertLevel，属于续命神技。",
  "连续 3 次成功操作后，Combo 倍率会明显提升。",
  "`priority_queue` 单次收益高，但也更容易被发现。",
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
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function appendLog(text, type = "info") {
  const item = document.createElement("li");
  item.className = `log-item log-${type}`;
  item.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logList.prepend(item);
}

function render() {
  timeLeftEl.textContent = String(state.timeLeft);
  scoreEl.textContent = String(state.score);
  alertEl.textContent = String(state.alert);
  comboEl.textContent = `x${state.combo}`;

  const disabled = !state.running;
  runBtn.disabled = disabled;
  commandInput.disabled = disabled;
}

function stopGame(reason) {
  state.running = false;
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  appendLog(reason, "warn");
  appendLog(`本局结束，最终摸鱼值：${state.score}`, "result");
  render();
}

function tick() {
  if (!state.running) return;
  state.timeLeft -= 1;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    stopGame("时间到！你卡点切回题解页面，成功伪装。");
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
  };
  logList.innerHTML = "";
  appendLog("新的一局开始！输入 C++ 风格指令开始摸鱼。", "info");
}

function findCommandConfig(input) {
  const lowered = input.toLowerCase();
  return COMMAND_TABLE.find((item) => lowered.includes(item.keyword.toLowerCase()));
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
    state.alert = Math.min(ALERT_LIMIT, state.alert + randInt(5, 10));
    appendLog(`指令“${raw}”未通过评测，摸鱼失败并引起注意。`, "warn");
    if (state.alert >= ALERT_LIMIT) {
      stopGame("alertLevel 爆表，你被教练当场逮住。");
    }
    render();
    return;
  }

  state.streak += 1;
  if (state.streak >= 6) state.combo = 3;
  else if (state.streak >= 3) state.combo = 2;

  const baseScore = randInt(config.score[0], config.score[1]);
  const scoreGain = baseScore * state.combo;
  const alertChange = randInt(config.alert[0], config.alert[1]);

  state.score += scoreGain;
  state.alert = Math.max(0, Math.min(ALERT_LIMIT, state.alert + alertChange));

  const alertText =
    alertChange >= 0 ? `alert +${alertChange}` : `alert ${alertChange}`;
  appendLog(`${config.text} +${scoreGain} 分（${alertText}）`, "good");

  if (state.alert >= ALERT_LIMIT) {
    stopGame("alertLevel 爆表，你被教练当场逮住。");
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
