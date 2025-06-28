// === URLクエリからtagとsearchを取得 ===
const urlParams = new URLSearchParams(window.location.search);
const filterTag = urlParams.get('tag');
const searchKeyword = urlParams.get('search');

// === 要素取得 ===
const materialList = document.getElementById('material-list');
const isIndex = location.pathname.includes('index.html') || location.pathname === '/' || location.pathname === '/index.html';
const isFavorites = location.pathname.includes('favorites.html');

let itemsToDisplay = materials;
let currentPage = 1;
const itemsPerPage = 12;

// === 絞り込み処理 ===
if (isIndex) {
  itemsToDisplay = materials.slice(0, 4);
} else if (searchKeyword) {
  const keyword = searchKeyword.toLowerCase();
  itemsToDisplay = materials.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(keyword);
    const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(keyword));
    return titleMatch || tagMatch;
  });

  const input = document.getElementById('searchInput');
  if (input) input.value = decodeURIComponent(searchKeyword);
} else if (filterTag && filterTag !== 'ALL') {
  itemsToDisplay = materials.filter(item => item.tags.includes(filterTag));
}

function renderPagination() {
  let paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination';
    paginationContainer.className = 'pagination';
    materialList.insertAdjacentElement('afterend', paginationContainer);
  }

  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(itemsToDisplay.length / itemsPerPage);

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '前へ';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    currentPage--;
    renderMaterials(itemsToDisplay);
  };

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '次へ';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    currentPage++;
    renderMaterials(itemsToDisplay);
  };

  const pageInfo = document.createElement('span');
  pageInfo.textContent = ` ${currentPage} / ${totalPages} ページ `;

  paginationContainer.appendChild(prevBtn);
  paginationContainer.appendChild(pageInfo);
  paginationContainer.appendChild(nextBtn);
}

function renderMaterials(items) {
  if (!materialList) return;
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-content').innerHTML = '';
  document.body.classList.remove('modal-open');

  materialList.innerHTML = '';
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  paginatedItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'material-card';
    div.dataset.tags = item.tags.join(', ');

    const img = document.createElement('img');
    img.src = item.file;
    img.alt = item.title;
    img.setAttribute('data-svg', item.svg || '');
    img.addEventListener('click', () => openModal(img));

    const title = document.createElement('p');
    title.textContent = item.title;
    title.className = 'material-title';

    const tags = document.createElement('p');
    tags.textContent = item.tags.join(', ');
    tags.className = 'material-tags';

    const favBtn = document.createElement('button');
    favBtn.className = 'fav-button';
    favBtn.textContent = '♡';
    favBtn.onclick = () => toggleFavorite(item);
    if (getFavorites().some(f => f.title === item.title)) {
      favBtn.classList.add('favorited');
    }

    div.appendChild(img);
    div.appendChild(title);
    div.appendChild(tags);
    div.appendChild(favBtn);

    materialList.appendChild(div);
  });

  if (!isIndex && !isFavorites) renderPagination();
  if (!isFavorites) renderFavoritesSection();
}

function renderFavoritesPage() {
  const favs = getFavorites();
  if (!materialList) return;

  materialList.innerHTML = '';
  favs.forEach(item => {
    const div = document.createElement('div');
    div.className = 'material-card';
    div.dataset.tags = item.tags.join(', ');

    const img = document.createElement('img');
    img.src = item.file;
    img.alt = item.title;
    img.setAttribute('data-svg', item.svg || '');
    img.addEventListener('click', () => openModal(img));

    const title = document.createElement('p');
    title.textContent = item.title;
    title.className = 'material-title';

    const tags = document.createElement('p');
    tags.textContent = item.tags.join(', ');
    tags.className = 'material-tags';

    const favBtn = document.createElement('button');
    favBtn.className = 'fav-button favorited';
    favBtn.textContent = '♡';
    favBtn.onclick = () => toggleFavorite(item);

    div.appendChild(img);
    div.appendChild(title);
    div.appendChild(tags);
    div.appendChild(favBtn);

    materialList.appendChild(div);
  });
}

if (materialList) {
  if (isFavorites) {
    renderFavoritesPage();
  } else {
    renderMaterials(itemsToDisplay);
  }
}

