# 🎵 音圓節奏大挑戰 - HTML 版本

一個完全用 HTML5、CSS3 和 JavaScript 開發的節奏遊戲，無需任何依賴，可直接在瀏覽器中運行。

## 功能特性

- **三個難度等級**：簡單、普通、困難，每個難度有不同的音符速度和判定精度
- **即時反饋系統**：Perfect（100 分）、Good（50 分）、Miss（0 分）
- **連擊系統**：追蹤當前連擊和最高連擊
- **評級系統**：根據準確度給予 S/A/B/C/D 評級
- **高分榜**：使用本地存儲保存最高分
- **響應式設計**：支持桌面和手機設備
- **高性能**：使用 Canvas 進行優化的圖形渲染

## 快速開始

### 本地運行

1. 克隆或下載此倉庫
2. 在瀏覽器中打開 `game.html` 文件
3. 開始遊戲！

### 使用 Python 簡單服務器（推薦）

```bash
# Python 3
python -m http.server 8000

# 然後在瀏覽器中訪問
# http://localhost:8000
```

### 使用 Node.js http-server

```bash
# 全局安裝
npm install -g http-server

# 運行
http-server

# 訪問 http://localhost:8080
```

## 部署到 GitHub Pages

### 方法 1：直接上傳到 GitHub

1. 在 GitHub 上創建新倉庫，命名為 `username.github.io`（將 `username` 替換為您的 GitHub 用戶名）
2. 克隆倉庫到本地
3. 將 `game.html` 和 `game.js` 複製到倉庫根目錄
4. 提交並推送：
   ```bash
   git add .
   git commit -m "Initial commit: Add Rhythm Circle game"
   git push origin main
   ```
5. 訪問 `https://username.github.io` 即可玩遊戲

### 方法 2：在現有倉庫中創建 `docs` 文件夾

1. 在您的倉庫中創建 `docs` 文件夾
2. 將 `game.html` 和 `game.js` 放入 `docs` 文件夾
3. 在 GitHub 倉庫設置中，將 GitHub Pages 源設置為 `docs` 文件夾
4. 訪問 `https://username.github.io/repo-name` 即可玩遊戲

### 方法 3：使用 `gh-pages` 分支

1. 創建新分支 `gh-pages`
2. 將 `game.html` 和 `game.js` 推送到此分支
3. 在 GitHub 倉庫設置中，將 GitHub Pages 源設置為 `gh-pages` 分支
4. 訪問 `https://username.github.io/repo-name` 即可玩遊戲

## 遊戲說明

### 基本玩法

1. **選擇難度**：在主菜單中選擇簡單、普通或困難
2. **開始遊戲**：點擊「開始遊戲」按鈕
3. **點擊音符**：當音符移動到判定圈時點擊
4. **獲得分數**：根據判定精度獲得相應分數

### 判定標準

- **Perfect**：在最佳時機點擊（±25ms），獲得 100 分
- **Good**：在合理時機點擊（±50ms），獲得 50 分
- **Miss**：點擊太早或太晚，獲得 0 分並重置連擊

### 難度差異

| 難度 | 音符速度 | 判定窗口 | 音符頻率 |
|------|--------|--------|--------|
| 簡單 | 1.0x   | ±75ms  | 800ms  |
| 普通 | 1.5x   | ±50ms  | 600ms  |
| 困難 | 2.0x   | ±25ms  | 400ms  |

## 文件結構

```
rhythm-circle-html/
├── game.html          # 主 HTML 文件，包含 UI 和樣式
├── game.js             # 遊戲邏輯和引擎
└── README.md           # 本文件
```

## 技術棧

- **HTML5**：結構和語義化標記
- **CSS3**：樣式、動畫和響應式設計
- **Canvas API**：高性能圖形渲染
- **JavaScript ES6+**：遊戲邏輯和交互

## 瀏覽器兼容性

支持所有現代瀏覽器：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 性能優化

- 使用 Canvas 而非 DOM 進行圖形渲染
- 高效的碰撞檢測算法
- 自動清理過期音符
- 優化的動畫幀率（60fps）

## 未來改進

- [ ] 添加實際音樂和音效
- [ ] 多首歌曲支持
- [ ] 全球排行榜（需要後端）
- [ ] 自定義皮膚和主題
- [ ] 離線模式
- [ ] 移動應用版本

## 許可證

MIT License - 自由使用和修改

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 聯繫方式

如有問題或建議，請提交 GitHub Issue。

---

**祝您遊戲愉快！** 🎮🎵
