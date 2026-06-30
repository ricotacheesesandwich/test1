/* =========================================================
   청년환생교육원 홈페이지 JS
   - 경고 팝업
   - 알람 확인 후 히어로 문구 모션
   - 스크롤 등장 모션
   - 헤더 상태
   - 일정 슬라이더
   - 모바일 학사 일정
   - 모바일 수위표
   - 교육 카드 팝업
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-ready");
  document.body.classList.add("motion-ready");

  initExternalLinkReturnReset();
  initAlarmModal();
  initScrollRevealMotion();
  initHeaderMotion();
  initMobileMenu();
  initScheduleSlider();
  initMobileCalendarStable();
  initMobileRatingCards();
  initEducationCardPopup();
});

/* ---------------------------------------------------------
   External Link Return Reset
   - 외부 링크 클릭 후 다시 원래 탭으로 돌아왔을 때 화면 맨 위로 이동
   --------------------------------------------------------- */
function initExternalLinkReturnReset() {
  const resetKey = "rebirth_external_link_clicked";

  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.addEventListener("click", () => {
      sessionStorage.setItem(resetKey, "true");
    });
  });

  window.addEventListener("focus", () => {
    const shouldReset = sessionStorage.getItem(resetKey) === "true";

    if (!shouldReset) return;

    sessionStorage.removeItem(resetKey);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  });

  window.addEventListener("pageshow", (event) => {
    const navigationEntries = performance.getEntriesByType("navigation");
    const navigationType = navigationEntries[0]?.type;

    const isBackForward = event.persisted || navigationType === "back_forward";

    if (!isBackForward) return;

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 0);
  });
}

/* ---------------------------------------------------------
   00. Hero Intro Motion
   - 알람 확인 후 첫 화면 문구 등장
   --------------------------------------------------------- */
function startHeroIntroMotion() {
  document.body.classList.remove("hero-intro-start");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("hero-intro-start");
    });
  });
}

/* ---------------------------------------------------------
   01. Alarm Modal
   - 링크 접속 / 주소 직접 접속 시 표시
   - 헤더 메뉴 이동 시 표시 안 함
   - 새로고침 5회째마다 표시
   - 알람이 닫힌 뒤 히어로 문구 모션 시작
   --------------------------------------------------------- */
function initAlarmModal() {
  const alarmModal = document.querySelector("[data-alarm-modal]");
  const alarmCloseButton = document.querySelector("[data-alarm-close]");

  const headerMoveKey = "rebirth_header_move_v3";
  const reloadCountKey = "rebirth_alarm_reload_count_v3";

  if (!alarmModal) {
    startHeroIntroMotion();
    return;
  }

  alarmModal.classList.remove("is-open");
  alarmModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("alarm-allowed");
  document.body.classList.remove("modal-open");

  document.querySelectorAll(".header__nav a, .main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      sessionStorage.setItem(headerMoveKey, "true");
    });
  });

  function getNavigationType() {
    const navigationEntries = performance.getEntriesByType("navigation");

    if (navigationEntries.length > 0) {
      return navigationEntries[0].type;
    }

    if (performance.navigation && performance.navigation.type === 1) {
      return "reload";
    }

    return "navigate";
  }

  function openAlarmModal() {
    document.body.classList.add("alarm-allowed");
    document.body.classList.add("modal-open");

    alarmModal.classList.add("is-open");
    alarmModal.setAttribute("aria-hidden", "false");
  }

  function closeAlarmModal() {
    const wasOpen = alarmModal.classList.contains("is-open");

    alarmModal.classList.remove("is-open");
    alarmModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");
    document.body.classList.remove("alarm-allowed");

    if (wasOpen) {
      setTimeout(() => {
        startHeroIntroMotion();
      }, 180);
    }
  }

  function shouldOpenAlarmModal() {
    const cameFromHeader = sessionStorage.getItem(headerMoveKey) === "true";
    const navigationType = getNavigationType();

    sessionStorage.removeItem(headerMoveKey);

    if (cameFromHeader) {
      return false;
    }

    if (navigationType === "reload") {
      const currentCount = Number(localStorage.getItem(reloadCountKey) || 0);
      const nextCount = currentCount + 1;

      localStorage.setItem(reloadCountKey, String(nextCount));

      if (nextCount >= 5) {
        localStorage.setItem(reloadCountKey, "0");
        return true;
      }

      return false;
    }

    if (navigationType === "navigate") {
      localStorage.setItem(reloadCountKey, "0");
      return true;
    }

    return false;
  }

  if (shouldOpenAlarmModal()) {
    openAlarmModal();
  } else {
    startHeroIntroMotion();
  }

  if (alarmCloseButton) {
    alarmCloseButton.addEventListener("click", closeAlarmModal);
  }

  alarmModal.addEventListener("click", (event) => {
    if (event.target === alarmModal) {
      closeAlarmModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && alarmModal.classList.contains("is-open")) {
      closeAlarmModal();
    }
  });
}

