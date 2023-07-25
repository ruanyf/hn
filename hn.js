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

// filtered stories
let stories = [];
// origin all fetched stories
let allStories = [];
// unqualified stories
let badStories = [];

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
  showLoading();

  const p1 = fetch(topStoriesAPI);
  const p2 = fetch(newStoriesAPI);

  Promise.all([p1, p2])
  .then(([responseTop, responseNew]) => {
    return Promise.all([responseTop.json(), responseNew.json()]);
  })
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
    allStories = allStories.concat(items.filter(i => i !== null));
    allStories = validateUrl(allStories);
    stories = storyFilter(allStories);
    showItems(stories);
    secondList();
    hideInfo();
  })
  .catch(e => showError);
}

function getItem(id) {
  return fetch(`${baseAPIUrl}/item/${id}.json`)
    .then(response => response.json());
}

function showItem(item, isMainList = true) {
  const li = document.createElement('li');
  const titleLine = document.createElement('p');
  // titleLine.innerHTML = item.title;
  titleLine.innerHTML = itemLine(item);
  li.appendChild(titleLine);

  let list;
  if (isMainList) {
    list = document.querySelector('.list');
  } else {
    list = document.querySelector('.second');
  }
  list.appendChild(li);
}

function showItems(items, isMainList = true) {
  for (let i = 0; i < items.length; i++) {
    showItem(items[i], isMainList);
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

function storyFilter(items) {
  let stories = items
    .filter(keywordFilter)
    .filter(hostFilter)
    .filter(jobFilter)
    .filter(emptyStoryFilter)
    .filter(urlFilter);
  return stories;
}

function urlFilter(item) {
  const url = item.url || '';
  const screenUrls = [
    'www.nature.com/articles/s',
  ];
  for (let i = 0; i < screenUrls.length; i++) {
    const screenItem = screenUrls[i];
    if (url.includes(screenItem)) {
      void badStories.push(item);
      return false;
    }
  }
  return true;
}

function hostFilter(item) {
  console.log(item.title);
  // discarded Hosts
  const discardHosts = [
    'www.atlasobscura.com',
    'arxiv.org',
    'archive.org',
    'www.bmj.com',
    'www.bostonreview.net',
    'www.biorxiv.org',
    'devblogs.microsoft.com',
    'www.esquire.com',
    'hbr.org',
    'hedgehogreview.com',
    'ieeexplore.ieee.org',
    'www.thehindu.com',
    'www.historytoday.com',
    'www.justice.gov',
    'www.laphamsquarterly.org',
    'lithub.com',
    'www.lrb.co.uk',
    'medicalxpress.com',
    'www.nber.org',
    'www.newyorker.com',
    'www.ncbi.nlm.nih.gov',
    'www.theparisreview.org',
    'www.paulgraham.com',
    'pubcard.net',
    'pubmed.ncbi.nlm.nih.gov',
    'psyche.co',
    'quillette.com',
    'roadmap.sh',
    'sec.gov',
    'seths.blog',
    'unherd.com',
    'yalereview.org',
  ];
  const discardHostsStr = discardHosts.join('');

  // minor Hosts
  const screenHosts = [
    'www.abc.net.au',
    'acoup.blog',
    'www.acm.org',
    'aeon.co',
    'americanaffairsjournal.org',
    'aws.amazon.com',
    'www.anandtech.com',
    'apnews.com',
    'arstechnica.com',
    'www.axios.com',
    'www.bbc.com',
    'www.bbc.co.uk',
    'www.bloomberg.com',
    'www.bmj.com',
    'www.businessinsider.com',
    'www.cbsnews.com',
    'www.cnbc.com',
    'lite.cnn.com',
    'www.cnn.com',
    'theconversation.com',
    'dl.acm.org',
    'www.economist.com',
    'news.harvard.edu',
    'www.forbes.com',
    'www.frontiersin.org',
    'www.ft.com',
    'developers.googleblog.com',
    'www.theguardian.com',
    'highscalability.com',
    'www.latimes.com',
    'leimao.github.io',
    'www.infoq.com',
    'www.medrxiv.org',
    'microsoft.com',
    'www.nationalgeographic.com',
    'www.nature.com',
    'www.nautil.us',
    'www.newscientist.com',
    'www.newyorker.com',
    'www.nih.gov',
    'www.npr.org',
    'www.nytimes.com',
    'old.reddit.com',
    'phys.org',
    'www.pnas.org',
    'www.pingcap.com',
    'www.preprints.org',
    'www.psypost.org',
    'publicdomainreview.org',
    'www.quantamagazine.org',
    'www.reuters.com',
    'www.theregister.com',
    'twitter.com',
    'journals.sagepub.com',
    'www.science.org',
    'www.scientificamerican.com',
    'www.sciencedaily.com',
    'www.sciencemag.org',
    'www.scmp.com',
    'www.seattletimes.com',
    'papers.ssrn.com',
    'techcrunch.com',
    'www.technologynetworks.com',
    'www.theatlantic.com',
    'www.theverge.com',
    'www.vice.com',
    'www.visualcapitalist.com',
    'www.washingtonpost.com',
    'en.wikipedia.org',
    'www.wired.com',
    'www.whitehouse.gov',
    'www.wsj.com',
    'youtu.be',
    'www.youtube.com',
  ];
  const minorHostsStr = screenHosts.join('');

  let host;
  try {
    host = new URL(item.url).hostname;
  } catch(e) {
    return false;
  }

  if (discardHostsStr.includes(host)) return false;

  if (minorHostsStr.includes(host)) {
    void badStories.push(item);
    return false;
  }

  /*
  for (let i = 0; i < screenHosts.length; i++) {
    const screenItem = screenHosts[i];
    if (host.includes(screenItem)) {
      void badStories.push(item);
      return false;
    }
  }
  */

  return true;
}

function keywordFilter(item) {
  const screenedKeywords = [
    'coin',
    'dao',
    'blockchain',
    'dreamwidth',
    'ftx',
    '\\[video\\]',
    '\\[pdf\\]',
    'Launch HN',
    'Putin',
    'covid',
    'Ukraine',
    'Russia',
  ];
  const keywords = screenedKeywords.map(w => new RegExp(w, 'i'));
  const title = item.title || '';
  for (let i = 0; i < keywords.length; i++) {
    const regex = keywords[i];
    if (regex.test(title)) {
      // void badStories.push(item);
      return false;
    }
  }
  return true;
}

function jobFilter(item) {
  if (item.type === 'job') {
    // void badStories.push(item);
    return false;
  }
  return true;
}

function emptyStoryFilter(item) {
  if (
    (new URL(item.url)).hostname === 'news.ycombinator.com' &&
    item.descendants < 5
  ) {
    // void badStories.push(item);
    return false;
  }
  return true;
}

function secondList() {
  if (badStories.length === 0) return;

  const second = document.querySelector('.second');

  const header = document.createElement('h2');
  header.innerHTML = 'Backup News';
  second.appendChild(header);
  showItems(badStories, false);
}

