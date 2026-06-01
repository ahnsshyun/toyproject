const BASE_URL = 'http://3.37.138.89:8000';

let posts = [];

// 서버에서 인기글 가져오기 (좋아요 많은 순)
async function fetchPopularPosts() {
  const response = await fetch(`${BASE_URL}/guestbook/hot/`);
  const data = await response.json();
  posts = data.data.slice(0, 5);  // 상위 5개만
  renderPosts();
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPosts() {
  console.log('posts:', posts);

  const list = document.getElementById('postList');
  console.log('list:', list);

  let html = '';

  for (let i = 0; i < 5; i++) {
    const p = posts[i];
    if (p) {
      html += `
        <a href="../html/detail.html?id=${p.id}" class="post-item">
          <span class="post-rank">${i + 1}</span>
          <span class="post-title">${escHtml(p.title)}</span>
          <span class="post-likes">♥ ${p.likes_count}</span>
          <span class="post-author">${escHtml(p.writer)}</span>
          <span class="post-time">${formatTime(p.created_at)}</span>
        </a>`;
    } else {
      html += `
        <div class="post-item">
          <span class="post-rank">${i + 1}</span>
          <span class="post-title" style="color:#cccccc;">등록된 글이 없습니다.</span>
        </div>`;
    }
  }

  list.innerHTML = html;
  console.log('html:', html);
}

fetchPopularPosts();