/* ---------------------------------------------------------
   02. Scroll Reveal Motion
   - 본문 텍스트 / 카드 / 섹션 순차 등장
   - 히어로 첫 문구 3개는 알람 확인 후 전용 모션으로 처리
   - 푸터는 모션 제외
   --------------------------------------------------------- */
function initScrollRevealMotion() {
  const heroIntroElements = document.querySelectorAll(
    ".hero__kicker, .hero__content h1, .hero__sub",
  );

  heroIntroElements.forEach((element) => {
    element.classList.remove("reveal");
    element.classList.remove("is-visible");
  });

  const textGroupParents = [
    ".hero__content",
    ".intro__block",
    ".institute__layout",
    ".admission__criteria",
    ".admission__qualification",
    ".admission__final",
    ".footer__layout",
  ];

  textGroupParents.forEach((selector) => {
    document.querySelectorAll(selector).forEach((parent) => {
      parent.classList.remove("reveal");
      parent.classList.remove("is-visible");
    });
  });

  const textRevealSelectors = [
    ".intro__label",
    ".intro__block h2",
    ".intro__block p",

    ".institute__content h2",
    ".institute__short",
    ".institute__content h3",
    ".institute__desc",

    ".admission__criteria h2",
    ".admission__criteria li",

    ".admission__qualification p",

    ".admission__lead",
    ".admission__final h2",
    ".admission__note",
    ".admission__sender",
  ];

  const blockRevealSelectors = [
    ".education__head",
    ".education__card",
    ".promo__layout",
    ".slider",
    ".quick__panel",
  ];

  const allRevealSelectors = [...textRevealSelectors, ...blockRevealSelectors];

  allRevealSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add("reveal");
      element.classList.remove("is-visible");
    });
  });

  const revealElements = Array.from(
    document.querySelectorAll(".reveal"),
  ).filter(
    (element) =>
      !element.closest(".alarm-modal") &&
      !element.closest(".footer") &&
      !element.matches(".hero__kicker, .hero__content h1, .hero__sub"),
  );

  revealElements.forEach((element, index) => {
    const parent = element.parentElement;

    const siblingRevealElements = parent
      ? Array.from(parent.children).filter((child) =>
          child.classList.contains("reveal"),
        )
      : [];

    const siblingIndex = siblingRevealElements.indexOf(element);
    const delayIndex = siblingIndex >= 0 ? siblingIndex : index;

    element.style.setProperty(
      "--reveal-delay",
      `${Math.min(delayIndex * 130, 520)}ms`,
    );
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });

  function showAlreadyVisibleElements() {
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();

      if (rect.top < viewportHeight * 0.9 && rect.bottom > 0) {
        element.classList.add("is-visible");
        revealObserver.unobserve(element);
      }
    });
  }

  window.addEventListener("load", showAlreadyVisibleElements);
  window.addEventListener("resize", showAlreadyVisibleElements);

  requestAnimationFrame(() => {
    showAlreadyVisibleElements();
  });
}

/* ---------------------------------------------------------
   03. Header Motion
   --------------------------------------------------------- */
function initHeaderMotion() {
  const header = document.querySelector(".header");

  if (!header) return;

  function updateHeaderState() {
    if (window.scrollY > 14) {
      header.style.boxShadow = "0 12px 34px rgba(42, 59, 87, 0.1)";
      header.style.backdropFilter = "blur(18px)";
    } else {
      header.style.boxShadow = "none";
      header.style.backdropFilter = "none";
    }
  }

  window.addEventListener("scroll", updateHeaderState, { passive: true });
  window.addEventListener("resize", updateHeaderState);

  updateHeaderState();
}

/* ---------------------------------------------------------
   04. Schedule Slider
   --------------------------------------------------------- */
