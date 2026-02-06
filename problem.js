(function initProblemDetail() {
  const form = document.getElementById("problemSettingsForm");
  if (!form) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const problem = id ? findProblemById(id) : null;

  if (!problem) {
    form.innerHTML = "<h2>题目不存在</h2><p>可能已被删除，或链接参数有误。</p>";
    return;
  }

  const options = DIFFICULTIES.map(
    (d) => `<option value="${d.value}" style="color:${d.color};font-weight:700;" ${d.value === problem.difficulty ? "selected" : ""}>${d.label}</option>`,
  ).join("");

  form.innerHTML = `
    <h2 class="settings-title">${extractProblemCode(problem.link)}</h2>

    <label>
      题目链接
      <input id="editLink" type="url" required value="${problem.link}" />
    </label>

    <label>
      题目难度
      <select id="editDifficulty" required>${options}</select>
    </label>

    <label>
      备注
      <textarea id="editNote" rows="5" placeholder="写下你的理解、卡点、注意点...">${problem.note || ""}</textarea>
    </label>

    <div class="row">
      <button class="button primary" type="submit">保存设置</button>
      <button class="button danger" id="deleteInside" type="button">删除题目</button>
    </div>
  `;

  const difficultySelect = document.getElementById("editDifficulty");
  const applySelectedDifficultyStyle = () => {
    const cfg = getDifficultyConfig(difficultySelect.value);
    difficultySelect.style.color = cfg.color;
    difficultySelect.style.fontWeight = "700";
  };
  applySelectedDifficultyStyle();
  difficultySelect.addEventListener("change", applySelectedDifficultyStyle);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    updateProblem(problem.id, {
      link: document.getElementById("editLink").value.trim(),
      difficulty: difficultySelect.value,
      note: document.getElementById("editNote").value.trim(),
    });

    window.location.href = "index.html";
  });

  const deleteBtn = document.getElementById("deleteInside");
  deleteBtn.addEventListener("click", () => {
    deleteProblem(problem.id);
    window.location.href = "index.html";
  });
})();
