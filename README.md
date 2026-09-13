# 手机网页修改版

请先阅读同目录的 **手机网页_先看上传说明.txt**。

将本目录的全部内容复制到 GitHub Desktop 管理的仓库根目录，提交到 main 并推送；在 GitHub 仓库 Settings → Pages 选择 GitHub Actions。发布完成后，用 iPhone Safari 打开 Pages 网址。

- `src/`：修改后的完整源码。
- `public/`：图片、音频、PWA 资源。
- `dist/`：已构建的网页成品（GitHub Actions 会自动重新生成，不需要提交此目录）。
- `.github/workflows/deploy.yml`：GitHub Pages 自动发布配置。
- `src/phone-layout.css`：唯一启用的手机布局样式入口；旧 mobile/responsive 样式文件不再导入。
- `src/utils/fit-hand.js`：根据可用宽高和牌数计算手牌尺寸。

本地开发：Node.js 22，执行 `npm ci`、`npm run dev`。
生成网页：`npm run build`。默认使用相对资源路径；自动发布会使用 Pages 提供的实际路径。

原项目附带的 iOS/Tauri 工程和旧说明保留供参考；本次交付方式是网页发布，请以上述手机网页说明为准。