const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    const keyword = document.getElementById('searchInput').value.trim();
    if (keyword) {
      window.location.href = `material.html?search=${encodeURIComponent(keyword)}`;
    }
  });
}

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const keyword = searchInput.value.trim();
      if (keyword) {
        window.location.href = `material.html?search=${encodeURIComponent(keyword)}`;
      }
    }
  });
}

document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('modal').style.display = 'none';
  document.body.classList.remove('modal-open');
});

function openModal(img) {
  const svgPath = img.getAttribute('data-svg');
  if (!svgPath) return;

  document.getElementById('modal-content').innerHTML = '';
  document.getElementById('modal').style.display = 'block';
  document.body.classList.add('modal-open');

  const title = img.alt || '素材タイトル';
  const titleElement = document.getElementById('modalTitle');
  if (titleElement) titleElement.textContent = title;

  fetch(svgPath)
    .then(res => res.text())
    .then(svgText => {
      document.getElementById('modal-content').innerHTML = svgText;
      applyCurrentColor();
    });
}

function applyCurrentColor() {
  const svgElement = document.querySelector('#modal-content svg');
  if (!svgElement) return;
  const color = document.getElementById('colorHex').value || '#000000';
  svgElement.querySelectorAll('[fill]').forEach(el => el.setAttribute('fill', color));
}

document.getElementById('colorPicker').addEventListener('input', e => {
  const hex = e.target.value;
  document.getElementById('colorHex').value = hex;
  applyCurrentColor();
});

document.getElementById('colorHex').addEventListener('input', e => {
  const hex = e.target.value;
  document.getElementById('colorPicker').value = hex;
  applyCurrentColor();
});

document.querySelectorAll('.color-set button').forEach(btn => {
  btn.addEventListener('click', () => {
    const color = btn.style.backgroundColor;
    const hex = rgbToHex(color);
    document.getElementById('colorPicker').value = hex;
    document.getElementById('colorHex').value = hex;
    applyCurrentColor();
  });
});

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  return "#" + result.map(x => ("0" + parseInt(x).toString(16)).slice(-2)).join("");
}

document.getElementById('downloadBtn').addEventListener('click', () => {
  const svgEl = document.querySelector('#modal-content svg');
  if (!svgEl) return;
  const title = document.getElementById('modalTitle').textContent.trim() || '素材';
  const blob = new Blob([svgEl.outerHTML], { type: 'image/svg+xml' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${title}.svg`;
  a.click();
});

document.getElementById('downloadPngBtn').addEventListener('click', () => {
  const svgEl = document.querySelector('#modal-content svg');
  if (!svgEl) return;

  const svgData = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const title = document.getElementById('modalTitle').textContent.trim() || '素材';
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `${title}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };
  img.src = url;
});

function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

function toggleFavorite(item) {
  let favs = getFavorites();
  const exists = favs.some(f => f.title === item.title);
  if (exists) {
    favs = favs.filter(f => f.title !== item.title);
  } else {
    favs.unshift(item);
    if (favs.length > 20) favs = favs.slice(0, 20);
  }
  localStorage.setItem('favorites', JSON.stringify(favs));
  if (isFavorites) {
    renderFavoritesPage();
  } else {
    renderFavoritesSection();
    renderMaterials(itemsToDisplay);
  }
}

function renderFavoritesSection() {
  const favs = getFavorites();
  const container = document.getElementById('favorites');
  if (!container) return;
  container.innerHTML = '<h3>お気に入り素材</h3>';
  const list = document.createElement('div');
  list.className = 'favorite-items';
  favs.slice(0, 4).forEach(item => {
    const div = document.createElement('div');
    div.className = 'material-card';
    const img = document.createElement('img');
    img.src = item.file;
    img.alt = item.title;
    img.setAttribute('data-svg', item.svg);
    img.addEventListener('click', () => openModal(img));
    div.appendChild(img);
    list.appendChild(div);
  });
  container.appendChild(list);

  const more = document.createElement('button');
  more.textContent = 'もっと見る';
  more.className = 'more-favorite-button';
  more.addEventListener('click', () => {
    window.location.href = 'favorites.html';
  });
  container.appendChild(more);
}
