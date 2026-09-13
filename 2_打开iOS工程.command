#!/bin/bash
set -e
cd "$(dirname "$0")"

clear
echo "============================================"
echo "  私人小丑牌 - 打开 iOS / Xcode"
echo "============================================"
echo

if [ "$(uname -s)" != "Darwin" ]; then
  echo "这个文件只能在 Mac 上运行。"
  read -p "按回车退出..."
  exit 1
fi

if [ ! -d "src-tauri/gen/apple" ]; then
  echo "还没有生成 iOS 工程。"
  echo "请先双击：1_准备iOS工程.command"
  echo
  read -p "按回车退出..."
  exit 1
fi

echo "正在让 Tauri 打开 Xcode..."
echo "第一次使用时，在 Xcode 的 Signing & Capabilities 中选择你的 Apple ID / Team。"
echo "然后连接 iPhone，选择你的 iPhone 作为运行设备并点 Run。"
echo
npm run ios:dev -- --open
