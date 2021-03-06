// 특정 article_id 전역변수 설정
const urlParams = new URLSearchParams(window.location.search); // 현재 url주소에서 파라미터(id)를 취할 때 사용
const article_id = urlParams.get('id');
let liked = false


// 특정 게시물 상세 페이지 데이터 보여주기
async function loadArticle(article_id) {
    const article = await getArticleDetail(article_id);

    const title = document.getElementById("title")
    const content = document.getElementById("content")
    const user_email = document.getElementById("user_email")
    const time = document.getElementById("time")
    const like_button = document.getElementById("like_button")

    title.innerText = article.title
    content.innerText = article.content
    user_email.innerText = article.user_email
    time.innerText = article.time
    like_button.innerText = article.likes_count

    // 게시물에 달린 댓글 모두 보여주기
    const comment_section = document.getElementById("comment_section")
    comment_section.innerHTML = '' // 중복으로 추가되지 않도록 로드 시 비워줌

    for (let i = 0; i < article.comments.length; i++) {
        const new_comment = document.createElement("p")
        new_comment.innerText = article.comments[i].content
        comment_section.appendChild(new_comment)
    }

    updateLike() // 좋아요 여부 체크

    const user = await getName();
    if (user.id != article.user_id) {
        const update_button = document.getElementById("update_button")
        const delete_button = document.getElementById("delete_button")
        update_button.style.visibility = "hidden"
        delete_button.style.visibility = "hidden"
    }
}


// 게시물 수정하기(title, content)
function updateMode() {

    // 수정 항목 지정, 해당 라인 숨기기
    const title = document.getElementById("title")
    const content = document.getElementById("content")
    title.style.visibility = "hidden" // visibility 속성은 태그의 가시성을 결정
    content.style.visibility = "hidden"

    // 수정 시 이용할 textarea 만들기
    const input_title = document.createElement("textarea")
    input_title.setAttribute("id", "input_title")
    input_title.innerText = title.innerHTML // 기존 title값을 textarea 내부에 미리 작성해둠

    const input_content = document.createElement("textarea")
    input_content.setAttribute("id", "input_content")
    input_content.innerText = content.innerHTML // 기존 content값을 textarea 내부에 미리 작성해둠
    input_content.rows = 10 // 줄 수 제한

    // tectearea 삽입
    const body = document.body // html 상의 body 전체를 불러옴
    body.insertBefore(input_title, title) // 'title'로 지정된 Element의 바로 앞에 'input_title'이란 Element를 넣어줌
    body.insertBefore(input_content, content) // 'content'로 지정된 Element의 바로 앞에 'input_content'이란 Element를 넣어줌

    // 수정 버튼 기능 변경
    const update_button = document.getElementById("update_button")
    update_button.setAttribute("onclick", "updateArticle()")
}


// 게시물 수정 내용 보내기(to API 함수)
async function updateArticle() {

    // 수정 전 처리
    var input_title = document.getElementById("input_title")
    var input_content = document.getElementById("input_content")
    console.log(input_title, input_content)

    const article = await patchArticle(article_id, input_title.value, input_content.value);

    // 수정 후 처리
    input_title.remove() // textarea 삭제
    input_content.remove()

    const title = document.getElementById("title")
    const content = document.getElementById("content")
    title.style.visibility = "visible" // 숨긴 Element 다시 보이게 하기
    content.style.visibility = "visible"
    update_button.setAttribute("onclick", "updateMode()") // 수정 버튼 기능 되돌리기

    loadArticle(article_id) // 게시물 데이터 다시 불러오기
}


// 게시물 삭제하기
async function removeArticle() {
    await deleteArticle(article_id)
}


// 댓글 작성
async function writeComment() {
    const comment_content = document.getElementById("comment_content")
    const comment = await postComment(article_id, comment_content.value)
    loadArticle(article_id)
    comment_content.value = ''
}


// 좋아요 올리기/취소
async function likeArticle() {
    const like_button = document.getElementById("like_button")
    like_button.classList.toggle("fa-thumbs-down") // 해당 class가 없으면 만들어주고 있으면 없애줌

    if (!liked) {
        const response = await postLike(article_id)
        like_button.innerText = parseInt(like_button.innerText) + 1
        liked = true
    } else {
        const response = await deleteLike(article_id)
        like_button.innerText = parseInt(like_button.innerText) - 1
        liked = false
    }
}


// 좋아요 올리기/취소
async function updateLike() {
    const response = await getLike(article_id)
    console.log(response)
    liked = response.liked

    if (liked) {
        like_button.classList.toggle("fa-thumbs-down")
    }
}


loadArticle(article_id)