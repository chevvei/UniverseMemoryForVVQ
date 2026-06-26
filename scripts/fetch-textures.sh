#!/usr/bin/env bash
# 下载地月高清贴图到 public/textures/（CC0 / NASA 公开资源）
# 用户执行：bash scripts/fetch-textures.sh
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)/public/textures"
mkdir -p "$DIR"
echo "贴图目录：$DIR"
echo "请将以下贴图放入该目录（文件名需与 earth-moon.js 一致）："
echo "  earth_albedo.jpg     地球昼面反照率 (NASA Blue Marble)"
echo "  earth_normal.jpg     地球法线"
echo "  earth_specular.jpg   地球高光/海洋反光 (作 roughnessMap)"
echo "  earth_clouds.png     地球云层 (带透明)"
echo "  moon_albedo.jpg      月面反照率 (solarsystemscope 2k / NASA LRO)"
echo "  moon_displace.jpg    月面高程/置换图 (NASA LRO, 看清环形山凹坑)"
echo "推荐来源：https://www.solarsystemscope.com/textures/ (CC BY 4.0)"
echo "          https://svs.gsfc.nasa.gov/4720 (NASA 月球)"
