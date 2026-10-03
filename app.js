const categories = ["Все", "Сервис", "Кафе", "Покупки", "Красота", "Путешествия", "Досуг"];
const ratingLabels = ["Совсем не понравилось", "Есть над чем поработать", "Неплохо", "Очень хорошо", "Превосходно"];

let reviews = [
  {
    id: "review-1",
    author: "Анастасия Орлова",
    initials: "АО",
    avatar: "avatar--lilac",
    time: "2 ч назад",
    rating: 5,
    title: "Сервис, который хочется рекомендовать",
    text: "Заказала доставку впервые и теперь точно буду постоянным клиентом. Всё приехало вовремя, горячее и аккуратно упакованное. Курьер был очень вежливым!",
    object: "Яндекс Еда",
    category: "Сервис",
    likes: 24,
    comments: 5,
    liked: false,
  },
  {
    id: "review-2",
    author: "Михаил Савин",
    initials: "МС",
    avatar: "avatar--peach",
    time: "вчера",
    rating: 4,
    title: "Тихое место для долгих разговоров",
    text: "Заглянули в «Смену» случайно, а остались на пару часов. Кофе насыщенный, десерт с грушей — отдельная любовь. В субботу бывает тесно, лучше бронировать.",
    object: "Кофейня «Смена»",
    category: "Кафе",
    likes: 18,
    comments: 8,
    liked: false,
  },
  {
    id: "review-3",
    author: "Полина Мельникова",
    initials: "ПМ",
    avatar: "avatar--mint",
    time: "3 дня назад",
    rating: 3,
    title: "Красиво, но есть нюансы",
    text: "Текстура приятная, кожа после крема мягкая. Но для моей чувствительной кожи оказался тяжеловат — советую сначала попробовать мини-версию.",
    object: "Увлажняющий крем CeraVe",
    category: "Покупки",
    likes: 12,
    comments: 3,
    liked: false,
  },
  {
    id: "review-4",
    author: "Артём Власов",
    initials: "АВ",
    avatar: "avatar--blue",
    time: "5 дней назад",
    rating: 5,
    title: "Нашёл своего мастера",
    text: "Уже третий раз прихожу к Диме — всегда внимательно выслушает и подскажет, если идея не очень. Стрижка держит форму даже без укладки. Атмосфера тоже супер.",
    object: "Барбершоп «Студия 12»",
    category: "Красота",
    likes: 31,
    comments: 6,
    liked: false,
  },
  {
    id: "review-5",
    author: "Лера Белова",
    initials: "ЛБ",
    avatar: "avatar--rose",
    time: "неделю назад",
    rating: 4,
    title: "Выходные, которые перезагрузили",
    text: "Небольшой отель у озера: вокруг сосны, утром приносят очень вкусный завтрак. До центра далековато, зато здесь по-настоящему тихо.",
    object: "Загородный отель «Сосны»",
    category: "Путешествия",
    likes: 42,
    comments: 11,
    liked: false,
  },
];

let activeCategory = "Все";
let activeQuery = "";
let selectedRating = 5;
let toastTimeout;

const reviewList = document.querySelector("#reviewList");
const categoryFilters = document.querySelector("#categoryFilters");
const emptyState = document.querySelector("#emptyState");
const feedCount = document.querySelector("#feedCount");
const searchDialog = document.querySelector("#searchDialog");
const reviewDialog = document.querySelector("#reviewDialog");
const searchInput = document.querySelector("#searchInput");
const clearSearchButton = document.querySelector("#clearSearchButton");
const searchResultNote = document.querySelector("#searchResultNote");
const reviewForm = document.querySelector("#reviewForm");
const ratingPicker = document.querySelector("#ratingPicker");
const ratingCaption = document.querySelector("#ratingCaption");
const toast = document.querySelector("#toast");

const icons = {
  pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  heart: '<path d="M20.8 8.7c0 5.1-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.7a4.7 4.7 0 0 1 8.8-2.3 4.7 4.7 0 0 1 8.8 2.3Z"/>',
  message: '<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.2-.7L4 20l1.7-4.4a7.5 7.5 0 1 1 14.3-4.1Z"/>',
  more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function normalizeText(value) {
  return value.toLocaleLowerCase("ru").replaceAll("ё", "е").trim();
}

function renderFilters() {
  categoryFilters.innerHTML = categories
    .map((category) => {
      const selected = category === activeCategory;
      return `
        <button
          class="filter-chip${selected ? " is-selected" : ""}"
          type="button"
          data-category="${escapeHTML(category)}"
          aria-pressed="${selected}"
        >${escapeHTML(category)}</button>
      `;
    })
    .join("");
}

function renderStars(rating) {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const filled = index < rating;
    return `<span class="${filled ? "is-filled" : ""}" aria-hidden="true">★</span>`;
  }).join("");
  return `<span class="stars" role="img" aria-label="${rating} из 5 звёзд">${stars}</span>`;
}

