const BASE_URL = 'http://3.37.138.89:8000';

// URL에서 글 id 가져오기
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

let liked = false;

// 모달
function showModal(msg, callback = null) {
  document.getElementById('modalMsg').innerHTML = msg;
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('modalClose').onclick = () => {
    document.getElementById('modalOverlay').classList.remove('active');
    if (callback) callback();
  };
}

// 시간 포맷
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

// 글 불러오기
async function fetchPost() {
  try {
    const response = await fetch(`${BASE_URL}/guestbook/${postId}/`);
    const data = await response.json();

    if (data.status === 404) {
      showModal('해당 방명록을 찾을 수 없습니다.');
      return;
    }

    const post = data.data; 
    console.log(post.created); 
    console.log(post);

    document.getElementById('postTitle').textContent   = post.title;
    document.getElementById('postAuthor').textContent  = post.writer;   
    document.getElementById('postTime').textContent    = formatTime(post.created_at);  
    document.getElementById('postContent').textContent = post.content;
    document.getElementById('likeCount').textContent   = post.likes_count;
    
  } catch (error) {
    showModal('글을 불러올 수 없습니다.');
  }
}


// 댓글 불러오기(전체 조회)
async function fetchComments() {
  try {
    const response = await fetch(`${BASE_URL}/guestbook/${postId}/comment/`);
    const data = await response.json();

    if (data.status === 404) {
      showModal('해당 방명록을 찾을 수 없습니다.');
      return;
    }

    const comments = data.data;

    document.getElementById('commentCount').textContent = comments.length;

    const list = document.getElementById('commentList');
    list.innerHTML = comments.length === 0
      ? `<div class="empty-comment">아직 댓글이 없습니다.</div>`
      : comments.map(c => `
          <div class="comment-item">
            <div class="comment-meta">
              <span class="comment-author">${escHtml(c.writer)}</span>
              <div style="display:flex; gap:12px; align-items:center;">
                <span class="comment-time">${formatTime(c.created_at)}</span>
                <button class="comment-like liked" onclick="likeComment(${c.id}, this)">♥ ${c.likes_count}</button>  <!-- 추가 -->
                <button class="comment-delete" onclick="deleteComment(${c.id})">삭제</button>
              </div>
            </div>
            <p class="comment-content">${escHtml(c.content)}</p>
          </div>`).join('');
  } catch (error) {
    showModal('댓글을 불러올 수 없습니다.');
  }
}


// 좋아요
document.getElementById('likeBtn').addEventListener('click', async () => {
  try {
    const response = await fetch(`${BASE_URL}/guestbook/${postId}/like/`, { method: 'POST' });
    const data = await response.json();
    console.log(data);

    if (data.status === 201) {
  liked = true;
} else if (data.status === 200) {
  liked = false;
} else {
  showModal(data.message);
  return;
}
document.getElementById('likeBtn').classList.toggle('liked', liked);
fetchPost();  // GET으로 likes_count 다시 불러오기
  } catch (error) {
    showModal('서버에 연결할 수 없습니다.');
  }
});

