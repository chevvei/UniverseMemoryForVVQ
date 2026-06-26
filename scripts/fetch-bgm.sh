#!/usr/bin/env bash
# 下载进入 BGM 到 public/audio/bgm.mp3
#
# 用法：
#   bash scripts/fetch-bgm.sh <MP3_URL>
#
# 主题：星际穿越（Interstellar）风格的深邃、空灵氛围曲。
# 注意：Interstellar 原声（Hans Zimmer）有版权，请勿直接使用。
#       请选择「免版权 / CC0 / Royalty-free」的深空氛围曲（ambient / space / cinematic）。
#
# 推荐来源（免版权）：
#   Pixabay Music   https://pixabay.com/music/search/space%20ambient/   (无需署名，可商用)
#   Free Music Archive https://freemusicarchive.org/  (筛 CC0 / CC-BY)
#   Incompetech     https://incompetech.com/  (Kevin MacLeod, CC-BY)
#   在页面上找到 mp3 下载直链后传入本脚本。
#
# 示例：
#   bash scripts/fetch-bgm.sh https://cdn.pixabay.com/download/audio/xxxx.mp3

set -euo pipefail

URL="${1:-}"
DEST_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/audio"
DEST="$DEST_DIR/bgm.mp3"

if [ -z "$URL" ]; then
  echo "用法: bash scripts/fetch-bgm.sh <MP3_URL>"
  echo "请到 https://pixabay.com/music/search/space%20ambient/ 选一首免版权深空氛围曲，复制 mp3 直链后重试。"
  exit 1
fi

mkdir -p "$DEST_DIR"

echo "下载 BGM: $URL"
curl -fL --retry 3 -o "$DEST" "$URL"

# 校验确实是音频（mp3 以 ID3 标签或帧同步字节 0xFF 开头）
MAGIC="$(head -c 3 "$DEST" || true)"
FIRST_BYTE="$(head -c 1 "$DEST" | od -An -tx1 | tr -d ' ')"
if [ "$MAGIC" != "ID3" ] && [ "$FIRST_BYTE" != "ff" ]; then
  echo "错误: 下载内容不像有效的 mp3。请检查链接是否为直链 MP3。"
  rm -f "$DEST"
  exit 2
fi

SIZE="$(du -h "$DEST" | cut -f1)"
echo "完成: $DEST ($SIZE)"
echo "在首屏遮罩点击「进入」即会自动播放；若文件不存在则静默无声、不报错。"