function initScheduleSlider() {
  const slider = document.querySelector(".slider");
  const sliderTrack = document.querySelector(".slider__track");
  const sliderSlides = Array.from(document.querySelectorAll(".slider__slide"));
  const sliderTitlePanels = Array.from(
    document.querySelectorAll(".slider__title-panel"),
  );
  const sliderPrevButtons = Array.from(
    document.querySelectorAll(".slider__prev"),
  );
  const sliderNextButtons = Array.from(
    document.querySelectorAll(".slider__next"),
  );
  const sliderDots = Array.from(
    document.querySelectorAll(".slider__dots button"),
  );

  let sliderIndex = 0;
  let sliderMotionTimer = null;

  function updateSlider(index) {
    const totalSlides = sliderSlides.length;

    if (!totalSlides) return;

    const requestedIndex = index;
    const nextIndex =
      ((requestedIndex % totalSlides) + totalSlides) % totalSlides;

    const previousIndex = sliderIndex;

    const isSameSlide =
      nextIndex === previousIndex &&
      sliderSlides[nextIndex].classList.contains("is-active");

    const isBackward =
      requestedIndex < sliderIndex ||
      (sliderIndex === 0 && nextIndex === totalSlides - 1);

    if (slider) {
      slider.classList.remove("motion-forward", "motion-backward");

      void slider.offsetWidth;

      slider.classList.add(isBackward ? "motion-backward" : "motion-forward");
    }

    if (sliderTrack) {
      sliderTrack.style.removeProperty("--slider-index");
    }

    window.clearTimeout(sliderMotionTimer);

    sliderSlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === nextIndex;
      const isLeaving = !isSameSlide && slideIndex === previousIndex;

      slide.classList.toggle("is-active", isActive);
      slide.classList.toggle("is-leaving", isLeaving);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    sliderTitlePanels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === nextIndex;

      panel.classList.toggle("is-active", isActive);
      panel.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    sliderDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === nextIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    sliderIndex = nextIndex;

    sliderMotionTimer = window.setTimeout(() => {
      sliderSlides.forEach((slide) => {
        slide.classList.remove("is-leaving");
      });
    }, 380);
  }

  sliderPrevButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateSlider(sliderIndex - 1);
    });
  });

  sliderNextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateSlider(sliderIndex + 1);
    });
  });

  sliderDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      updateSlider(Number(dot.dataset.slide || 0));
    });
  });

  updateSlider(0);
}

/* ---------------------------------------------------------
   04-1. Mobile Calendar Stable
   - 기존 복잡한 달력 구조는 유지
   - 모바일 전용 미니 달력을 JS로 새로 생성
   --------------------------------------------------------- */
