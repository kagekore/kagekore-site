/* =========================
   モーダル：先に安全に登録
   ========================= */
function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.classList.remove('modal-open');
}

// 委譲で拾う（ボタン作り直しや順序に強い）
document.addEventListener('click', (e) => {
  // 「閉じる」ボタン
  if (e.target.id === 'modal-close' || e.target.classList.contains('modal-close')) {
    closeModal();
  }
  // 背景（オーバーレイ）クリック
  if (e.target.id === 'modal') {
    closeModal();
  }
});

// Escキーでも閉じる
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// （明示的なボタンのハンドラも保険で付ける）
const modalCloseBtn = document.getElementById('modal-close');
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closeModal);
}

/* =========================
   URLパラメータ・状態
   ========================= */
const urlParams = new URLSearchParams(window.location.search);
const filterTag = urlParams.get('tag');
const searchKeyword = urlParams.get('search');

const materialList = document.getElementById('material-list');
const isIndex =
  location.pathname.includes('index.html') ||
  location.pathname === '/' ||
  location.pathname === '/index.html';
const isFavorites = location.pathname.includes('favorites.html');

let itemsToDisplay = materials;   // materials は materials.js から
let currentPage = 1;
const itemsPerPage = 12;

/* =========================
   絞り込み
   ========================= */
if (isIndex) {
  itemsToDisplay = materials.slice(0, 4);
} else if (searchKeyword) {
  const keyword = searchKeyword.toLowerCase();
  itemsToDisplay = materials.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(keyword);
    const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(keyword));
    return titleMatch || tagMatch;
  });
  const input = document.getElementById('searchInput');
  if (input) input.value = decodeURIComponent(searchKeyword);
} else if (filterTag && filterTag !== 'ALL') {
  itemsToDisplay = materials.filter((item) => item.tags.includes(filterTag));
}

/* =========================
   ページネーション
   ========================= */
function renderPagination() {
  if (!materialList) return;

  let paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination';
    paginationContainer.className = 'pagination';
    materialList.insertAdjacentElement('afterend', paginationContainer);
  }

  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(itemsToDisplay.length / itemsPerPage) || 1;

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

  paginationContainer.append(prevBtn, pageInfo, nextBtn);
}

/* =========================
   一覧レンダリング（新着/検索/タグ）
   ========================= */
function renderMaterials(items) {
  if (!materialList) return;

  // 念のためモーダルを閉じる
  closeModal();
  document.getElementById('modal-content').innerHTML = '';

  materialList.innerHTML = '';
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  paginatedItems.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'material-card';
    card.dataset.tags = item.tags.join(', ');

    const img = document.createElement('img');
    img.src = item.file;
    img.alt = item.title;
    img.setAttribute('data-svg', item.svg || '');
    img.addEventListener('click', () => openModal(img));

    const title = document.createElement('p');
    title.className = 'material-title';
    title.textContent = item.title;

    const tags = document.createElement('p');
    tags.className = 'material-tags';
    tags.textContent = item.tags.join(', ');

    const favBtn = document.createElement('button');
    favBtn.className = 'fav-button';
    favBtn.textContent = '♥';
    favBtn.onclick = () => toggleFavorite(item);
    if (getFavorites().some((f) => f.title === item.title)) {
      favBtn.classList.add('favorited');
    }

    card.append(img, title, tags, favBtn);
    materialList.appendChild(card);
  });

  if (!isIndex && !isFavorites) renderPagination();
  if (!isFavorites) renderFavoritesSection();
}

/* =========================
   お気に入りページ（favorites.html）
   ========================= */
function renderFavoritesPage() {
  if (!materialList) return;
  const favs = getFavorites();

  materialList.innerHTML = '';
  favs.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'material-card';
    card.dataset.tags = item.tags.join(', ');

    const img = document.createElement('img');
    img.src = item.file;
    img.alt = item.title;
    img.setAttribute('data-svg', item.svg || '');
    img.addEventListener('click', () => openModal(img));

    const title = document.createElement('p');
    title.className = 'material-title';
    title.textContent = item.title;

    const tags = document.createElement('p');
    tags.className = 'material-tags';
    tags.textContent = item.tags.join(', ');

    const favBtn = document.createElement('button');
    favBtn.className = 'fav-button favorited';
    favBtn.textContent = '♥';
    favBtn.onclick = () => toggleFavorite(item);

    card.append(img, title, tags, favBtn);
    materialList.appendChild(card);
  });
}

/* =========================
   トップの「お気に入り」セクション
   HTMLの #favorites-list をそのまま使う
   ========================= */
