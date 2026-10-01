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
- カラー: ink / paper / gold ほか（design tokens は `<head>` 内 `:root` の CSS 変数。2026-09-30 リデザインで Tailwind 廃止）
- 写真: `assets/photo/`（Unsplash）、サンプル画面: `assets/works/`（pcN / spN.webp、サンプル更新時は撮り直す）
- ホスト: GitHub Pages（`main` ブランチ root）

## ヒアリングフォーム（受注後に店舗へ送る）

受注後ヒアリング用の Google フォームは `tools/create_hearing_form.gs` で自動生成する。

### 生成手順（初回 or 再生成）

1. https://script.google.com で「新しいプロジェクト」を作成
2. `tools/create_hearing_form.gs` の内容を貼り付けて保存
3. 関数 `create_hearing_form` を選んで「実行」（初回は権限の承認が必要）
4. 実行ログの「回答URL」を控える → 受注した店舗に LINE 等で送付

質問を直したいときは `.gs` を修正してコミット → 再実行（フォームは新規作成される。旧フォームは手動で削除）。

### メール通知を ON にする（手動・1回だけ）

Google の仕様でスクリプトから設定できないため、生成後に:

1. 実行ログの「編集URL」からフォームを開く
2. 「回答」タブ → 右上の︙ → 「新しい回答についてのメール通知を受け取る」にチェック

### 運用フロー（v2・2026-10-01）

受注 → 回答URLを店舗に送付 → 回答が届くと「【制作指示書】店名」メールが自動で届く（本文＝Markdown、.md 添付つき。回答はスプレッドシートにも蓄積）→ 写真を LINE/メールで受領 → 指示書を Claude Code に貼って `/simple-hp-build` → `tools/BUILD_GUIDE.md` の手順どおりに制作。

- メールを見逃したら、スクリプトで `export_latest_brief` を実行すると最新回答の指示書を再送する
- 初回実行時は、フォーム作成に加えてメール送信・送信時トリガーの権限承認が出る
- 制作側のルール（事実は推測しない／写真と料理名を一致させる／未回答の既定値）は `tools/BUILD_GUIDE.md` が正
