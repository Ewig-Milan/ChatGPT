(function initProblemDetail() {
  const detail = document.getElementById("problemDetail");
  if (!detail) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const problem = id ? findProblemById(id) : null;

  if (!problem) {
    detail.innerHTML = "<h1>题目不存在</h1><p>可能已被删除，或链接参数有误。</p>";
    return;
  }

  const diffConfig = getDifficultyConfig(problem.difficulty);

  detail.innerHTML = `
    <h1>题目详情</h1>
    <p><strong>链接：</strong><a href="${problem.link}" target="_blank" rel="noopener noreferrer">${problem.link}</a></p>
    <p><strong>难度：</strong><span style="color:${diffConfig.color};font-weight:700;">${diffConfig.label}</span></p>
    <p><strong>当前题池：</strong>${problem.pool}</p>
    <p><strong>备注：</strong></p>
    <p>${problem.note || "（暂无备注）"}</p>
  `;
})();
