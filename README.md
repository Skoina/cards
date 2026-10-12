# 卡卡塔羅屋 · Luca Oracle

手機直立塔羅網頁，包含 22 張狗狗大阿爾克那、九個主題、27 個點選提問、正逆位解讀、牌圖鑑與瀏覽器收藏紀錄。

## 部署到 GitHub Pages

1. 解壓縮 ZIP，把裡面的所有檔案與 `assets` 資料夾上傳至 GitHub 儲存庫的根目錄。請確認根目錄直接看得到 `index.html`；不是把整個 ZIP 檔上傳，也不要再多包一層資料夾。
2. 到儲存庫 **Settings → Pages**。
3. 在 **Build and deployment → Source** 選 **Deploy from a branch**。
4. 選 **main** 分支與 **/ (root)**，按 **Save**。如果使用其他分支，選你上傳檔案的分支。
5. 等 GitHub Pages 發布完成，使用 Pages 頁面顯示的網站網址。

這是純靜態網站，不需要安裝套件、執行建置、設定 API 金鑰或連接資料庫。所有圖片和音樂使用相對路徑，可用於 `使用者.github.io/儲存庫名稱/` 形式的專案網站。`.nojekyll` 用來直接發布靜態檔案。

官方說明：[GitHub Pages 發布來源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)、[建立網站與入口檔案](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)。

## 背景音樂

- 音樂：使用者提供的 **The Oracle’s Breath**，檔案位於 `assets/audio/the-oracles-breath.mp3`。
- 點選「開始抽牌」時啟動循環播放，或在頁面右上角按「播放音樂」。
- 右上角可以隨時暫停。暫停偏好會保存在目前瀏覽器，之後再抽牌不會自行恢復；按播放可重新開啟。
- 初始音量設定為 32%；部分手機瀏覽器依裝置音量控制。
- 瀏覽器通常禁止未經點選的有聲自動播放，因此剛開啟網頁時會先保持安靜。[播放政策說明](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)

## 使用與紀錄

全程點選，不需要打字。每次抽三張不重複的牌，依序代表「此刻狀態／需要看見／下一步」。本版包含 22 張大阿爾克那，並非傳統 78 張完整牌組；完整結構與解讀方式已放在網頁詳細說明中。

紀錄只保存在目前瀏覽器，不會同步到 GitHub。更換網址、瀏覽器或清除網站資料後，可能無法讀取之前的紀錄；可以下載文字解讀作為備份。內容供娛樂與自我探索。
