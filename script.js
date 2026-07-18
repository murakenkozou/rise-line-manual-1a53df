// manual-site テンプレート script.js
// 役割は2つだけ:
// ① コピーボタン（.copy-btn の data-target が指す <pre> の中身をコピー）
// ② スクショ画像が未配置なら「準備中」プレースホルダーに差し替え
// プロンプト本文は HTML の <pre> に直接書く（このファイルの編集は不要）。

async function copyText(text, target) {
  let ok = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      ok = true;
    }
  } catch {
    ok = false;
  }
  // file:// でのローカル確認など clipboard API が使えない環境向けの保険
  if (!ok && target) {
    const range = document.createRange();
    range.selectNodeContents(target);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    sel.removeAllRanges();
  }
  return ok;
}

document.querySelectorAll(".copy-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.target);
    // data-targetの書き換え忘れ（章の複製ミス等）を検品で気づけるようにする
    if (!target) {
      button.textContent = "コピー対象が見つかりません";
      setTimeout(() => { button.textContent = "コピー"; }, 2000);
      return;
    }
    const text = target.textContent.trim();
    const ok = await copyText(text, target);
    button.textContent = ok ? "コピーしました" : "手動でコピーしてください";
    button.classList.toggle("copied", ok);
    setTimeout(() => {
      button.textContent = "コピー";
      button.classList.remove("copied");
    }, 2000);
  });
});

// 画像が未配置のときは「準備中」枠に差し替え（CSPで inline onerror が使えないためJSで処理）
document.querySelectorAll("figure.shot img").forEach((img) => {
  const toPlaceholder = () => {
    const figure = img.closest("figure.shot");
    if (!figure || figure.classList.contains("is-placeholder")) return;
    figure.classList.add("is-placeholder");
    const file = (img.getAttribute("src") || "").split("/").pop();
    const box = document.createElement("div");
    box.className = "shot-placeholder";
    box.textContent = "📸 スクリーンショット準備中（" + file + "）";
    img.replaceWith(box);
  };
  img.addEventListener("error", toPlaceholder);
  // すでに読み込み失敗済み（キャッシュ等でerrorイベントを取り逃した場合）の保険
  if (img.complete && img.naturalWidth === 0) toPlaceholder();
});
