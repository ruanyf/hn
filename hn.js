// see https://github.com/HackerNews/API
const baseAPIUrl = 'https://hacker-news.firebaseio.com/v0';
const topStoriesAPI = `${baseAPIUrl}/topstories.json`;
const newStoriesAPI = `${baseAPIUrl}/newstories.json`;

// the length of items list
const itemsLength = 30;
const startTime = Date.now();

let isLoading = true;
let loadingTimer;
let storiesId = [];
let stories = [];

fetchItems();

function showLoading() {
  const infoSection = document.querySelector('.info');
  infoSection.innerHTML = `Loading... ${Math.ceil((Date.now() - startTime) / 1000)}s`;
  if (isLoading) loadingTimer = setTimeout(showLoading, 1000);
}

function showError(e) {
  isLoading = false;
  clearTimeout(loadingTimer);

  console.log(e);
  const infoSection = document.querySelector('.info');
  infoSection.innerHTML = e.message;
  infoSection.style.backgroundColor = '#be3223';
}

function hideInfo() {
  isLoading = false;
  clearTimeout(loadingTimer);

  const infoSection = document.querySelector('.info');
  infoSection.style.backgroundColor = '#FFFFFF';
  infoSection.innerHTML = '';
}

function fetchItems() {
  showLoading()

  const p1 = fetch(topStoriesAPI);
  const p2 = fetch(newStoriesAPI);
  Promise.all([p1, p2])
  .then(([responseTop, responseNew]) => 
    Promise.all([responseTop.json(), responseNew.json()])
  )
  .then(([topStories, newStories]) => {
    storiesId.push(
      ...topStories.slice(0, itemsLength),
      ...newStories.slice(0, itemsLength)
    );
    // remove array duplicates
    storiesId = [...new Set(storiesId)];
    return Promise.all(storiesId.map(getItem));
  })
  .then(items => {
    stories = stories.concat(items);
    stories = validateUrl(stories);
    showItems(stories);
    hideInfo();
  })
  .catch(e => showError);
}

function getItem(id) {
  return fetch(`${baseAPIUrl}/item/${id}.json`)
    .then(response => response.json());
}

function showItem(item) {
  const li = document.createElement('li');
  const titleLine = document.createElement('p');
  // titleLine.innerHTML = item.title;
  titleLine.innerHTML = itemLine(item);
  li.appendChild(titleLine);

  const list = document.querySelector('.list');
  list.appendChild(li);
}

function showItems(items) {
  for (let i = 0; i < items.length; i++) {
    showItem(items[i]);
  }
}

function itemLine(item) {
  let textArr = [];
  textArr.push(`<a href="${item.url}">${item.title}</a>`);
  textArr.push(`(${(new URL(item.url)).hostname})`);
  if (item.descendants) {
    textArr.push(`<a href="https://news.ycombinator.com/item?id=${item.id}">${item.descendants}</a>`);
  }
  return textArr.join(' ');
}

function validateUrl(items) {
  return items.map(item => {
    if (!item.url) item.url = `https://news.ycombinator.com/item?id=${item.id}`;
    return item;
  });
}
