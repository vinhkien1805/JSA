
const RAPIDAPI_KEY = "b5ab209437msh9db9a067a46e6fbp12ca9bjsn3927e3a3c775";
const RAPIDAPI_HOST = "imdb-top-100-movies.p.rapidapi.com";
const BASE_URL = "https://imdb-top-100-movies.p.rapidapi.com";
const HEADERS = {
  "x-rapidapi-host": RAPIDAPI_HOST,
  "x-rapidapi-key": RAPIDAPI_KEY,
};

// ===== State =====
let currentView = "movies"; // "movies" | "series" | "movie-detail" | "series-detail"
let moviesCache = null;
let seriesCache = null;
let searchQuery = "";
let selectedGenre = "All";

// ===== SVG Icons =====
const icons = {
  star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  starLg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  arrowLeft: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
  calendar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
  tag: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>`,
  user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  pen: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>`,
  play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
  external: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`,
};

// ===== DOM =====
const mainContent = document.getElementById("main-content");
const navMovies = document.getElementById("nav-movies");
const navSeries = document.getElementById("nav-series");

// ===== Navigation =====
document.addEventListener("click", (e) => {
  const navTarget = e.target.closest("[data-nav]");
  if (navTarget) {
    e.preventDefault();
    const target = navTarget.dataset.nav;
    if (target === "movies") {
      currentView = "movies";
      searchQuery = "";
      selectedGenre = "All";
      updateNav();
      renderGrid("movie");
    } else if (target === "series") {
      currentView = "series";
      searchQuery = "";
      selectedGenre = "All";
      updateNav();
      renderGrid("series");
    }
  }
});

function updateNav() {
  navMovies.classList.toggle("active", currentView === "movies" || currentView === "movie-detail");
  navSeries.classList.toggle("active", currentView === "series" || currentView === "series-detail");
}

// ===== API =====
async function fetchMovies() {
  if (moviesCache) return moviesCache;
  const res = await fetch(`${BASE_URL}/`, { headers: HEADERS });
  if (!res.ok) throw new Error("Failed to fetch movies");
  moviesCache = await res.json();
  return moviesCache;
}

async function fetchSeries() {
  if (seriesCache) return seriesCache;
  const res = await fetch(`${BASE_URL}/series/`, { headers: HEADERS });
  if (!res.ok) throw new Error("Failed to fetch series");
  seriesCache = await res.json();
  return seriesCache;
}

async function fetchMovieDetail(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { headers: HEADERS });
  if (!res.ok) throw new Error("Failed to fetch movie detail");
  return res.json();
}

async function fetchSeriesDetail(id) {
  const res = await fetch(`${BASE_URL}/series/${id}`, { headers: HEADERS });
  if (!res.ok) throw new Error("Failed to fetch series detail");
  return res.json();
}

// ===== Render: Skeleton Grid =====
function renderSkeletonGrid() {
  let html = "";
  for (let i = 0; i < 20; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-info">
          <div class="skeleton-line"></div>
          <div class="skeleton-line-short"></div>
        </div>
      </div>`;
  }
  return html;
}

// ===== Render: Grid Page =====
async function renderGrid(type) {
  const isMovie = type === "movie";
  const title = isMovie ? "Top Movies" : "Top Series";
  const subtitle = isMovie
    ? "IMDB's top rated movies of all time"
    : "IMDB's top rated series of all time";
  const placeholder = isMovie ? "Search movies..." : "Search series...";

  mainContent.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">${title}</h1>
        <p class="page-subtitle">${subtitle}</p>
      </div>
      <div class="search-wrapper">
        <span class="search-icon">${icons.search}</span>
        <input type="text" class="search-input" id="search-input" placeholder="${placeholder}" value="${searchQuery}" />
      </div>
    </div>
    <div class="genre-filter" id="genre-filter"></div>
    <div class="media-grid" id="media-grid">${renderSkeletonGrid()}</div>
  `;

  // Search event
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    filterAndRenderCards(type);
  });

  try {
    const data = isMovie ? await fetchMovies() : await fetchSeries();
    const items = Array.isArray(data) ? data : [];

    // Build genres
    const genresSet = new Set();
    items.forEach((item) => item.genre.forEach((g) => genresSet.add(g)));
    const allGenres = ["All", ...Array.from(genresSet).sort()];

    // Render genre filter
    const genreFilter = document.getElementById("genre-filter");
    genreFilter.innerHTML = allGenres
      .map(
        (g) =>
          `<button class="genre-btn${g === selectedGenre ? " active" : ""}" data-genre="${g}">${g}</button>`
      )
      .join("");

    genreFilter.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-genre]");
      if (!btn) return;
      selectedGenre = btn.dataset.genre;
      // Update active
      genreFilter.querySelectorAll(".genre-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.genre === selectedGenre);
      });
      filterAndRenderCards(type);
    });

    // Store items globally for filtering
    window._currentItems = items;
    filterAndRenderCards(type);
  } catch {
    document.getElementById("media-grid").innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p class="empty-state-text error-text">Failed to load data</p>
        <p class="empty-state-sub">Please try again later.</p>
      </div>`;
  }
}

