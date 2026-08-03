/* ============================================================
   슬라이드 생성 · 이동
   내용은 data.js 에서만 가져옵니다.
   ============================================================ */

const deck = document.getElementById("deck");

/* --- 유틸 ------------------------------------------------- */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/* --- 배치 정의 ---------------------------------------------
   사진 크기는 모든 배치에서 같습니다. 위치와 TMI 모양만 달라집니다.
   pos : left(사진 왼쪽) / right(사진 오른쪽)
   tmi : rows(줄 목록) / tiles(카드)
----------------------------------------------------------- */
const LAYOUTS = {
  split:  { pos: "left",  tmi: "rows" },
  wide:   { pos: "left",  tmi: "tiles" },
  mirror: { pos: "right", tmi: "rows" },
  tiles:  { pos: "right", tmi: "tiles" },
  quote:  { pos: "left",  tmi: "rows", lead: true },
};

/* --- 슬라이드 조각 ----------------------------------------- */

// 사진 — 파일이 없으면 이름 첫 글자 아바타로 대체
function buildPhoto(teacher) {
  const photo = el("div", "teacher__photo reveal");

  const showInitial = () => {
    photo.textContent = "";
    photo.classList.add("teacher__photo--empty");
    photo.append(el("span", "teacher__initial", teacher.name.trim().charAt(0)));
  };

  if (teacher.photo) {
    const img = el("img");
    img.src = teacher.photo;
    img.alt = `${teacher.name} 선생님 사진`;
    img.addEventListener("error", showInitial);
    photo.append(img);
  } else {
    showInitial();
  }
  return photo;
}

// 순번 + 이름 + 뱃지
function buildNameRow(teacher, index) {
  const box = el("div", "teacher__head reveal");
  box.append(el("p", "overline", String(index + 1).padStart(2, "0")));

  const row = el("div", "teacher__namerow");
  row.append(el("h2", "teacher__name", teacher.name));
  if (teacher.role) row.append(el("span", "badge", teacher.role));

  box.append(row);
  return box;
}

// TMI — 줄 목록형 / 카드형. 값이 비어 있으면 "—" 로 자리를 지킵니다
function buildTmi(teacher, style) {
  const list = el("dl", `tmi tmi--${style} reveal`);
  (teacher.tmi || []).forEach((item) => {
    const filled = item.value && item.value.trim();
    const row = el("div", "tmi__row");
    row.append(
      el("dt", "tmi__label", item.label),
      el("dd", `tmi__value${filled ? "" : " tmi__value--empty"}`, filled || "—")
    );
    list.append(row);
  });
  return list;
}

/* --- 슬라이드 만들기 --------------------------------------- */

// 0. 여름성경학교 커버페이지
function buildOpeningCover() {
  const inner = el("div", "slide__inner");
  const box = el("div", "cover");

  box.append(el("p", "overline reveal", OPENING_COVER.overline));

  if (OPENING_COVER.image) {
    const figure = el("div", "cover__art reveal");
    const img = el("img", "cover__image");
    img.src = OPENING_COVER.image;
    img.alt = OPENING_COVER.imageAlt || OPENING_COVER.title;
    img.addEventListener("error", () => {
      figure.replaceWith(el("h1", "cover__title reveal", OPENING_COVER.title));
    });
    figure.append(img);
    box.append(figure);
  } else {
    box.append(el("h1", "cover__title reveal", OPENING_COVER.title));
  }

  box.append(el("p", "cover__subtitle reveal", OPENING_COVER.subtitle));
  inner.append(box);
  return inner;
}

// 0-0. 마지막 표지 — 첫 표지와 같은 배경, 문구 없이 로고만
function buildClosingCover() {
  const inner = el("div", "slide__inner");
  const box = el("div", "cover");

  if (OPENING_COVER.image) {
    const figure = el("div", "cover__art reveal");
    const img = el("img", "cover__image");
    img.src = OPENING_COVER.image;
    img.alt = OPENING_COVER.imageAlt || OPENING_COVER.title;
    figure.append(img);
    box.append(figure);
  }

  inner.append(box);
  return inner;
}