function initMobileCalendarStable() {
  const calendars = Array.from(document.querySelectorAll(".calendar"));

  if (!calendars.length) return;

  calendars.forEach((calendar) => {
    if (calendar.querySelector(".calendar-mobile")) return;

    const originalDays = Array.from(
      calendar.querySelectorAll(".calendar__day"),
    );
    const eventMap = new Map();

    originalDays.forEach((day) => {
      if (day.classList.contains("is-muted")) return;

      const dateElement =
        day.querySelector(".calendar__badge-number") ||
        day.querySelector(".calendar__range-date") ||
        day.querySelector("time:not(.calendar__time)");

      if (!dateElement) return;

      const dayNumber = dateElement.textContent.trim().replace(/\D/g, "");

      if (!dayNumber) return;

      const times = Array.from(day.querySelectorAll(".calendar__time"))
        .map((item) => item.textContent.trim())
        .filter(Boolean);

      const titles = Array.from(day.querySelectorAll("strong"))
        .map((item) => item.textContent.trim())
        .filter(Boolean);

      const notes = Array.from(day.querySelectorAll("small"))
        .map((item) => item.textContent.trim())
        .filter(Boolean);

      const isBrown =
        day.classList.contains("calendar__range--brown") ||
        Boolean(day.querySelector(".calendar__date-badge.is-brown"));

      const isRing = Boolean(
        day.querySelector(".calendar__date-badge.is-ring"),
      );

      eventMap.set(Number(dayNumber), {
        dayNumber: Number(dayNumber),
        times,
        titles,
        notes,
        isBrown,
        isRing,
      });
    });

    const mobileCalendar = document.createElement("section");

    mobileCalendar.className = "calendar-mobile";
    mobileCalendar.setAttribute("aria-label", "모바일 학사 일정");

    const weekdayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    const weekdays = document.createElement("div");

    weekdays.className = "calendar-mobile__weekdays";
    weekdays.innerHTML = weekdayNames
      .map((day) => `<span>${day}</span>`)
      .join("");

    const grid = document.createElement("div");

    grid.className = "calendar-mobile__grid";

    const firstVisibleDay = 5;
    const lastVisibleDay = 25;

    for (
      let dayNumber = firstVisibleDay;
      dayNumber <= lastVisibleDay;
      dayNumber += 1
    ) {
      const button = document.createElement("button");

      button.className = "calendar-mobile__day";
      button.type = "button";
      button.textContent = String(dayNumber).padStart(2, "0");

      const eventData = eventMap.get(dayNumber);

      if (eventData) {
        button.classList.add("has-event");

        if (eventData.isRing) {
          button.classList.add("is-ring");
        } else if (eventData.isBrown) {
          button.classList.add("is-brown");
        } else {
          button.classList.add("is-navy");
        }

        button.dataset.day = String(dayNumber);
      } else {
        button.disabled = true;
      }

      grid.appendChild(button);
    }

    const detail = document.createElement("section");

    detail.className = "calendar-mobile__detail";
    detail.setAttribute("aria-live", "polite");
    detail.innerHTML = `
      <p class="calendar-mobile__label">SCHEDULE DETAIL</p>
      <div class="calendar-mobile__head">
        <strong class="calendar-mobile__date"></strong>
        <span class="calendar-mobile__time"></span>
      </div>
      <div class="calendar-mobile__body"></div>
    `;

    mobileCalendar.appendChild(weekdays);
    mobileCalendar.appendChild(grid);
    mobileCalendar.appendChild(detail);
    calendar.appendChild(mobileCalendar);

    const dateText = detail.querySelector(".calendar-mobile__date");
    const timeText = detail.querySelector(".calendar-mobile__time");
    const body = detail.querySelector(".calendar-mobile__body");
    const eventButtons = Array.from(grid.querySelectorAll(".has-event"));

    function renderDetail(dayNumber) {
      const eventData = eventMap.get(Number(dayNumber));

      if (!eventData) return;

      eventButtons.forEach((button) => {
        button.classList.toggle(
          "is-active",
          Number(button.dataset.day) === Number(dayNumber),
        );
      });

      dateText.textContent = `2026.07.${String(eventData.dayNumber).padStart(
        2,
        "0",
      )}`;

      timeText.textContent = eventData.times.length
        ? eventData.times.join(" · ")
        : "시간 안내 없음";

      const titleList = eventData.titles.length
        ? `
          <ul class="calendar-mobile__title-list">
            ${eventData.titles.map((title) => `<li>${title}</li>`).join("")}
          </ul>
        `
        : "";

      const noteList = eventData.notes.length
        ? `
          <ul class="calendar-mobile__note-list">
            ${eventData.notes.map((note) => `<li>${note}</li>`).join("")}
          </ul>
        `
        : "";

      body.innerHTML = titleList + noteList;
    }

    eventButtons.forEach((button) => {
      button.addEventListener("click", () => {
        renderDetail(button.dataset.day);
      });
    });

    if (eventButtons.length) {
      renderDetail(eventButtons[0].dataset.day);
    }
  });
}

/* ---------------------------------------------------------
   04-2. Mobile Rating Cards
   - 모바일에서 수위표를 등급별 카드로 표시
   --------------------------------------------------------- */
