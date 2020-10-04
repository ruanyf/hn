// http://finance.sina.com.cn/7x24/
function sina(data) {
  const result = data.result || {};
  if (!result.status || result.status.code !== 0) return;
  const feed = result.data.feed.list;
  let html = '<h2>Sina News</h2>';
  const lineArr = feed.map(i => {
    const content = i.rich_text;
    const contentArr = content.split(/【(.*)】(.*)/);
    let title = '';
    let text = '';
    if (contentArr.length === 4) {
      title = contentArr[1];
      text = contentArr[2];
    } else {
      title = contentArr[0];
    }
    return `<li><h3>${title}</h3>${text}</li>`;
  });
  html += lineArr.join('');
  const sinaSection = document.querySelector('.sina');
  sinaSection.innerHTML = html;
}