function renderReview(review) {
  const liked = review.liked;
  return `
    <article class="review-card" data-review-id="${escapeHTML(review.id)}">
      <div class="card-topline">
        <div class="author-row">
          <div class="avatar ${escapeHTML(review.avatar)}" aria-hidden="true">${escapeHTML(review.initials)}</div>
          <div class="author-details">
            <p class="author-name">${escapeHTML(review.author)}</p>
            <p class="review-meta">${escapeHTML(review.time)} <span class="meta-dot" aria-hidden="true"></span> Отзыв</p>
          </div>
        </div>
        <button class="more-button" type="button" data-action="more" aria-label="Другие действия">
          ${icon("more")}
        </button>
      </div>

      <div class="rating-row">
        ${renderStars(review.rating)}
        <span class="rating-number">${review.rating}.0</span>
      </div>

      <h2 class="review-title">${escapeHTML(review.title)}</h2>
      <p class="review-copy">${escapeHTML(review.text)}</p>

      <div class="review-object">
        ${icon("pin")}
        <span>${escapeHTML(review.object)}</span>
      </div>

      <div class="card-footer">
        <span class="review-tag">#${escapeHTML(review.category)}</span>
        <div class="card-actions">
          <button
            class="action-button like-button${liked ? " is-liked" : ""}"
            type="button"
            data-action="like"
            aria-label="${liked ? "Убрать отметку «Нравится»" : "Нравится"}"
            aria-pressed="${liked}"
          >
            ${icon("heart")}
            <span>${review.likes}</span>
          </button>
          <button class="action-button" type="button" data-action="comments" aria-label="Комментарии: ${review.comments}">
            ${icon("message")}
            <span>${review.comments}</span>
          </button>
        </div>
      </div>
    </article>
  `;
}

function getVisibleReviews() {
  return reviews.filter((review) => {
    const matchesCategory = activeCategory === "Все" || review.category === activeCategory;
    const searchableText = normalizeText(
      `${review.author} ${review.title} ${review.text} ${review.object} ${review.category}`,
    );
    const matchesQuery = !activeQuery || searchableText.includes(normalizeText(activeQuery));
    return matchesCategory && matchesQuery;
  });
}

function renderReviews() {
  const visibleReviews = getVisibleReviews();
  reviewList.innerHTML = visibleReviews.map(renderReview).join("");
  emptyState.hidden = visibleReviews.length > 0;
  feedCount.textContent = `${visibleReviews.length} ${getReviewWord(visibleReviews.length)}`;

  if (searchDialog.open) {
    searchResultNote.textContent = activeQuery
      ? `Найдено: ${visibleReviews.length}`
      : "";
  }
}

function getReviewWord(count) {
  const remainder = count % 10;
  const lastTwoDigits = count % 100;
  if (remainder === 1 && lastTwoDigits !== 11) return "отзыв";
  if (remainder >= 2 && remainder <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) return "отзыва";
  return "отзывов";
}

function showToast(message) {
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2300);
}

function resetRating() {
  selectedRating = 5;
  updateRatingPicker();
}

function updateRatingPicker() {
  ratingPicker.querySelectorAll("[data-rating]").forEach((button) => {
    const isSelected = Number(button.dataset.rating) <= selectedRating;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(Number(button.dataset.rating) === selectedRating));
  });
  ratingCaption.textContent = ratingLabels[selectedRating - 1];
}

function openSearch() {
  activeQuery = "";
  searchInput.value = "";
  clearSearchButton.hidden = true;
  searchResultNote.textContent = "";
  renderReviews();
  searchDialog.showModal();
  window.setTimeout(() => searchInput.focus(), 50);
}

function closeDialog(dialog) {
  if (dialog.open) dialog.close();
}

document.querySelector("#openSearchButton").addEventListener("click", openSearch);

document.querySelector("#openReviewButton").addEventListener("click", () => {
  reviewForm.reset();
  resetRating();
  reviewDialog.showModal();
});