// 0-1. [개회식] 섹션 타이틀 — 한 줄을 크게 외치는 화면
function buildSectionTitle(data) {
  const inner = el("div", "slide__inner");
  const box = el("div", "cover");

  if (data.overline) box.append(el("p", "overline overline--jumbo reveal", data.overline));
  box.append(el("h1", "cover__title cover__title--jumbo reveal", data.title));

  inner.append(box);
  return inner;
}

// 0-2. 대표기도 — 한 줄을 크게 외치는 화면
function buildPrayer() {
  const inner = el("div", "slide__inner");
  const box = el("div", "cover");

  box.append(el("p", "overline overline--jumbo reveal", PRAYER.label));
  box.append(el("h1", "cover__title cover__title--jumbo reveal", `${PRAYER.name} ${PRAYER.role}`));

  inner.append(box);
  return inner;
}

// 1. 표지
function buildCover() {
  const inner = el("div", "slide__inner");
  const box = el("div", "cover");

  box.append(el("p", "overline reveal", COVER.overline));

  if (COVER.image) {
    const figure = el("div", "cover__art reveal");
    const img = el("img", "cover__image");
    img.src = COVER.image;
    img.alt = COVER.imageAlt || COVER.title;
    img.addEventListener("error", () => {
      figure.replaceWith(el("h1", "cover__title", COVER.title));
    });
    figure.append(img);
    box.append(figure);
  } else {
    box.append(el("h1", "cover__title reveal", COVER.title));
  }

  box.append(el("p", "cover__subtitle reveal", COVER.subtitle));
  inner.append(box);
  return inner;
}

// 2. 선생님 개별 슬라이드 — layout 에 따라 사진 위치가 달라집니다
function buildTeacher(teacher, index) {
  const name = LAYOUTS[teacher.layout] ? teacher.layout : "split";
  const L = LAYOUTS[name];

  const inner = el("div", "slide__inner");
  const wrap = el("div", `teacher teacher--${L.pos} teacher--${name}`);

  const photo = buildPhoto(teacher);

  const quote = teacher.quote && teacher.quote.trim();

  const info = el("div", "teacher__info");
  info.append(buildNameRow(teacher, index), buildTmi(teacher, L.tmi));

  // quote 배치에서는 한마디가 슬라이드 맨 위로 올라갑니다
  if (quote && !L.lead) {
    info.append(el("blockquote", "quote reveal", quote));
  }

  if (L.pos === "right") wrap.append(info, photo);
  else wrap.append(photo, info);

  if (quote && L.lead) {
    inner.append(el("blockquote", "quote quote--lead reveal", quote));
  }
  inner.append(wrap);
  return inner;
}

// 3. 반 배정
function buildClasses() {
  const inner = el("div", "slide__inner");

  const head = el("div", "section-head reveal");
  head.append(
    el("h2", null, "팀 배정"),
    el("p", null, "우리 팀과 선생님을 확인해 주세요")
  );

  const grid = el("div", "class-grid reveal");

  CLASSES.forEach((cls) => {
    const card = el("div", `class-card class-card--${cls.tone || "sage"}`);

    const title = el("div", "class-card__head");
    title.append(
      el("span", "class-card__chip"),
      el("h3", "class-card__name", cls.name)
    );
    card.append(title);

    // 담임 선생님 — 크게
    const teacherBox = el("div", "class-card__block");
    if (cls.homeroom) {
      teacherBox.append(
        el("p", "class-card__label", "담임 선생님"),
        el("p", "class-card__homeroom", cls.homeroom)
      );
    }
    // 함께하는 선생님 — 작게
    if (cls.teachers && cls.teachers.length) {
      teacherBox.append(
        el("p", "class-card__helpers", cls.teachers.join(" · "))
      );
    }
    card.append(teacherBox);

    // 아이들 — 이름이 잘 보이도록 크게
    const studentBox = el("div", "class-card__block");
    studentBox.append(
      el("p", "class-card__label", `친구들 ${(cls.students || []).length}명`)
    );
    const studentList = el("ul", "students");
    (cls.students || []).forEach((s) => {
      const filled = s && s.trim();
      studentList.append(
        el("li", `student${filled ? "" : " student--empty"}`, filled || "미정")
      );
    });
    studentBox.append(studentList);
    card.append(studentBox);

    grid.append(card);
  });

  inner.append(head, grid);

  // 반에 속하지 않는 선생님
  if (SUPPORT && SUPPORT.names && SUPPORT.names.length) {
    const support = el("p", "support reveal");
    support.append(
      el("span", "support__label", SUPPORT.label),
      el("span", "support__names", SUPPORT.names.join(" · "))
    );
    inner.append(support);
  }

  return inner;
}

