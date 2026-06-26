#!/usr/bin/env bash
# 下载飞船模型到 public/models/ship.glb
#
# 用法：
#   bash scripts/fetch-ship.sh <GLB_URL>
#
# 推荐来源（CC0 / 免费、无需登录）：
#   Poly Pizza  https://poly.pizza/    搜索 "spaceship"，进模型页点 Download → GLB，
#               复制直链（形如 https://static.poly.pizza/<id>.glb）
#   Quaternius  https://quaternius.com/ 的 Space Kit（CC0），解压后取其中某个 .glb
#
# 示例：
#   bash scripts/fetch-ship.sh https://static.poly.pizza/xxxxxxxx.glb

set -euo pipefail

URL="${1:-}"
DEST_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/models"
DEST="$DEST_DIR/ship.glb"

if [ -z "$URL" ]; then
  echo "用法: bash scripts/fetch-ship.sh <GLB_URL>"
  echo "请先到 https://poly.pizza/ 搜索 spaceship，复制 GLB 直链后重试。"
  exit 1
fi

mkdir -p "$DEST_DIR"

echo "下载模型: $URL"
curl -fL --retry 3 -o "$DEST" "$URL"

# 校验确实是 glTF 二进制（glTF 文件以魔数 "glTF" 开头）
MAGIC="$(head -c 4 "$DEST" || true)"
if [ "$MAGIC" != "glTF" ]; then
  echo "错误: 下载内容不是有效的 .glb（缺少 glTF 魔数）。请检查链接是否为直链 GLB。"
  rm -f "$DEST"
  exit 2
fi

SIZE="$(du -h "$DEST" | cut -f1)"
echo "完成: $DEST ($SIZE)"
echo "刷新页面即可看到真实飞船；若文件不存在则自动回退程序化飞船。"
