/**
 * シンプルホームページ制作（Simple Branding Web for FOOD）
 * ヒアリングフォーム v2 を自動生成する Google Apps Script。
 *
 * v2 の狙い（2026-10-01）:
 *   回答をそのまま Claude Code に渡せば、推測なしで再現性高くサイトが作れること。
 *   - 「事実」（店名・住所・価格・営業時間など）は漏れなく正確に集める
 *   - 「好み」（雰囲気・色・文字・トーン）は選択式で具体的な設計値に落とせる形で聞く
 *   - 「目的」（誰に来てほしいか・見た人に何をしてほしいか）でページの主役を決める
 *   - 回答が届くと Markdown の「制作指示書」が自分宛にメールされる（そのまま Claude Code に貼る）
 *   制作側の手順は tools/BUILD_GUIDE.md（Claude Code では /simple-hp-build）。
 *
 * 使い方:
 *   1. https://script.google.com で「新しいプロジェクト」を作成
 *   2. このファイルの内容をエディタに貼り付けて保存
 *   3. 関数 create_hearing_form を選んで「実行」（初回は権限の承認が必要）
 *   4. 実行ログに出る「回答URL」をお客様に送る
 *   回答のたびに「【制作指示書】店名」メールが届く（本文と .md 添付が同じ内容）。
 *   メールを見逃したときは export_latest_brief を実行すると、最新回答の指示書をログとメールで再出力する。
 *
 * 質問を変えたら再実行（フォームは毎回新規作成。旧フォームとトリガーは手動で削除）。
 */

// ============================================================
// 設定
// ============================================================

// サンプル店舗（デザインの好みを聞くときに見てもらう）
const SAMPLE_SITES = [
  ['V1 和食・割烹（しっとり・上品）', 'https://ota-sanpot.github.io/sample_store/'],
  ['V2 海鮮居酒屋（活気・シズル感）', 'https://ota-sanpot.github.io/sample_store_v2/'],
  ['V3 カフェ・ベーカリー（明るい・やわらか）', 'https://ota-sanpot.github.io/sample_store_v3/'],
  ['V4 焼肉（黒×炎・力強い）', 'https://ota-sanpot.github.io/sample_store_v4/'],
  ['V5 ワインビストロ・バー（夜・大人っぽい）', 'https://ota-sanpot.github.io/sample_store_v5/'],
  ['V6 ラーメン・町中華（元気・ポップ）', 'https://ota-sanpot.github.io/sample_store_v6/'],
];

// 指示書メールの宛先（空ならスクリプト実行者のアドレス）
const BRIEF_MAIL_TO = '';

// ============================================================
// フォーム生成
// ============================================================

