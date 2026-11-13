/* 詳細ページ専用の記事データ。トップページ・一覧の接続先は今回変更しない。
   前の記事＝日付が古い記事、次の記事＝日付が新しい記事。 */
(() => {
  const articles = [
    {
      id: 'news-1', date: '2025-09-27', title: 'インフルエンザ予防接種について',
      body: '今年もインフルエンザの予防接種を開始いたしました。予約制となっておりますので、お電話または受付にてご予約をお願いいたします。例年、予約が集中しやすいため、早めのご予約をおすすめいたします。'
    },
    {
      id: 'news-2', date: '2024-12-20', title: '年末年始の休診について',
      body: '年末年始の休診日は、12月29日（金）〜1月4日（木）となります。年始は1月5日（金）より通常診療を再開いたします。皆様にはご不便をおかけしますが、何卒ご了承くださいますようお願いいたします。'
    },
    {
      id: 'news-3', date: '2024-09-10', title: '健康診断のご案内',
      body: '今年も健康診断を実施しております。定期的な健康チェックは、病気の早期発見・予防にとても重要です。各種健康診断メニューをご用意しておりますので、ご希望の方はお電話にてお申し込みください。'
    },
    {
      id: 'news-4', date: '2024-04-08', title: '新型コロナウイルス対策について',
      body: '当院では引き続き、新型コロナウイルス感染症対策を徹底しております。ご来院の際には、マスクの着用、手指消毒にご協力をお願いいたします。また、発熱や風邪症状のある方は、事前にお電話でご相談いただけるとスムーズにご案内が可能です。'
    },
    {
      id: 'news-5', date: '2024-01-18', title: 'オンライン診察の導入について',
      body: '2024年より、オンライン診療を一部導入いたしました。通院が難しい方や、遠方にお住まいの方にご利用いただけます。ご希望の方は、当院スタッフまでお問い合わせください。'
    }
  ];
  const id = new URLSearchParams(location.search).get('id') || articles[0].id;
  const index = articles.findIndex(article => article.id === id);
  const title = document.querySelector('.news-detail-title');
  const date = document.querySelector('.news-detail-date');
  const body = document.querySelector('.news-detail-body p');
  const prev = document.querySelector('.news-detail-prev');
  const next = document.querySelector('.news-detail-next');
  if (index < 0) {
    document.title = 'お知らせが見つかりません | 佐藤医院 Sato Clinic';
    title.textContent = 'お知らせが見つかりません';
    date.hidden = true;
    body.textContent = '指定されたお知らせはありません。お知らせ一覧をご確認ください。';
    return;
  }
  const article = articles[index];
  document.querySelector('.news-detail-article').id = article.id;
  document.title = `${article.title} | 佐藤医院 Sato Clinic`;
  document.querySelector('meta[name="description"]').content = article.body;
  date.dateTime = article.date;
  date.textContent = article.date.replaceAll('-', '.');
  title.textContent = article.title;
  body.textContent = article.body;
  function setArticleLink(link, target, label) {
    if (!target) return;
    link.href = `./news-detail.html?id=${target.id}`;
    link.setAttribute('aria-label', `${label}：${target.title}`);
    link.hidden = false;
  }
  setArticleLink(prev, articles[index + 1], '前の記事');
  setArticleLink(next, articles[index - 1], '次の記事');
})();
