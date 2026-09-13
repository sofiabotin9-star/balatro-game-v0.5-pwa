#!/bin/bash
set -e
cd "$(dirname "$0")"

clear
echo "============================================"
echo "  私人小丑牌 - iOS Release 构建"
echo "============================================"
echo

if [ "$(uname -s)" != "Darwin" ]; then
  echo "这个文件只能在 Mac 上运行。"
  read -p "按回车退出..."
  exit 1
fi

if [ ! -d "src-tauri/gen/apple" ]; then
  echo "还没有生成 iOS 工程。请先运行 1_准备iOS工程.command"
  read -p "按回车退出..."
  exit 1
fi

echo "开始构建 iOS Release..."
echo "如果提示签名问题，请先在 Xcode 里选择 Apple ID / Team。"
echo
npm run ios:build

echo
echo "构建命令已经结束。"
read -p "按回车退出..."