function create_hearing_form() {
  const form = FormApp.create('【シンプルホームページ制作】ヒアリングフォーム');
  form.setDescription(
    'このたびはご依頼ありがとうございます。\n' +
      'ここでいただいた内容を、そのままホームページの設計図にします。\n\n' +
      '・所要時間はおよそ15〜20分です（途中の「次へ」で進みます）\n' +
      '・「必須」以外はわかる範囲で大丈夫です。空欄の項目は、こちらからご提案します\n' +
      '・価格や営業時間などは、ホームページにそのまま載ります。正確にご記入ください\n' +
      '・写真はこのフォームでは受け取りません。最後のご案内のとおり LINE またはメールでお送りください'
  );
  form.setProgressBar(true);
  form.setCollectEmail(false);

  // ---- ① お店の基本情報 ----
  form.addSectionHeaderItem().setTitle('① お店の基本情報').setHelpText('ホームページの「店舗情報・アクセス」にそのまま載せる内容です。');
  add_text(form, '店名（正式表記）', true, 'ホームページに載せる正式な表記。記号・スペースも実際の表記どおりに');
  add_text(form, '店名の読み（ふりがな）', true, null);
  add_text(form, '店名の英字表記', false, 'あれば。例: Dining OWL');
  add_choice(form, '業態', true, ['和食・割烹', '居酒屋', '海鮮・寿司', '焼肉・焼き鳥', 'ラーメン・町中華', 'カフェ・喫茶', 'ベーカリー・スイーツ', 'バー・ワインバー', 'イタリアン・フレンチ・洋食', 'アジア・エスニック'], true);
  add_text(form, '住所（ビル名・階数まで）', true, '例: 東京都大田区蒲田5-1-1 サンポットビル2F');
  add_text(form, '最寄り駅と道順', true, '例: JR蒲田駅 東口から徒歩3分。1階がコンビニのビルの2階');
  add_text(form, 'ホームページに載せる電話番号', true, '予約・問い合わせを受ける番号。載せない場合は「掲載しない」');
  add_paragraph(form, '営業時間', true,
    '曜日や時間帯で違う場合はすべて。ラストオーダーもあれば\n' +
      '例:\n月〜金 11:30〜14:00（L.O.13:30）／17:00〜23:00（L.O.22:30）\n土日祝 17:00〜22:00');
  add_text(form, '定休日', true, '例: 月曜（祝日の場合は翌火曜）／不定休（Instagramでお知らせ）');
  add_text(form, '開業年', false, '例: 2019年。「創業◯年」などの表記に使います');

  // ---- ② ホームページの目的 ----
  add_page(form, '② ホームページの目的', 'ここがいちばん大事です。ページの「主役」と「一番目立つボタン」が決まります。');
  add_choice(form, 'ホームページを作る一番の目的（1つ）', true, [
    '新しいお客様に見つけてもらいたい',
    'SNSやグルメサイトから来た人に、お店の魅力を伝えたい',
    '予約を増やしたい',
    '宴会・団体・貸切の問い合わせを増やしたい',
    'ランチ・テイクアウトを知ってもらいたい',
    '取引先・取材・採用などで「ちゃんとしたお店」と伝えたい',
  ], true);
  add_choice(form, 'ホームページを見た人に、最後にしてほしい行動（1つ）', true, [
    '電話で予約・問い合わせ',
    'ネット予約（ホットペッパー・食べログ・TableCheckなど）',
    'LINEで予約・友だち追加',
    'Instagramを見てフォローしてもらう',
    'Googleマップで道順を見て、そのまま来店',
  ], true);
  add_choice(form, '2番目にしてほしい行動（任意）', false, [
    '電話で予約・問い合わせ',
    'ネット予約',
    'LINEで予約・友だち追加',
    'Instagramを見てフォローしてもらう',
    'Googleマップで道順を見て、そのまま来店',
  ], false);
  add_checkbox(form, '来てほしいお客様の利用シーン（いくつでも）', true, [
    'ひとり飲み・ひとりご飯', '仕事帰りのサク飲み', 'デート・記念日', '友人・女子会', '家族・子ども連れ',
    '接待・会食', '宴会・歓送迎会', 'ランチ', 'カフェ利用・作業', 'テイクアウト',
  ], true);
  add_text(form, '来てほしいお客様像', false, '年代・性別・住んでいる/働いている場所など。例: 蒲田で働く30〜40代、仕事帰りの男性ひとり客');

  // ---- ③ お店の魅力 ----
  add_page(form, '③ お店の魅力', 'キャッチコピーや紹介文の材料になります。箇条書き・話し言葉のままで大丈夫です。');
  add_paragraph(form, 'ほかのお店と違うところ（3つ）', true, '食材・仕入れ・調理法・価格・雰囲気・接客など。例:\n1. 毎朝市場で仕入れる鮮魚\n2. 全国の純米酒を30種類\n3. 22時以降もしっかり食事ができる');
  add_paragraph(form, 'お客様によく言われる褒め言葉', false, '口コミやお客様との会話でよく出る言葉。そのままコピーに使えることが多いです');
  add_paragraph(form, 'お店を始めたきっかけ・大事にしている想い', false, '店主の想いとして載せます');
  add_text(form, 'これだけは必ず伝えたいこと（1つ）', true, '例: 1人でも気軽に入れる店だということ');
  add_text(form, 'キャッチコピーの案', false, 'あれば。なければ「お任せ」（こちらで3案ご提案します）');
  add_choice(form, '店主・スタッフの名前や写真の掲載', false, ['名前も写真も載せてOK', '名前だけOK', '写真だけOK', 'どちらも載せない'], false);
  add_paragraph(form, '店主・料理人の経歴やこだわり', false, '載せてよい範囲で。例: 銀座の割烹で10年修業');

  // ---- ④ メニュー ----
  add_page(form, '④ メニュー', 'ホームページのメニュー欄に載せる内容です。価格はそのまま掲載します。');
  add_choice(form, 'メニュー価格の表示', true, ['税込', '税抜（「税抜」と併記）'], false);
  add_paragraph(form, '看板メニュー（3〜5品）', true,
    '1品ずつ「品名／価格／ひとこと」を1行で。写真がある品には（写真あり）と添えてください\n' +
      '例:\n特上厚切りタン／1,980円／朝びき和牛を2cmの厚切りで（写真あり）\n自家製ポテサラ／480円／燻製たまご入り');
  add_choice(form, 'その他のメニューの載せ方', true, [
    'メニュー表の写真を送るので、そこから載せてほしい',
    '下の欄に書く',
    '看板メニューだけでよい',
  ], false);
  add_paragraph(form, 'その他のメニュー（カテゴリごと）', false, '例:\n【焼き物】ねぎま 220円／つくね 250円\n【ドリンク】生ビール 580円／ハイボール 450円');
  add_paragraph(form, 'コース・飲み放題・ランチ', false, 'あれば「名称／価格／内容／条件（人数・予約要否）」を');
  add_choice(form, 'メニューの入れ替わり', false, ['ほぼ固定', '季節ごとに変わる', '日替わり・週替わりがある'], false);

  // ---- ⑤ 店内・ご利用案内 ----
  add_page(form, '⑤ 店内・ご利用案内', 'お客様向けの「ご利用案内」に使います。');
  add_text(form, '席数と席の種類', false, '例: 24席（カウンター8・テーブル16）／個室1部屋（6名まで）');
  add_text(form, '予算の目安（お一人あたり）', false, '例: ランチ 1,000円／ディナー 4,000〜5,000円');
  add_checkbox(form, '当てはまるもの（いくつでも）', false, [
    '予約できる', '貸切できる', '個室あり', 'おひとり様歓迎', '子ども連れOK', 'ペットOK',
    'テイクアウトあり', 'デリバリーあり', '駐車場あり', 'Wi-Fiあり', '電源あり', '英語メニューあり',
  ], false);
  add_checkbox(form, '支払い方法（使えるものすべて）', false, ['現金', 'クレジットカード', '交通系IC', 'QR決済（PayPayなど）'], true);
  add_choice(form, '喫煙', false, ['全席禁煙', '喫煙可', '分煙', '喫煙ブースあり'], false);
  add_text(form, 'お通し・チャージ・サービス料', false, '例: お通し 400円／チャージなし');
  add_paragraph(form, 'その他の利用ルール・案内', false, '例: 2時間制／18歳未満は22時まで');

  // ---- ⑥ デザインの好み ----
  const sample_help = SAMPLE_SITES.map(function (s) { return s[0] + '\n' + s[1]; }).join('\n');
  add_page(form, '⑥ デザインの好み', '下のサンプルをスマホで開いて、近いものを選んでください。\n\n' + sample_help);
  add_checkbox(form, 'いちばん近いサンプル（2つまで）', true, SAMPLE_SITES.map(function (s) { return s[0]; }).concat(['どれも違う']), false, 2);
  add_checkbox(form, 'お店の雰囲気に近い言葉（3つまで）', true, [
    '高級感', '落ち着き', '温かみ', '気軽・カジュアル', 'にぎやか・活気', 'モダン・洗練',
    '和', '洋', 'レトロ・昭和', 'ナチュラル', 'かわいい', '力強い・男っぽい',
  ], false, 3);
  add_choice(form, 'ページ全体の明るさ', true, ['暗め（黒・濃い色が基調）', '明るめ（白・生成りが基調）', '木やベージュなど中間', 'お任せ'], false);
  add_text(form, '使ってほしい色・お店のテーマカラー', false, '看板・のれん・ロゴ・制服の色など。例: のれんの藍色');
  add_text(form, '使ってほしくない色', false, null);
  add_choice(form, '文字の雰囲気', false, ['明朝体（上品・和）', 'ゴシック体（すっきり・現代的）', '手書き風（あたたかい）', 'お任せ'], false);
  add_choice(form, '文章のトーン', false, ['丁寧・上品', '親しみやすい・くだけた', '職人らしく簡潔', 'お任せ'], false);
  add_choice(form, 'ロゴ', true, ['ロゴデータがあるので送る', '看板やのれんの写真から起こしてほしい', 'ロゴはない（店名を文字で見せる）'], false);
  add_paragraph(form, '好きなホームページ・Instagram と、好きなところ', false, 'URLまたはお店の名前と、「写真が大きい」「文字が少ない」など好きな点');
  add_paragraph(form, 'こうはしたくない、というイメージ', false, '例: チェーン店っぽいのは嫌／キラキラしすぎは避けたい');

  // ---- ⑦ SNS・予約・リンク ----
  add_page(form, '⑦ SNS・予約・リンク', 'ホームページからつなぐ先です。URLがわからなければアカウント名だけでも大丈夫です。');
  add_text(form, 'Instagram', false, 'URL または @アカウント名');
  add_text(form, 'LINE公式アカウント', false, '友だち追加URL または ID');
  add_paragraph(form, 'その他のSNS', false, 'TikTok／X／Facebook などのURLまたはアカウント名');
  add_checkbox(form, '予約の受け方（いくつでも）', false, ['電話', 'ホットペッパー', '食べログ', '一休', 'TableCheck', 'LINE', 'Instagram DM', '予約は受けていない'], true);
  add_paragraph(form, 'ネット予約ページのURL', false, 'ネット予約がある場合');
  add_text(form, 'Googleマップのお店のURL', false, 'Googleマップでお店を開き「共有」→「リンクをコピー」');
  add_paragraph(form, 'グルメサイトのページURL', false, '食べログ・ぐるなび・Retty など');
  add_text(form, 'テイクアウト・デリバリーの注文ページURL', false, 'Uber Eats・出前館など');

  // ---- ⑧ 写真 ----
  add_page(form, '⑧ 写真', '写真はこのあと LINE またはメールでお送りください。スマホで撮ったもので十分です。');
  add_checkbox(form, '送っていただける写真（いくつでも）', true, [
    '料理（5枚以上が目安）', 'ドリンク', '外観・看板', '店内（2枚以上が目安）', '店主・スタッフ',
    'メニュー表', 'ロゴデータ', 'まだ無い（撮影から相談したい）',
  ], false);
  add_choice(form, '写っている人の掲載許可', false, ['人は写っていない', '写っている人の許可は取っている', 'これから確認する'], false);

  // ---- ⑨ 公開について ----
  add_page(form, '⑨ 公開について', null);
  add_choice(form, 'ホームページのアドレス（ドメイン）', true, [
    'すでに持っているドメインを使う',
    '新しく取りたい（年1,000〜2,000円程度はお客様ご負担）',
    '無料のアドレスでよい（追加費用なし）',
    'よくわからないので相談したい',
  ], false);
  add_text(form, 'ドメイン名（お持ちの場合・ご希望がある場合）', false, '例: dining-owl.com');
  form.addDateItem().setTitle('公開の希望日').setHelpText('オープン日やイベントなど、間に合わせたい日があれば').setRequired(false);
  add_paragraph(form, 'ホームページに載せたくない情報', false, '例: 電話番号は載せたくない／店主の名前は出さない');

  // ---- ⑩ ご担当者 ----
  add_page(form, '⑩ ご担当者さま', '初稿のご確認などのご連絡先です。');
  add_text(form, 'ご担当者のお名前', true, null);
  add_choice(form, '連絡しやすい方法', true, ['LINE', 'メール', '電話'], false);
  const mail = form.addTextItem().setTitle('メールアドレス').setRequired(false);
  mail.setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
  add_paragraph(form, 'その他ご要望・ご質問', false, null);

  form
    .addSectionHeaderItem()
    .setTitle('【写真のお願い】')
    .setHelpText(
      '送信後、写真を LINE またはメールでお送りください。\n' +
        '目安: 料理5枚以上・外観1枚・店内2枚。横向き・明るい場所で撮ったものだと使いやすいです。\n' +
        '多めに送っていただければ、こちらで選びます。'
    );

  form.setConfirmationMessage(
    'ご記入ありがとうございました。\n' +
      '写真（料理5枚以上・外観1枚・店内2枚が目安）を LINE またはメールでお送りください。\n' +
      '内容を確認して、3営業日以内にご連絡します。'
  );

  // 回答先スプレッドシート
  const ss = SpreadsheetApp.create('シンプルHP ヒアリング回答');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // 回答が届いたら制作指示書をメールするトリガー
  ScriptApp.newTrigger('on_form_submit').forForm(form).onFormSubmit().create();
  PropertiesService.getScriptProperties().setProperty('FORM_ID', form.getId());

  Logger.log('回答URL（お客様に送る）: ' + form.getPublishedUrl());
  Logger.log('短縮URL: ' + form.shortenFormUrl(form.getPublishedUrl()));
  Logger.log('編集URL（自分用）: ' + form.getEditUrl());
  Logger.log('回答スプレッドシート: ' + ss.getUrl());
}

