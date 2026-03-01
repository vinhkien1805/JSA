const container = document.getElementById('app');

async function loadMovies() {
  try {
    const res = await fetch('/api/movies');
    if (!res.ok) throw new Error('network');
    const data = await res.json();
    renderList(data);
  } catch (e) {
    container.innerHTML = '<p>Error loading movies.</p>';
  }
}

function renderList(movies) {
  container.innerHTML = '<div class="grid"></div>';
  const grid = container.querySelector('.grid');
  movies.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${m.image}" alt="${m.title}">
      <h3>${m.title}</h3>
      <p>${m.year} • ${m.rating}</p>
    `;
    card.addEventListener('click', () => showDetail(m.id));
    grid.appendChild(card);
  });
}

async function showDetail(id) {
  try {
    const res = await fetch(`/api/movies/${id}`);
    if (!res.ok) throw new Error('network');
    const m = await res.json();
    container.innerHTML = `
      <a id="back">← Back</a>
      <div class="detail">
        <img src="${m.image}" alt="${m.title}">
        <div class="detail-content">
          <h2>${m.title}</h2>
          <p>${m.year} • ${m.rating}</p>
          <p>${m.plot || ''}</p>
          ${m.imdb_link ? `<a href="${m.imdb_link}" target="_blank">View on IMDB</a>` : ''}
        </div>
      </div>
    `;
    document.getElementById('back').addEventListener('click', loadMovies);
  } catch (e) {
    container.innerHTML = '<p>Error loading details.</p>';
  }
}

loadMovies();
