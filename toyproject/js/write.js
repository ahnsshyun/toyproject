const BASE_URL = 'http://3.37.138.89:8000';

function showModal(msg) {
  document.getElementById('modalMsg').innerHTML = msg;  // textContent → innerHTML
  document.getElementById('modalOverlay').classList.add('active');
}

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('modalOverlay').classList.remove('active');
});

document.getElementById('submitBtn').addEventListener('click', () => {
  const title    = document.getElementById('title').value.trim();
  const author   = document.getElementById('author').value.trim();
  const content  = document.getElementById('content').value.trim();
  const password = document.getElementById('password').value.trim();

  // 빈 칸 확인
  if (!title) {
    showModal('제목을 입력해주세요');
    return;
  }
  if (!author) {
    showModal('작성자를 입력해주세요');
    return;
  }
  if (!content) {
    showModal('내용을 입력해주세요');
    return;
  }
  if (!password) {
    showModal('비밀번호를 입력해주세요');
    return;
  }

  // 비밀번호 숫자 4자리 확인
  if (!/^\d{4}$/.test(password)) {
    showModal('비밀번호는 숫자 4자리로 <br>입력해주세요');
    return;
  }

  // 백엔드로 데이터 전송

  const postData = { title, writer: author, content, password };
  submitPost(postData);
});

async function submitPost(postData) {
  try {
    const response = await fetch(`${BASE_URL}/guestbook/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });

    if (response.ok) {
      showModal('글이 등록되었습니다');
      document.getElementById('modalClose').addEventListener('click', () => {
        window.location.href = '../html/main.html';
      }, { once: true });
    } else {
      const err = await response.json();
      showModal(err.message);
    } // 서버 에러 메시지 표시
  } catch (error) {
    showModal('서버에 연결할 수 없습니다');
  }
}