function filterAndRenderCards(type) {
  const items = window._currentItems || [];
  const filtered = items.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGenre = selectedGenre === "All" || item.genre.includes(selectedGenre);
    return matchSearch && matchGenre;
  });

  const grid = document.getElementById("media-grid");

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p class="empty-state-text">No results found</p>
        <p class="empty-state-sub">Try a different search term or filter.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (item) => `
    <div class="media-card" data-id="${item.id}" data-type="${type}">
      <div class="card-image-wrapper">
        <img class="card-image" src="${item.image}" alt="${item.title}" loading="lazy" />
        <div class="card-gradient"></div>
        <div class="card-rank">${item.rank}</div>
        <div class="card-rating">
          ${icons.star}
          <span class="card-rating-text">${item.rating}</span>
        </div>
      </div>
      <div class="card-info">
        <h3 class="card-title">${item.title}</h3>
        <div class="card-meta">
          <span>${item.year}</span>
          ${item.genre.length > 0 ? `<span class="card-meta-sep">|</span><span>${item.genre.slice(0, 2).join(", ")}</span>` : ""}
        </div>
      </div>
    </div>`
    )
    .join("");

  // Card click
  grid.querySelectorAll(".media-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const cardType = card.dataset.type;
      if (cardType === "movie") {
        currentView = "movie-detail";
        updateNav();
        renderDetail(id, "movie");
      } else {
        currentView = "series-detail";
        updateNav();
        renderDetail(id, "series");
      }
    });
  });
}

// ===== Render: Detail Page =====
async function renderDetail(id, type) {
  const isMovie = type === "movie";
  const backLabel = isMovie ? "Movies" : "Series";

  // Show skeleton
  mainContent.innerHTML = `
    <div class="detail-skeleton-back"></div>
    <div class="detail-layout">
      <div class="detail-poster"><div class="detail-skeleton-poster"></div></div>
      <div class="detail-content">
        <div class="detail-skeleton-title"></div>
        <div class="detail-skeleton-stats"></div>
        <div class="detail-skeleton-tags">
          <div class="detail-skeleton-tag"></div>
          <div class="detail-skeleton-tag"></div>
          <div class="detail-skeleton-tag"></div>
        </div>
        <div class="detail-skeleton-lines">
          <div class="detail-skeleton-line"></div>
          <div class="detail-skeleton-line"></div>
          <div class="detail-skeleton-line"></div>
        </div>
      </div>
    </div>`;

  try {
    const data = isMovie ? await fetchMovieDetail(id) : await fetchSeriesDetail(id);

    const genresHtml = (data.genre || [])
      .map((g) => `<span class="detail-genre-tag">${icons.tag} ${g}</span>`)
      .join("");

    const directorsHtml = (data.director || [])
      .map((d) => `<span class="detail-person">${icons.user} ${d}</span>`)
      .join("");

    const writersHtml = (data.writers || [])
      .map((w) => `<span class="detail-person">${icons.pen} ${w}</span>`)
      .join("");

    const trailerBtn = data.trailer_embed_link
      ? `<a href="${data.trailer_embed_link}" target="_blank" rel="noopener noreferrer" class="btn-primary">${icons.play} Watch Trailer</a>`
      : "";

    const imdbBtn = data.imdb_link
      ? `<a href="${data.imdb_link}" target="_blank" rel="noopener noreferrer" class="btn-secondary">${icons.external} View on IMDB</a>`
      : "";

    const trailerEmbed = data.trailer_embed_link
      ? `<div class="trailer-section">
          <h2 class="detail-section-title">Trailer</h2>
          <div class="trailer-wrapper">
            <iframe src="${data.trailer_embed_link}" title="${data.title} Trailer" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
          </div>
        </div>`
      : "";

    mainContent.innerHTML = `
      <button class="back-btn" id="back-btn">
        ${icons.arrowLeft} Back to ${backLabel}
      </button>

      <div class="detail-layout">
        <div class="detail-poster">
          <div class="detail-poster-img-wrapper">
            <img class="detail-poster-img" src="${data.big_image || data.image}" alt="${data.title}" />
          </div>
        </div>

        <div class="detail-content">
          <div class="detail-title-row">
            <span class="detail-rank">#${data.rank}</span>
            <h1 class="detail-title">${data.title}</h1>
          </div>

          <div class="detail-stats">
            <div class="detail-rating">
              ${icons.starLg}
              <span class="detail-rating-value">${data.rating}</span>
              <span class="detail-rating-max">/10</span>
            </div>
            <div class="detail-year">
              ${icons.calendar}
              <span>${data.year}</span>
            </div>
          </div>

          ${genresHtml ? `<div class="detail-genres">${genresHtml}</div>` : ""}

          ${data.description ? `
            <div class="detail-section">
              <h2 class="detail-section-title">Overview</h2>
              <p class="detail-description">${data.description}</p>
            </div>` : ""}

          ${directorsHtml ? `
            <div class="detail-section">
              <h2 class="detail-section-title">Director</h2>
              <div class="detail-people">${directorsHtml}</div>
            </div>` : ""}

          ${writersHtml ? `
            <div class="detail-section">
              <h2 class="detail-section-title">Writers</h2>
              <div class="detail-people">${writersHtml}</div>
            </div>` : ""}

          <div class="detail-actions">
            ${trailerBtn}
            ${imdbBtn}
          </div>
        </div>
      </div>

      ${trailerEmbed}
    `;

    // Back button
    document.getElementById("back-btn").addEventListener("click", () => {
      if (isMovie) {
        currentView = "movies";
        updateNav();
        renderGrid("movie");
      } else {
        currentView = "series";
        updateNav();
        renderGrid("series");
      }
    });
  } catch {
    mainContent.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-text error-text">Failed to load details</p>
        <p class="empty-state-sub">Please try again later.</p>
        <button class="back-btn" id="back-btn" style="margin-top: 1rem;">
          ${icons.arrowLeft} Go back
        </button>
      </div>`;

    document.getElementById("back-btn").addEventListener("click", () => {
      if (isMovie) {
        currentView = "movies";
        updateNav();
        renderGrid("movie");
      } else {
        currentView = "series";
        updateNav();
        renderGrid("series");
      }
    });
  }
}

// ===== Init =====
window.scrollTo(0, 0);
renderGrid("movie");
