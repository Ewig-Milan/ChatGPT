const STORAGE_KEY = "oi-problem-pools";
const NEW_ADDED_KEY = "oi-problem-last-added";

const POOLS = [
  { key: "todo", name: "未开始的题", className: "pool pool-todo", badge: "蓝色分支" },
  { key: "coding", name: "已理解，待编码", className: "pool pool-coding", badge: "进行中" },
  { key: "done", name: "已完成的题", className: "pool pool-done", badge: "绿色分支" },
];

const DIFFICULTIES = [
  { value: "popular-minus", label: "普及/提高-", color: "#f6c348" },
  { value: "popular-plus", label: "普及+/提高", color: "#72c240" },
  { value: "advanced-minus", label: "提高+/省选-", color: "#5296d5" },
  { value: "provincial-minus", label: "省选/NOI-", color: "#9344c8" },
  { value: "noi", label: "NOI/NOI+/CTSC", color: "#131e66" },
];

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

function loadProblems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
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

function deleteProblem(id) {
  const all = loadProblems();
  const updated = all.filter((item) => item.id !== id);
  saveProblems(updated);
}

function moveProblemToNextPool(id) {
  const all = loadProblems();
  const nextOrder = { todo: "coding", coding: "done", done: "done" };
  const updated = all.map((item) => {
    if (item.id !== id) {
      return item;
    }
    return { ...item, pool: nextOrder[item.pool] || "done" };
  });
  saveProblems(updated);
}

function findProblemById(id) {
  return loadProblems().find((item) => item.id === id);
}

function getPoolName(poolKey) {
  const pool = POOLS.find((item) => item.key === poolKey);
  return pool ? pool.name : poolKey;
}

function getNewlyAddedId() {
  const id = sessionStorage.getItem(NEW_ADDED_KEY);
  if (id) {
    sessionStorage.removeItem(NEW_ADDED_KEY);
  }
  return id;
}

function initBoard() {
  const board = document.getElementById("board");
  if (!board) {
    return;
  }

  const problems = loadProblems();
  const template = document.getElementById("problemCardTemplate");
  const newId = getNewlyAddedId();
  board.innerHTML = "";

  POOLS.forEach((pool, poolIndex) => {
    const section = document.createElement("section");
    section.className = pool.className;

    const title = document.createElement("h2");
    title.innerHTML = `${pool.name} <small>${pool.badge}</small>`;
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

      const note = node.querySelector(".problem-note");
      note.textContent = problem.note || "（暂无备注）";

      const upgrade = node.querySelector(".upgrade-btn");
      if (poolIndex === POOLS.length - 1) {
        upgrade.disabled = true;
        upgrade.textContent = "已在最终题池";
      } else {
        upgrade.addEventListener("click", () => {
          moveProblemToNextPool(problem.id);
          initBoard();
        });
      }

      const remove = node.querySelector(".delete-btn");
      remove.addEventListener("click", () => {
        deleteProblem(problem.id);
        initBoard();
      });

      if (problem.id === newId) {
        node.classList.add("card-pop-in");
      }

      list.appendChild(node);
    });

    section.appendChild(list);
    board.appendChild(section);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBoard);
} else {
  initBoard();
}