// ============================================================
// 制作指示書（Markdown）の生成・送信
// ============================================================

// フォーム送信時に呼ばれる
function on_form_submit(e) {
  const form = e.source;
  send_brief(form, e.response);
}

// 最新の回答から指示書を作り直す（手動実行用）
function export_latest_brief() {
  const form_id = PropertiesService.getScriptProperties().getProperty('FORM_ID');
  if (!form_id) throw new Error('FORM_ID が未設定です。先に create_hearing_form を実行してください');
  const form = FormApp.openById(form_id);
  const responses = form.getResponses();
  if (responses.length === 0) throw new Error('まだ回答がありません');
  const md = send_brief(form, responses[responses.length - 1]);
  Logger.log(md);
}

// 指示書を組み立ててメール送信し、Markdown を返す
function send_brief(form, response) {
  const md = build_brief(form, response);
  const shop_name = find_answer(form, response, '店名（正式表記）') || '店名未記入';
  const to = BRIEF_MAIL_TO || Session.getEffectiveUser().getEmail();
  const stamp = Utilities.formatDate(response.getTimestamp(), 'Asia/Tokyo', 'yyyyMMdd');
  MailApp.sendEmail({
    to: to,
    subject: '【制作指示書】' + shop_name,
    body: md,
    attachments: [Utilities.newBlob(md, 'text/markdown', 'brief_' + stamp + '_' + shop_name + '.md')],
  });
  return md;
}

