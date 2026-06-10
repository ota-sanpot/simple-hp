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

### 運用フロー

受注 → 回答URLを店舗に送付 → 回答がスプレッドシートに蓄積（＋メール通知）→ 写真を別途 LINE/メールで受領 → 制作開始
