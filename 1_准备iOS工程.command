#!/bin/bash
set -e
cd "$(dirname "$0")"

clear
echo "============================================"
echo "  私人小丑牌 - iPhone 单机版准备工具"
echo "============================================"
echo

if [ "$(uname -s)" != "Darwin" ]; then
  echo "这个工具只能在 Mac 上运行。"
  echo "Windows 可以继续开发和试玩，但真正生成 iPhone App 必须经过 macOS + Xcode。"
  echo
  read -p "按回车退出..."
  exit 1
fi

echo "[1/6] 检查 Xcode..."
if ! /usr/bin/xcodebuild -version >/dev/null 2>&1; then
  echo
  echo "没有检测到完整 Xcode。"
  echo "请先从 Mac App Store 安装 Xcode，打开一次完成初始化，然后再运行本文件。"
  echo
  read -p "按回车退出..."
  exit 1
fi
/usr/bin/xcodebuild -version
echo

echo "[2/6] 检查 Node.js..."
if ! command -v node >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "未检测到 Node.js，正在使用 Homebrew 安装..."
    brew install node
  else
    echo "未检测到 Node.js，也没有 Homebrew。"
    echo "请先安装 Node.js LTS，然后重新运行本文件。"
    echo
    read -p "按回车退出..."
    exit 1
  fi
fi
node --version
npm --version
echo

echo "[3/6] 检查 Rust..."
if ! command -v rustup >/dev/null 2>&1; then
  echo "正在安装 Rust..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  source "$HOME/.cargo/env"
fi
rustc --version
cargo --version
echo

echo "[4/6] 安装 iOS Rust 目标..."
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios || true
echo

echo "[5/6] 安装游戏组件并检查网页构建..."
npm ci
npm run build
echo

echo "[6/6] 生成 Tauri iOS 工程..."
if [ -d "src-tauri/gen/apple" ]; then
  echo "iOS 工程已经存在，跳过初始化。"
else
  npm run ios:init
fi

echo
echo "============================================"
echo "准备完成。"
echo "下一步请双击：2_打开iOS工程.command"
echo "============================================"
echo
read -p "按回车退出..."