function initMobileRatingCards() {
  const ratingSections = Array.from(document.querySelectorAll(".rating"));

  if (!ratingSections.length) return;

  ratingSections.forEach((ratingSection) => {
    if (ratingSection.querySelector(".rating__mobile-list")) return;

    const ratingTable = ratingSection.querySelector(".rating__table");

    if (!ratingTable) return;

    const headers = Array.from(ratingTable.querySelectorAll("thead th")).map(
      (th) => th.textContent.trim(),
    );

    const rows = Array.from(ratingTable.querySelectorAll("tbody tr"));

    if (!headers.length || !rows.length) return;

    const mobileList = document.createElement("section");

    mobileList.className = "rating__mobile-list";

    const carryMap = new Map();

    rows.forEach((row) => {
      const cells = Array.from(row.children);
      const gradeCell = cells[0];

      if (!gradeCell) return;

      const rowData = {};
      let cellIndex = 1;

      for (
        let columnIndex = 1;
        columnIndex < headers.length;
        columnIndex += 1
      ) {
        const header = headers[columnIndex];

        if (carryMap.has(columnIndex)) {
          const carried = carryMap.get(columnIndex);

          rowData[header] = carried.html;
          carried.left -= 1;

          if (carried.left <= 0) {
            carryMap.delete(columnIndex);
          }

          continue;
        }

        const cell = cells[cellIndex];

        if (!cell) continue;

        rowData[header] = cell.innerHTML;

        const rowspan = Number(cell.getAttribute("rowspan") || 1);

        if (rowspan > 1) {
          carryMap.set(columnIndex, {
            html: cell.innerHTML,
            left: rowspan - 1,
          });
        }

        cellIndex += 1;
      }

      const card = document.createElement("article");

      card.className = "rating__mobile-card";

      const bodyHTML = Object.entries(rowData)
        .map(
          ([label, value]) => `
            <div class="rating__mobile-row">
              <span class="rating__mobile-row-label">${label}</span>
              <div class="rating__mobile-row-value">${value}</div>
            </div>
          `,
        )
        .join("");

      card.innerHTML = `
        <div class="rating__mobile-grade">${gradeCell.innerHTML}</div>
        <div class="rating__mobile-body">${bodyHTML}</div>
      `;

      mobileList.appendChild(card);
    });

    ratingSection.appendChild(mobileList);
  });
}

/* ---------------------------------------------------------
   05. Education Card Popup
   --------------------------------------------------------- */
function initEducationCardPopup() {
  const educationCards = Array.from(
    document.querySelectorAll(".education__card"),
  );
  const popup = document.querySelector("[data-education-popup]");
  const closeButton = document.querySelector("[data-education-popup-close]");

  if (!educationCards.length || !popup) return;

  const popupNumber = popup.querySelector("[data-popup-number]");
  const popupTitle = popup.querySelector("[data-popup-title]");
  const popupText = popup.querySelector("[data-popup-text]");

  function openEducationPopup(card) {
    const cardNumber = card.querySelector(":scope > span")?.textContent.trim();
    const cardTitle = card.querySelector("h3")?.textContent.trim();
    const cardText = card.querySelector("p")?.textContent.trim();

    if (popupNumber) {
      popupNumber.textContent = cardNumber || "";
    }

    if (popupTitle) {
      popupTitle.textContent = cardTitle || "";
    }

    if (popupText) {
      popupText.textContent = cardText || "";
    }

    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");
    document.body.classList.add("education-popup-open");

    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeEducationPopup() {
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("education-popup-open");
  }

  educationCards.forEach((card) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    card.addEventListener("click", () => {
      openEducationPopup(card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openEducationPopup(card);
      }
    });
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeEducationPopup);
  }

  popup.addEventListener("click", (event) => {
    if (event.target === popup) {
      closeEducationPopup();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && popup.classList.contains("is-open")) {
      closeEducationPopup();
    }
  });
}

/* ---------------------------------------------------------
   Mobile Menu
   - 모바일에서 햄버거 버튼 클릭 시 왼쪽 메뉴 열기
   --------------------------------------------------------- */
function initMobileMenu() {
  const mobileMenus = Array.from(
    document.querySelectorAll("[data-mobile-menu]"),
  );
  const mobileMenu = mobileMenus[0];
  const openButton = document.querySelector("[data-mobile-menu-open]");

  if (mobileMenus.length > 1) {
    mobileMenus.slice(1).forEach((menu) => {
      menu.remove();
    });
  }

  if (!mobileMenu || !openButton) return;

  const closeButtons = mobileMenu.querySelectorAll("[data-mobile-menu-close]");
  const menuLinks = mobileMenu.querySelectorAll(".mobile-menu__panel a");

  function openMobileMenu() {
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");

    openButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("mobile-menu-open");
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");

    openButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("mobile-menu-open");
  }

  openButton.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.contains("is-open");

    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeMobileMenu);
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 767) {
      closeMobileMenu();
    }
  });
}
/* ---------------------------------------------------------
   04-2. Mobile Rating Cards
   - 모바일 수위표 안전 버전
   - 상단: 노출 2 / 성행위 2 / 폭력 4 / 언어 4
   - 하단: 클릭한 항목의 등급별 기준 표시
   --------------------------------------------------------- */
