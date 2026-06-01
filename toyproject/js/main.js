const BASE_URL = 'http://3.37.138.89:8000';

const PAGE_SIZE = 8;
let currentPage = 1;
let posts = [];


async function fetchPosts() {
  const response = await fetch(`${BASE_URL}/guestbook/`);
  const data = await response.json();
    posts = data.data;
    renderPosts();
}


function formatTime(dateStr) {
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date) / 1000);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateLabel = `${y}.${m}.${d}`;

  if (diff < 60)    return `방금 전 · ${dateLabel}`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}분 전 · ${dateLabel}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전 · ${dateLabel}`;
  return dateLabel;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPosts() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = posts.slice(start, start + PAGE_SIZE);

  document.getElementById('postCount').textContent = `${posts.length}개`;

  const list = document.getElementById('postList');
  list.innerHTML = page.length === 0
    ? `<div class="empty-state">
         <p>아직 작성된 글이 없습니다.<br>첫 번째 방명록을 남겨보세요!</p>
       </div>`
    : page.map(p => `
        <a href="../html/detail.html?id=${p.id}" class="post-item">
          <span class="post-title">
            ${escHtml(p.title)}
          </span>
          <span class="post-author">${escHtml(p.writer)}</span>
          <span class="post-time">${formatTime(p.created_at)}</span>
        </a>`).join('');

  renderPagination();
}

function renderPagination() {
  const pages = Math.ceil(posts.length / PAGE_SIZE);
  const pg = document.getElementById('pagination');
  if (pages <= 1) { pg.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === pages ? 'disabled' : ''}>›</button>`;
  pg.innerHTML = html;
}

function goPage(n) {
  const total = Math.ceil(posts.length / PAGE_SIZE);
  if (n < 1 || n > total) return;
  currentPage = n;
  renderPosts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}



// 페이지 로드 시 실행
fetchPosts();