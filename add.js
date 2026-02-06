(function initAddPage() {
  const form = document.getElementById("addForm");
  const select = document.getElementById("problemDifficulty");
  if (!form || !select) {
    return;
  }

  function applySelectedDifficultyStyle() {
    const config = getDifficultyConfig(select.value);
    select.style.color = config.color;
    select.style.fontWeight = "700";
  }

  DIFFICULTIES.forEach((difficulty) => {
    const option = document.createElement("option");
    option.value = difficulty.value;
    option.textContent = difficulty.label;
    option.style.color = difficulty.color;
    option.style.fontWeight = "700";
    select.appendChild(option);
  });

  applySelectedDifficultyStyle();
  select.addEventListener("change", applySelectedDifficultyStyle);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.classList.add("submitting");

    const link = document.getElementById("problemLink").value.trim();
    const difficulty = document.getElementById("problemDifficulty").value;
    const note = document.getElementById("problemNote").value.trim();
    const id = uuid();

    addProblem({
      id,
      link,
      difficulty,
      note,
      pool: "todo",
    });

    sessionStorage.setItem("oi-problem-last-added", id);
    window.location.href = "index.html";
  });
})();