// 4. 미니게임 안내
function buildGame(game) {
  const inner = el("div", "slide__inner");
  const box = el("div", "game");

  box.append(el("p", "overline reveal", game.order));
  box.append(el("h1", "game__title reveal", game.name));
  box.append(el("p", "game__desc reveal", game.desc));
  box.append(el("p", "game__rule reveal", game.rule));

  inner.append(box);
  return inner;
}

/* --- 장식용 캐릭터 스티커 -----------------------------------
   메인 콘텐츠가 없는 모서리에만, 슬라이드 몇 곳에 틈틈이 배치합니다.
----------------------------------------------------------- */
function buildFly(src, corner) {
  const img = el("img", `deck-fly deck-fly--${corner}`);
  img.src = src;
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  img.addEventListener("error", () => img.remove());
  return img;
}

/* --- 덱 조립 ---------------------------------------------- */
const builders = [
  { label: "여름성경학교", build: buildOpeningCover, slideClass: "slide--photo-bg" },
  { label: "개회식", build: () => buildSectionTitle(OPENING_CEREMONY), flies: [["etc/fly04.png", "tr"]] },
  { label: "대표기도", build: buildPrayer, flies: [["etc/fly03.png", "bl"]] },
  { label: "선생님 소개", build: buildCover },
  ...TEACHERS.map((t, i) => ({ label: t.name, build: () => buildTeacher(t, i) })),
  { label: "반 배정", build: buildClasses, flies: [["etc/fly02.png", "tr"]] },
  ...GAMES.map((g, i) => ({
    label: g.name,
    build: () => buildGame(g),
    flies: i === 0
      ? [["etc/fly01.png", "tl"], ["etc/fly05.png", "br"]]
      : [["etc/fly08.png", "tl"], ["etc/fly06.png", "br"]],
  })),
  { label: "마침", build: buildClosingCover, slideClass: "slide--photo-bg" },
];

const slides = builders.map((item, i) => {
  const slide = el("section", "slide");
  slide.setAttribute("aria-label", `${i + 1}번 슬라이드: ${item.label}`);
  if (item.slideClass) slide.classList.add(item.slideClass);
  if (item.flies) item.flies.forEach(([src, corner]) => slide.append(buildFly(src, corner)));
  slide.append(item.build());
  deck.append(slide);

  return slide;
});

/* --- 이동 -------------------------------------------------- */
let current = 0;

function go(index) {
  current = Math.max(0, Math.min(index, slides.length - 1));

  slides.forEach((s, i) => {
    s.classList.toggle("is-active", i === current);
    s.setAttribute("aria-hidden", i === current ? "false" : "true");
  });
}

const nextSlide = () => go(current + 1);
const prevSlide = () => go(current - 1);

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
    e.preventDefault();
    nextSlide();
  } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    prevSlide();
  } else if (e.key === "Home") {
    go(0);
  } else if (e.key === "End") {
    go(slides.length - 1);
  } else if (e.key.toLowerCase() === "f") {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }
});

/* 슬라이드 영역 클릭으로 넘기기 (버튼·링크 클릭은 제외) */
deck.addEventListener("click", (e) => {
  if (e.target.closest("button, a")) return;
  nextSlide();
});

/* 모바일 스와이프 */
let touchX = null;
deck.addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
deck.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 60) (dx < 0 ? nextSlide : prevSlide)();
  touchX = null;
});

go(0);