// 글 수정
document.getElementById('editBtn').addEventListener('click', () => {
  showPasswordModal(async (password) => {
    const currentTitle   = document.getElementById('postTitle').textContent;
    const currentContent = document.getElementById('postContent').textContent;
    document.getElementById('editTitle').value   = currentTitle;   // 추가
    document.getElementById('editContent').value = currentContent;
    document.getElementById('editOverlay').classList.add('active');

    document.getElementById('editCancel').onclick = () => {
      document.getElementById('editOverlay').classList.remove('active');
    };

    document.getElementById('editConfirm').onclick = async () => {
      const newTitle   = document.getElementById('editTitle').value.trim();    // 추가
      const newContent = document.getElementById('editContent').value.trim();
      if (!newTitle)   { showModal('제목을 입력해주세요.'); return; }           // 추가
      if (!newContent) { showModal('내용을 입력해주세요.'); return; }

      try {
        const response = await fetch(`${BASE_URL}/guestbook/${postId}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle, content: newContent, password })  // title 추가
        });
        const data = await response.json();

        if (data.status === 200) {
          document.getElementById('postTitle').textContent   = newTitle;    // 추가
          document.getElementById('postContent').textContent = newContent;
          document.getElementById('editOverlay').classList.remove('active');
          showModal('수정되었습니다.');
        } else {
          showModal(data.message);
        }
      } catch (error) {
        showModal('서버에 연결할 수 없습니다.');
      }
    };
  });
});

// 글 삭제
document.getElementById('deleteBtn').addEventListener('click', () => {
  showPasswordModal(async (password) => {
    try {
      const response = await fetch(`${BASE_URL}/guestbook/${postId}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();

      if (data.status === 200) {
        showModal('삭제되었습니다.', () => {
          window.location.href = '../html/main.html';
        });
      } else {
        showModal(data.message);  // 서버 에러 메시지 그대로 표시
      }
    } catch (error) {
      showModal('서버에 연결할 수 없습니다.');
    }
  });
});

// 댓글 등록
document.getElementById('commentSubmitBtn').addEventListener('click', async () => {
  const author   = document.getElementById('commentAuthor').value.trim();
  const password = document.getElementById('commentPassword').value.trim();
  const content  = document.getElementById('commentContent').value.trim();

  if (!author)   { showModal('작성자를 입력해주세요.'); return; }
  if (!password) { showModal('비밀번호를 입력해주세요.'); return; }
  if (!/^\d{4}$/.test(password)) { showModal('비밀번호는 숫자 4자리로 입력해주세요.'); return; }
  if (!content)  { showModal('댓글 내용을 입력해주세요.'); return; }

  try {
    const response = await fetch(`${BASE_URL}/guestbook/${postId}/comment/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writer: author, password, content })  // author → writer
    });

    const data = await response.json();

    if (data.status === 201) {
      document.getElementById('commentAuthor').value   = '';
      document.getElementById('commentPassword').value = '';
      document.getElementById('commentContent').value  = '';
      fetchComments();
    } else {
      showModal(data.message);  // 서버 에러 메시지 표시
    }
  } catch (error) {
    showModal('서버에 연결할 수 없습니다.');
  }
});

// 댓글 삭제
async function deleteComment(commentId) {
  showPasswordModal(async (password) => {
    try {
      const response = await fetch(`${BASE_URL}/guestbook/${postId}/comment/${commentId}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();

      if (data.status === 200) {
        fetchComments();
      } else {
        showModal(data.message);  // 서버 에러 메시지 표시
      }
    } catch (error) {
      showModal('서버에 연결할 수 없습니다.');
    }
  });
}

//댓글좋아요
async function likeComment(commentId, btn) {
  try {
    const response = await fetch(`${BASE_URL}/guestbook/${postId}/comment/${commentId}/like/`, {
      method: 'POST'
    });
    const data = await response.json();

    if (data.status === 201) {
      btn.classList.add('liked');
      btn.textContent = `♥ ${parseInt(btn.textContent.replace('♥', '').trim()) + 1}`;
    } else if (data.status === 200) {
      btn.classList.remove('liked');
      btn.textContent = `♥ ${parseInt(btn.textContent.replace('♥', '').trim()) - 1}`;
    } else {
      showModal(data.message);
    }
  } catch (error) {
    showModal('서버에 연결할 수 없습니다.');
  }
}

// 비밀번호 확인 모달
function showPasswordModal(callback) {
  document.getElementById('deletePassword').value = '';
  document.getElementById('passwordOverlay').classList.add('active');

  document.getElementById('passwordConfirm').onclick = () => {
    const password = document.getElementById('deletePassword').value.trim();
    if (!/^\d{4}$/.test(password)) {
      showModal('비밀번호는 숫자 4자리로 입력해주세요.');
      return;
    }
    document.getElementById('passwordOverlay').classList.remove('active');
    callback(password);
  };

  document.getElementById('passwordCancel').onclick = () => {
    document.getElementById('passwordOverlay').classList.remove('active');
  };
}

// 초기화
fetchPost();
fetchComments();