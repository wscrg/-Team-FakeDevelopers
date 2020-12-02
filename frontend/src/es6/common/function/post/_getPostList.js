import { getFormatDate } from '../_getFormatDate'; // 'yyyy-mm-dd' 형식의 string을 반환하는 함수

const setTimeText = (updatedAt) => {
  const today = getFormatDate(new Date());
  const regDate = getFormatDate(updatedAt);

  const timeText =
    today === regDate // 글을 쓴 날짜가 오늘이면
      ? updatedAt.match(/(?<=T).*(?=\.)/)[0] // 시간을 세팅
      : regDate; // 아니라면 날짜를 세팅

  return timeText;
};

const toClassNamesObj = (midName, ...lastNames) => {
  return lastNames.reduce(
    (acc, lastName) =>
      Object.defineProperty(acc, lastName, {
        value: `post-list__${midName}__${lastName}`,
      }),
    {}
  );
};

const processToElems = (category, postsData) => {
  const DOMfragment = new DocumentFragment();

  const itemName = 'item';
  const propNames = ['number', 'title', 'writer', 'hit', 'reg-time'];
  const classes = toClassNamesObj(category, itemName, ...propNames);

  const setTime = setTimeText;

  for (const post of postsData) {
    const item = document.createElement('div');
    item.setAttribute('class', `post-list__${itemName} ${classes.item}`);

    item.innerHTML = `
    <div class=${classes.number}>${post.id || '0000'}</div>
    <a class=${classes.title} href='#'>${post.title || '[ 빈 제목입니다 ]'}</a>
    <div class=${classes.writer}>${post.UserId || 'Annonymous'}</div>
    <div class=${classes.hit}>${post.Inquiries.length || '0'}</div>
    <div class=${classes['reg-time']}>${setTime(post.updatedAt) || '0000-00-00'}</div>
  `.trim();

    DOMfragment.appendChild(item);
  }

  return DOMfragment;
};

const getpostsData = (url = '') => {
  return fetch(url, {
    method: 'GET',
    cache: 'no-cache',
    // mode: process.env.DEV_MODE === 'development' ? 'no-cors' : 'same-origin',
    // credentials: process.env.DEV_MODE === 'development' ? 'same-origin' : 'include', // 조회수 검증을 위한 쿠키 허용
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
};

const getPostList = (parentElem, path, limit = 10, page = 1, useFakeData = false) => {
  //TODO: page 파라미터 받아서 url에 추가
  const url = useFakeData
    ? `http://localhost:8001/community/${path}/api/create-bulk`
    : `http://localhost:8001/community/${path}/api?limit=${limit}&page=${page}`;
  const category = parentElem.className.match(/(?<=__).*(?=__|$)/)[0]; // post-list__[이곳에 오는 문자열]

  // test
  const testLog = (postsData) => {
    console.log(`요청 url => ${url}`);

    if (postsData.length !== limit)
      console.warn(
        ' 쿼리문으로 요청한 데이터 수와 받아온 데이터 수가 다릅니다.\n',
        ' ▶ 마지막 페이지이거나 서버측 코드가 변경되었습니다.'
      );
  };

  getpostsData(url)
    .then((postsData) => {
      testLog(postsData); //test
      return postsData;
    })
    .then((postsData) => processToElems(category, postsData))
    .then((DOMfragment) => parentElem.appendChild(DOMfragment))
    .catch(console.error);
};

export default getPostList;