document.querySelectorAll(".close-dialog").forEach((button) => {
  button.addEventListener("click", () => closeDialog(button.closest("dialog")));
});

[searchDialog, reviewDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
});

searchDialog.addEventListener("close", () => {
  activeQuery = "";
  searchInput.value = "";
  clearSearchButton.hidden = true;
  searchResultNote.textContent = "";
  renderReviews();
});

searchInput.addEventListener("input", () => {
  activeQuery = searchInput.value;
  clearSearchButton.hidden = !activeQuery;
  renderReviews();
});

clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  activeQuery = "";
  clearSearchButton.hidden = true;
  searchResultNote.textContent = "";
  renderReviews();
  searchInput.focus();
});

categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderReviews();
});

reviewList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const card = button.closest("[data-review-id]");
  const review = reviews.find((item) => item.id === card.dataset.reviewId);
  if (!review) return;

  if (button.dataset.action === "like") {
    review.liked = !review.liked;
    review.likes += review.liked ? 1 : -1;
    renderReviews();
    return;
  }

  if (button.dataset.action === "comments") {
    showToast("Комментарии скоро появятся");
    return;
  }

  if (button.dataset.action === "more") {
    showToast("Дополнительные действия скоро появятся");
  }
});

ratingPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-rating]");
  if (!button) return;
  selectedRating = Number(button.dataset.rating);
  updateRatingPicker();
});

reviewForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!reviewForm.reportValidity()) return;

  const formData = new FormData(reviewForm);
  const title = String(formData.get("title")).trim();
  const object = String(formData.get("object")).trim();
  const text = String(formData.get("text")).trim();
  const category = String(formData.get("category"));

  if (!title || !object || !text || !category) return;

  reviews.unshift({
    id: `review-${Date.now()}`,
    author: "Вы",
    initials: "ВЫ",
    avatar: "avatar--you",
    time: "только что",
    rating: selectedRating,
    title,
    text,
    object,
    category,
    likes: 0,
    comments: 0,
    liked: false,
  });

  activeCategory = "Все";
  activeQuery = "";
  renderFilters();
  renderReviews();
  closeDialog(reviewDialog);
  reviewForm.reset();
  resetRating();
  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast("Отзыв опубликован");
});

document.querySelector("#resetFiltersButton").addEventListener("click", () => {
  activeCategory = "Все";
  activeQuery = "";
  if (searchDialog.open) closeDialog(searchDialog);
  renderFilters();
  renderReviews();
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    const section = button.dataset.nav;
    if (section === "home") {
      activeCategory = "Все";
      activeQuery = "";
      renderFilters();
      renderReviews();
      window.scrollTo({ top: 0, behavior: "smooth" });
      showToast("Вы на главной");
    } else if (section === "categories") {
      document.querySelector("#categoryFilters").scrollIntoView({ behavior: "smooth", block: "start" });
      showToast("Выберите категорию отзывов");
    } else if (section === "notifications") {
      showToast("Новых событий пока нет");
    } else {
      showToast("Профиль скоро появится");
    }

    document.querySelectorAll(".nav-item").forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      if (isActive) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  });
});

document.querySelector("#profileButton").addEventListener("click", () => {
  showToast("Профиль скоро появится");
});

const installButton = document.querySelector("#installButton");
let installPromptEvent = null;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = window.matchMedia("(display-mode: standalone)").matches
  || navigator.standalone === true;

if (isIOS && !isStandalone) installButton.hidden = false;

installButton.addEventListener("click", async () => {
  if (!installPromptEvent) {
    showToast("В Safari нажмите «Поделиться» → «На экран Домой»");
    return;
  }

  const promptEvent = installPromptEvent;
  installPromptEvent = null;
  installButton.disabled = true;

  try {
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") showToast("Reviewly установлено на устройство");
  } catch (error) {
    console.error("Не удалось открыть установку Reviewly.", error);
    showToast("Не удалось начать установку приложения");
  } finally {
    installButton.disabled = false;
    installButton.hidden = true;
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPromptEvent = event;
  installButton.hidden = false;
});

window.addEventListener("appinstalled", () => {
  installPromptEvent = null;
  installButton.hidden = true;
  showToast("Reviewly установлено на устройство");
});

renderFilters();
renderReviews();
updateRatingPicker();

if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Не удалось зарегистрировать service worker.", error);
    });
  });
}
