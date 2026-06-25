import { processFile } from '../upload/compress.js';

export function createUploadPanel(container) {
  const panel = document.createElement('div');
  panel.className = 'upload-panel';
  panel.innerHTML = `
    <div class="upload-box">
      <div class="upload-title">上传记忆</div>
      <label class="upload-drop">
        <input type="file" accept="image/*,video/*" hidden data-file />
        <span data-droptext>点此选择图片 / 视频<br><small>图片自动压缩 · 视频 ≤ 25MB</small></span>
      </label>
      <input type="text" class="upload-caption" placeholder="写一句话…（可选）" data-caption />
      <div class="upload-status" data-status></div>
      <div class="upload-actions">
        <button data-cancel>取消</button>
        <button class="primary" data-confirm disabled>添加到星球</button>
      </div>
    </div>
  `;
  container.appendChild(panel);

  const fileInput = panel.querySelector('[data-file]');
  const dropText = panel.querySelector('[data-droptext]');
  const captionInput = panel.querySelector('[data-caption]');
  const statusEl = panel.querySelector('[data-status]');
  const confirmBtn = panel.querySelector('[data-confirm]');
  const cancelBtn = panel.querySelector('[data-cancel]');

  let prepared = null;
  let onSubmit = null;

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    statusEl.textContent = '处理中…';
    confirmBtn.disabled = true;
    prepared = null;
    try {
      prepared = await processFile(file);
      dropText.innerHTML = `已选择：${file.name}`;
      statusEl.textContent = prepared.type === 'image' ? '图片已压缩 ✓' : '视频已就绪 ✓';
      confirmBtn.disabled = false;
    } catch (e) {
      statusEl.textContent = e.message;
    }
  });

  confirmBtn.addEventListener('click', () => {
    if (!prepared) return;
    const card = { ...prepared, caption: captionInput.value.trim(), date: new Date().toISOString().slice(0, 10) };
    if (onSubmit) onSubmit(card);
    close();
  });
  cancelBtn.addEventListener('click', close);

  function open(handler) {
    onSubmit = handler;
    prepared = null;
    fileInput.value = '';
    captionInput.value = '';
    dropText.innerHTML = '点此选择图片 / 视频<br><small>图片自动压缩 · 视频 ≤ 25MB</small>';
    statusEl.textContent = '';
    confirmBtn.disabled = true;
    panel.classList.add('open');
  }
  function close() {
    panel.classList.remove('open');
    onSubmit = null;
  }

  return { open, close };
}