function initMobileRatingCards() {
  const ratingSection = document.querySelector(".rating");

  if (!ratingSection) return;

  const oldMobileList = ratingSection.querySelector(".rating__mobile-list");

  if (oldMobileList) {
    oldMobileList.remove();
  }

  const ratingTable = ratingSection.querySelector(".rating__table");

  if (!ratingTable) return;

  const mobileList = document.createElement("section");
  mobileList.className = "rating__mobile-list";
  mobileList.setAttribute("aria-label", "모바일 수위표");

  const categories = [
    {
      name: "노출",
      grade: "2",
    },
    {
      name: "성행위",
      grade: "2",
    },
    {
      name: "폭력",
      grade: "4",
    },
    {
      name: "언어",
      grade: "4",
    },
  ];

  function getGradeClass(grade) {
    return `rating-mobile-grade--${grade}`;
  }

  function cleanText(text) {
    return text.replace(/\s+/g, " ").trim();
  }

  function getCategoryDetail(categoryName) {
    const rows = Array.from(ratingTable.querySelectorAll("tbody tr"));
    const result = [];

    rows.forEach((row) => {
      const cells = Array.from(row.children);

      if (!cells.length) return;

      const gradeCell = cells[0];
      const gradeText = cleanText(gradeCell.textContent);
      const gradeMatch = gradeText.match(/\d+/);
      const grade = gradeMatch ? gradeMatch[0] : "";

      if (!grade) return;

      /*
        표 컬럼 순서 기준:
        0 등급
        1 노출
        2 성행위
        3 폭력
        4 언어
        5 기타
      */
      const columnMap = {
        노출: 1,
        성행위: 2,
        폭력: 3,
        언어: 4,
        기타: 5,
      };

      const targetIndex = columnMap[categoryName];
      const targetCell = cells[targetIndex];

      if (!targetCell) return;

      const content = targetCell.innerHTML.trim();

      if (!content) return;

      result.push({
        grade,
        content,
      });
    });

    return result;
  }

  const overview = document.createElement("section");
  overview.className = "rating-mobile-overview";

  const overviewGrid = document.createElement("div");
  overviewGrid.className = "rating-mobile-overview__grid";

  const detail = document.createElement("section");
  detail.className = "rating-mobile-detail";

  const detailTitle = document.createElement("h4");
  detailTitle.className = "rating-mobile-detail__title";

  const detailBody = document.createElement("div");
  detailBody.className = "rating-mobile-detail__body";

  detail.appendChild(detailTitle);
  detail.appendChild(detailBody);

  function renderDetail(categoryName) {
    const currentCategory = categories.find(
      (item) => item.name === categoryName,
    );
    const currentGrade = currentCategory ? currentCategory.grade : "";
    const detailRows = getCategoryDetail(categoryName);

    detailTitle.textContent = `${categoryName} 기준`;

    detailBody.innerHTML = "";

    detailRows.forEach((row) => {
      const detailRow = document.createElement("div");
      detailRow.className = "rating-mobile-detail__row";

      if (row.grade === currentGrade) {
        detailRow.classList.add("is-current");
      }

      detailRow.innerHTML = `
        <strong class="rating-mobile-detail__grade ${getGradeClass(row.grade)}">
          ${row.grade}
        </strong>
        <div class="rating-mobile-detail__text">
          ${row.content}
        </div>
      `;

      detailBody.appendChild(detailRow);
    });

    const buttons = overviewGrid.querySelectorAll(
      ".rating-mobile-overview__button",
    );

    buttons.forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.category === categoryName,
      );
    });
  }

  categories.forEach((category, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "rating-mobile-overview__button";
    button.dataset.category = category.name;

    button.innerHTML = `
      <span class="rating-mobile-overview__label">${category.name}</span>
      <strong class="rating-mobile-overview__value ${getGradeClass(
        category.grade,
      )}">
        ${category.grade}
      </strong>
    `;

    button.addEventListener("click", () => {
      renderDetail(category.name);
    });

    overviewGrid.appendChild(button);

    if (index === 0) {
      window.setTimeout(() => {
        renderDetail(category.name);
      }, 0);
    }
  });

  overview.appendChild(overviewGrid);
  mobileList.appendChild(overview);
  mobileList.appendChild(detail);
  ratingSection.appendChild(mobileList);
}
