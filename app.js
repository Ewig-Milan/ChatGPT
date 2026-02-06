const STORAGE_KEY = "oi-problem-pools";
const NEW_ADDED_KEY = "oi-problem-last-added";
const UPGRADED_ANIMATED_KEY = "oi-problem-upgraded-id";
const UPGRADED_MESSAGE_KEY = "oi-problem-upgraded-message";

const POOLS = [
  { key: "todo", name: "To-do List", className: "pool pool-todo", badge: "" },
  { key: "coding", name: "Coding", className: "pool pool-coding", badge: "" },
  { key: "done", name: "Done！", className: "pool pool-done", badge: "" },
];

const DIFFICULTIES = [
  { value: "popular-minus", label: "普及/提高-", color: "#f6c348" },
  { value: "popular-plus", label: "普及+/提高", color: "#72c240" },
  { value: "advanced-minus", label: "提高+/省选-", color: "#5296d5" },
  { value: "provincial-minus", label: "省选/NOI-", color: "#9344c8" },
  { value: "noi", label: "NOI/NOI+/CTSC", color: "#131e66" },
];

const ENCOURAGEMENTS = ["Well done！", "Nice work！", "Keep going！", "太强啦！", "继续冲！"];

function uuid() {
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function getDifficultyConfig(value) {
  return DIFFICULTIES.find((item) => item.value === value) || DIFFICULTIES[0];
}

function extractProblemCode(link) {
  const match = link.match(/\/problem\/([^/?#]+)/i);
  return match ? match[1] : link;
}

function randomEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

function loadProblems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProblems(problems) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
}

function addProblem(problem) {
  const all = loadProblems();
  all.push(problem);
  saveProblems(all);
}

function updateProblem(id, patch) {
  const all = loadProblems();
  saveProblems(all.map((item) => (item.id === id ? { ...item, ...patch } : item)));
}

function deleteProblem(id) {
  const all = loadProblems();
  saveProblems(all.filter((item) => item.id !== id));
}

function moveProblemToNextPool(id) {
  const all = loadProblems();
  const nextOrder = { todo: "coding", coding: "done", done: "done" };
  saveProblems(
    all.map((item) => (item.id === id ? { ...item, pool: nextOrder[item.pool] || "done" } : item)),
  );
}

function findProblemById(id) {
  return loadProblems().find((item) => item.id === id);
}

function getNewlyAddedId() {
  const id = sessionStorage.getItem(NEW_ADDED_KEY);
  if (id) sessionStorage.removeItem(NEW_ADDED_KEY);
  return id;
}

function consumeUpgradeEffect() {
  const id = sessionStorage.getItem(UPGRADED_ANIMATED_KEY);
  const message = sessionStorage.getItem(UPGRADED_MESSAGE_KEY);
  if (id) sessionStorage.removeItem(UPGRADED_ANIMATED_KEY);
  if (message) sessionStorage.removeItem(UPGRADED_MESSAGE_KEY);
  return { id, message };
}

function showToast(message) {
  if (!message) return;

  const burst = document.createElement("div");
  burst.className = "firework-burst";
  const particleCount = 120;
  for (let i = 0; i < particleCount; i += 1) {
    const particle = document.createElement("span");
    particle.className = "firework-particle";
    const angle = (Math.PI * 2 * i) / particleCount;
    const maxRadius = window.innerWidth * 0.33;
    const distance = maxRadius * (0.55 + Math.random() * 0.45);
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--delay", `${Math.random() * 0.08}s`);
    particle.style.setProperty("--size", `${(1 + Math.random() * 4).toFixed(2)}px`);
    const colors = ["#f97316", "#f59e0b", "#f43f5e", "#ec4899", "#8b5cf6", "#22c55e", "#38bdf8"];
    particle.style.setProperty("--color", colors[Math.floor(Math.random() * colors.length)]);
    burst.appendChild(particle);
  }
  document.body.appendChild(burst);

  const toast = document.createElement("div");
  toast.className = "upgrade-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("visible");
    burst.classList.add("visible");
  }, 20);

  setTimeout(() => {
    toast.classList.remove("visible");
    burst.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
    setTimeout(() => burst.remove(), 450);
  }, 1700);
}

function getUpgradeButtonText(poolKey) {
  if (poolKey === "todo") return "理解";
  if (poolKey === "coding") return "提交";
  return "AC";
}

function initBoard() {
  const board = document.getElementById("board");
  if (!board) return;

  const problems = loadProblems();
  const template = document.getElementById("problemCardTemplate");
  const newId = getNewlyAddedId();
  const upgraded = consumeUpgradeEffect();
  board.innerHTML = "";

  POOLS.forEach((pool, poolIndex) => {
    const section = document.createElement("section");
    section.className = pool.className;

    const title = document.createElement("h2");
    title.innerHTML = pool.badge ? `${pool.name} <small>${pool.badge}</small>` : pool.name;
    section.appendChild(title);

    const list = document.createElement("div");
    list.className = "problem-list";

    const items = problems.filter((item) => item.pool === pool.key);

    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "暂时没有题目，点右上角“新增题目”开始吧。";
      list.appendChild(empty);
    }

    items.forEach((problem) => {
      const node = template.content.firstElementChild.cloneNode(true);
      const diffConfig = getDifficultyConfig(problem.difficulty);

      const titleLink = node.querySelector(".problem-title");
      titleLink.textContent = extractProblemCode(problem.link);
      titleLink.href = problem.link;

      const diffTag = node.querySelector(".difficulty");
      diffTag.textContent = diffConfig.label;
      diffTag.style.color = diffConfig.color;
      diffTag.style.fontWeight = "700";

      node.querySelector(".problem-note").textContent = problem.note || "（暂无备注）";

      const upgrade = node.querySelector(".upgrade-btn");
      upgrade.textContent = getUpgradeButtonText(pool.key);
      if (poolIndex === POOLS.length - 1) {
        upgrade.disabled = true;
      } else {
        upgrade.addEventListener("click", (event) => {
          event.stopPropagation();
          moveProblemToNextPool(problem.id);
          const msg = randomEncouragement();
          sessionStorage.setItem(UPGRADED_ANIMATED_KEY, problem.id);
          sessionStorage.setItem(UPGRADED_MESSAGE_KEY, msg);
          initBoard();
        });
      }

      node.addEventListener("click", (event) => {
        if (event.target.closest(".upgrade-btn") || event.target.closest(".problem-title")) return;
        window.location.href = `problem.html?id=${encodeURIComponent(problem.id)}`;
      });

      if (problem.id === newId) node.classList.add("card-pop-in");
      if (problem.id === upgraded.id) node.classList.add("card-upgrade-in");

      list.appendChild(node);
    });

    section.appendChild(list);
    board.appendChild(section);
  });

  showToast(upgraded.message);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBoard);
} else {
  initBoard();
}
