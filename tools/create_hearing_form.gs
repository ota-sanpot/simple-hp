/**
 * シンプルホームページ制作（Simple Branding Web for FOOD）
 * 受注後ヒアリングフォームを自動生成する Google Apps Script。
 *
 * 使い方:
 *   1. https://script.google.com で「新しいプロジェクト」を作成
 *   2. このファイルの内容をエディタに貼り付けて保存
 *   3. 関数 create_hearing_form を選んで「実行」（初回は権限の承認が必要）
 *   4. 実行ログに出る「回答URL」を店舗に送付する
 *
 * 再生成する場合はもう一度実行する（フォームは毎回新規作成される。
 * 既存フォームは上書きされないので、不要になった旧フォームは手動で削除）。
 */

function create_hearing_form() {
  // フォーム本体
  const form = FormApp.create('【シンプルホームページ制作】ヒアリングフォーム');
  form.setDescription(
    'ご契約ありがとうございます。ホームページ制作に必要な情報をお伺いします。\n' +
      '所要時間はおよそ10〜15分です。わからない項目は空欄のままで大丈夫です。\n' +
      '※写真はこのフォームでは受け取りません。最後のご案内のとおり、別途LINEまたはメールでお送りください。'
  );

  // ---- ① 基本情報（1ページ目） ----
  form.addSectionHeaderItem().setTitle('① 基本情報');
  add_text(form, '店名（正式表記）', true, 'ホームページに載せる正式な表記でご記入ください');
  add_text(form, '店名ふりがな', true, null);
  add_choice(form, '業態', true, ['カフェ', '居酒屋', '焼肉', 'バー', 'ラーメン', '海鮮・寿司', 'イタリアン・洋食'], true);
  add_text(form, '電話番号', true, null);
  add_text(form, '住所', true, null);
  add_text(form, '最寄り駅とアクセス', true, '例: 蒲田駅 東口から徒歩3分');

  // ---- ② 営業情報 ----
  add_page(form, '② 営業情報', null);
  add_paragraph(
    form,
    '営業時間',
    true,
    '昼・夜・モーニングなど時間帯が分かれる場合はすべてご記入ください（L.O.もあれば）\n例: 11:30–14:30（L.O.14:00）/ 17:00–23:00（L.O.22:30）'
  );
  add_text(form, '定休日', true, '例: 月曜（祝日の場合は翌日）');
  add_text(form, '席数・席タイプ', false, '例: 20席（カウンター6・テーブル14）');
  add_text(form, '予算目安', false, '例: 昼 ¥1,000 / 夜 ¥4,000');
  add_checkbox(form, '支払い方法（使えるものすべて）', false, ['現金', 'クレジットカード', '交通系IC', 'QR決済（PayPayなど）'], true);
  add_choice(form, '喫煙・禁煙', false, ['全席禁煙', '全席喫煙可', '分煙', '喫煙ブースあり'], false);

  // ---- ③ お店の魅力 ----
  add_page(form, '③ お店の魅力', 'ホームページの「顔」になる部分です。思いつくまま自由にお書きください。');
  add_text(form, 'キャッチコピー', false, 'お店を一言で表すフレーズ。なければ「お任せ」とご記入ください（こちらでご提案します）');
  add_paragraph(form, 'お店のこだわり・自慢・ストーリー', true, '食材、調理法、創業のきっかけ、大事にしていることなど。箇条書きでもOKです');
  add_paragraph(
    form,
    '看板メニュー（最大3品）',
    true,
    '1品ずつ「名前・価格・ひとこと」を改行してご記入ください\n例: 特上厚切りタン ¥1,980 — 朝びき和牛タンを贅沢にカット'
  );
  add_paragraph(form, 'コース・食べ放題・飲み放題', false, 'あれば名称・価格・内容をご記入ください');

  // ---- ④ SNS・リンク類 ----
  add_page(form, '④ SNS・リンク類', 'ホームページからリンクするものを教えてください。');
  add_text(form, 'Instagram のURL（またはアカウント名）', false, null);
  add_paragraph(form, 'その他のSNS', false, 'TikTok / X / Facebook / LINE公式など。URLまたはアカウント名');
  add_paragraph(form, '予約方法', false, '例: 電話のみ / LINEで予約 / 食べログ（URL）など');
  add_text(form, 'Googleマップの店舗リンク', false, 'あれば。Googleマップでお店を開き「共有」からコピーできます');

  // ---- ⑤ ご利用ガイド ----
  add_page(form, '⑤ ご利用ガイド', 'お客様向けの利用案内に使います。');
  add_checkbox(form, '当てはまるもの（すべて）', false, ['予約可', '貸切可', 'お子様連れOK', 'ペットOK', 'テイクアウトあり', '駐車場あり'], false);
  add_text(form, 'チャージ・お通し・サービス料', false, '例: お通し ¥400 / チャージなし');
  add_paragraph(form, 'その他の利用案内', false, '上記以外に伝えておきたいルール・案内があれば');

  // ---- ⑥ デザインの好み・その他 ----
  add_page(form, '⑥ デザインの好み・その他', null);
  add_choice(form, '希望の雰囲気', false, ['落ち着いた・上質', 'カジュアル・親しみやすい', 'にぎやか・活気', 'モダン・スタイリッシュ', 'お任せ'], false);
  add_text(form, '好きな色・避けたい色', false, '例: 黒ベースが好き / 赤は避けたい');
  add_text(form, '参考にしたいサイト・お店', false, 'あればURLや店名');
  add_text(form, '載せたくない情報', false, '例: 店主の名前は出したくない など');
  add_paragraph(form, '質問・ご要望', false, null);

  // 写真別送の案内（送信前に表示）
  form
    .addSectionHeaderItem()
    .setTitle('【写真のお願い】')
    .setHelpText(
      '写真は別途 LINE またはメールでお送りください。\n' +
        '目安: 料理写真 5枚・外観 1枚・内観 2枚\n' +
        'スマホ撮影でOKです。多めに送っていただければ、こちらで選定します。'
    );

  // 送信完了画面のメッセージ
  form.setConfirmationMessage(
    'ご記入ありがとうございました。\n' +
      '写真（料理5枚・外観1枚・内観2枚 目安）を別途LINEまたはメールでお送りください。\n' +
      '初稿は最短1週間でお届けします。'
  );

  // 回答先スプレッドシートを作成して紐付け
  const ss = SpreadsheetApp.create('シンプルHP ヒアリング回答');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // 各種URLをログに出力（実行ログからコピーする）
  Logger.log('回答URL（店舗に送る）: ' + form.getPublishedUrl());
  Logger.log('短縮URL: ' + form.shortenFormUrl(form.getPublishedUrl()));
  Logger.log('編集URL（自分用）: ' + form.getEditUrl());
  Logger.log('回答スプレッドシート: ' + ss.getUrl());
}

// ---- 以下、質問追加のヘルパー ----

// 1行テキスト質問を追加
function add_text(form, title, required, help) {
  const item = form.addTextItem().setTitle(title).setRequired(required);
  if (help) item.setHelpText(help);
}

// 段落テキスト質問を追加
function add_paragraph(form, title, required, help) {
  const item = form.addParagraphTextItem().setTitle(title).setRequired(required);
  if (help) item.setHelpText(help);
}

// ラジオボタン質問を追加（show_other=true で「その他」入力欄つき）
function add_choice(form, title, required, values, show_other) {
  const item = form.addMultipleChoiceItem().setTitle(title).setRequired(required);
  item.setChoiceValues(values);
  if (show_other) item.showOtherOption(true);
}

// チェックボックス質問を追加（show_other=true で「その他」入力欄つき）
function add_checkbox(form, title, required, values, show_other) {
  const item = form.addCheckboxItem().setTitle(title).setRequired(required);
  item.setChoiceValues(values);
  if (show_other) item.showOtherOption(true);
}

// 新しいページ（セクション）を開始
function add_page(form, title, help) {
  const item = form.addPageBreakItem().setTitle(title);
  if (help) item.setHelpText(help);
}