function renderFavoritesSection() {
  const list = document.getElementById('favorites-list');
  if (!list) return;

  const favs = getFavorites();
  list.innerHTML = '';

  favs.slice(0, 4).forEach((item) => {
    const card = document.createElement('div');
    card.className = 'material-card';
    card.dataset.tags = item.tags.join(', ');

    const img = document.createElement('img');
    img.src = item.file;
    img.alt = item.title;
    img.setAttribute('data-svg', item.svg || '');
    img.addEventListener('click', () => openModal(img));

    const title = document.createElement('p');
    title.className = 'material-title';
    title.textContent = item.title;

    const tags = document.createElement('p');
    tags.className = 'material-tags';
    tags.textContent = item.tags.join(', ');

    const favBtn = document.createElement('button');
    favBtn.className = 'fav-button favorited';
    favBtn.textContent = '♥';
    favBtn.onclick = () => toggleFavorite(item);

    card.append(img, title, tags, favBtn);
    list.appendChild(card);
  });
}

/* =========================
   初期レンダリング
   ========================= */
if (materialList) {
  if (isFavorites) {
    renderFavoritesPage();
  } else {
    renderMaterials(itemsToDisplay);
  }
}

/* =========================
   検索
   ========================= */
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
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const keyword = searchInput.value.trim();
      if (keyword) {
        window.location.href = `material.html?search=${encodeURIComponent(keyword)}`;
      }
    }
  });
}

/* =========================
   モーダル：開く
   ========================= */
function openModal(img) {
  const svgPath = img.getAttribute('data-svg');
  if (!svgPath) return;

  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  modalContent.innerHTML = '';
  modal.style.display = 'block';
  document.body.classList.add('modal-open');

  const title = img.alt || '素材タイトル';
  const titleElement = document.getElementById('modalTitle');
  if (titleElement) titleElement.textContent = title;

  fetch(svgPath)
    .then((res) => res.text())
    .then((svgText) => {
      modalContent.innerHTML = svgText;
      applyCurrentColor();
    });
}

/* =========================
   カラー反映
   ========================= */
function applyCurrentColor() {
  const svgElement = document.querySelector('#modal-content svg');
  if (!svgElement) return;
  const color = document.getElementById('colorHex').value || '#000000';
  svgElement.querySelectorAll('[fill]').forEach((el) => el.setAttribute('fill', color));
}

const colorPicker = document.getElementById('colorPicker');
if (colorPicker) {
  colorPicker.addEventListener('input', (e) => {
    const hex = e.target.value;
    const hexInput = document.getElementById('colorHex');
    if (hexInput) hexInput.value = hex;
    applyCurrentColor();
  });
}

const colorHex = document.getElementById('colorHex');
if (colorHex) {
  colorHex.addEventListener('input', (e) => {
    const hex = e.target.value;
    const picker = document.getElementById('colorPicker');
    if (picker) picker.value = hex;
    applyCurrentColor();
  });
}

document.querySelectorAll('.color-set button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const color = btn.style.backgroundColor;
    const hex = rgbToHex(color);
    const picker = document.getElementById('colorPicker');
    const hexInput = document.getElementById('colorHex');
    if (picker) picker.value = hex;
    if (hexInput) hexInput.value = hex;
    applyCurrentColor();
  });
});

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  return (
    '#' +
    result
      .map((x) => ('0' + parseInt(x, 10).toString(16)).slice(-2))
      .join('')
  );
}

/* =========================
   ダウンロード（SVG/PNG）
   ========================= */
const dlSvgBtn = document.getElementById('downloadBtn');
if (dlSvgBtn) {
  dlSvgBtn.addEventListener('click', () => {
    const svgEl = document.querySelector('#modal-content svg');
    if (!svgEl) return;
    const title = (document.getElementById('modalTitle').textContent || '素材').trim();
    const blob = new Blob([svgEl.outerHTML], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title}.svg`;
    a.click();
  });
}

const dlPngBtn = document.getElementById('downloadPngBtn');
if (dlPngBtn) {
  dlPngBtn.addEventListener('click', () => {
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

      const title = (document.getElementById('modalTitle').textContent || '素材').trim();
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${title}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

/* =========================
   お気に入り
   ========================= */
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

function toggleFavorite(item) {
  let favs = getFavorites();
  const exists = favs.some((f) => f.title === item.title);
  if (exists) {
    favs = favs.filter((f) => f.title !== item.title);
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

/* =========================
   ハンバーガーメニュー
   ========================= */
const toggleBtn = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');
if (toggleBtn && sidebar) {
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
}