// 回答を「セクション見出し＋質問＋回答」の Markdown にする（未回答も明示して残す）
function build_brief(form, response) {
  const answers = {};
  response.getItemResponses().forEach(function (r) {
    answers[r.getItem().getId()] = r.getResponse();
  });

  const ts = Utilities.formatDate(response.getTimestamp(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
  const lines = [
    '# 制作指示書（Simple Branding Web for Food）',
    '',
    '> Claude Code へ: この指示書で /simple-hp-build を実行してください（手順: OtaSanpot/simple-hp/tools/BUILD_GUIDE.md）。',
    '> 「（未回答）」の項目は BUILD_GUIDE の既定値で埋め、事実情報（価格・住所・営業時間など）は推測で作らないこと。',
    '',
    '- 回答日時: ' + ts,
    '- フォーム: ' + form.getTitle(),
  ];

  form.getItems().forEach(function (item) {
    const type = item.getType();
    const title = item.getTitle();
    if (type === FormApp.ItemType.PAGE_BREAK || type === FormApp.ItemType.SECTION_HEADER) {
      if (title.indexOf('【') === 0) return; // 案内だけの見出しは出さない
      lines.push('', '## ' + title);
      return;
    }
    const a = answers[item.getId()];
    lines.push('', '### ' + title, format_answer(a));
  });

  return lines.join('\n') + '\n';
}

function format_answer(a) {
  if (a === undefined || a === null || a === '' || (Array.isArray(a) && a.length === 0)) return '（未回答）';
  if (Array.isArray(a)) return a.map(function (v) { return '- ' + v; }).join('\n');
  return String(a).trim();
}

function find_answer(form, response, title) {
  const hit = response.getItemResponses().filter(function (r) { return r.getItem().getTitle() === title; })[0];
  return hit ? String(hit.getResponse()).trim() : '';
}

// ============================================================
// 質問追加のヘルパー
// ============================================================

// 1行テキスト
function add_text(form, title, required, help) {
  const item = form.addTextItem().setTitle(title).setRequired(required);
  if (help) item.setHelpText(help);
}

// 段落テキスト
function add_paragraph(form, title, required, help) {
  const item = form.addParagraphTextItem().setTitle(title).setRequired(required);
  if (help) item.setHelpText(help);
}

// ラジオボタン（show_other=true で「その他」入力欄つき）
function add_choice(form, title, required, values, show_other) {
  const item = form.addMultipleChoiceItem().setTitle(title).setRequired(required);
  item.setChoiceValues(values);
  if (show_other) item.showOtherOption(true);
}

// チェックボックス（max_count を渡すと選択数の上限をかける）
function add_checkbox(form, title, required, values, show_other, max_count) {
  const item = form.addCheckboxItem().setTitle(title).setRequired(required);
  item.setChoiceValues(values);
  if (show_other) item.showOtherOption(true);
  if (max_count) {
    item.setValidation(FormApp.createCheckboxValidation().requireSelectAtMost(max_count).build());
  }
}

// 新しいページ（セクション）
function add_page(form, title, help) {
  const item = form.addPageBreakItem().setTitle(title);
  if (help) item.setHelpText(help);
}
