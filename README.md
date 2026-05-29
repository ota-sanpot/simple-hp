# Simple Branding Web for Food — 大田区サンポット

飲食店のための、1ページで完結する **ブランディング・ウェブ**。
制作費 ¥25,000・月額 ¥0 で「お店のデジタル看板」を作るサービスの公式LP。

- 公開URL: https://ota-sanpot.github.io/simple-hp/
- 通称（商品名）: シンプルホームページ制作
- 設計書: `../../docs/superpowers/specs/2026-05-29-simple-hp-lp-design.md`
- 実装プラン: `../../docs/superpowers/plans/2026-05-29-simple-hp-lp.md`
- 親サービス（GURUMA・SNSコンサル）: https://ota-sanpot.github.io/sns_consul/
- 親メディア（大田区サンポット）: https://ota-sanpot.com/

## ローカルプレビュー

```bash
python3 -m http.server 8765
```

→ http://localhost:8765

## デザイン制約

- フォント: Noto Sans JP のみ（serif 不可、日本語 italic 不可）
- カラー: paper / kinari / gold / goldlt / sumi（design tokens は `<head>` 内 Tailwind config 参照）
- ホスト: GitHub Pages（`main` ブランチ root）
