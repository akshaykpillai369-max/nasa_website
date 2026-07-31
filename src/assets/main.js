const API_KEY = import.meta.env.VITE_NASA_API_KEY;


function getFavorites() {
  return JSON.parse(localStorage.getItem("cosmo_favorites")) || [];
}

function saveFavorites(favs) {
  localStorage.setItem("cosmo_favorites", JSON.stringify(favs));
  updateFavCount();
}

function updateFavCount() {
  const countEl = document.querySelector("#fav-count");
  if (countEl) {
    countEl.textContent = getFavorites().length;
  }
}


function getRandomApodDate() {
  const startDate = new Date("1995-06-16").getTime();
  const endDate = new Date().getTime();
  const randomTime = startDate + Math.random() * (endDate - startDate);
  return new Date(randomTime).toISOString().split("T")[0];
}


function renderFavoritesModal() {
  const grid = document.querySelector("#favorites-grid");
  if (!grid) return;

  const favs = getFavorites();

  if (favs.length === 0) {
    grid.innerHTML = `<p class="text-center text-muted my-4">No favorites saved yet!</p>`;
    return;
  }

  grid.innerHTML = favs.map(item => `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 bg-black text-white border-secondary shadow-sm">
        ${item.media_type === "image" 
          ? `<img src="${item.url}" class="card-img-top" alt="${item.title}" style="height: 180px; object-fit: cover;">`
          : `<div class="p-4 text-center text-info bg-dark">🎥 Video Media</div>`
        }
        <div class="card-body d-flex flex-column">
          <h6 class="card-title text-truncate">${item.title}</h6>
          <small class="text-info mb-2">📅 ${item.date}</small>
          <div class="mt-auto d-flex justify-content-between align-between gap-2">
            <button class="btn btn-sm btn-outline-info btn-load-fav" data-date="${item.date}" data-bs-dismiss="modal">View</button>
            <button class="btn btn-sm btn-outline-danger btn-remove-fav" data-date="${item.date}">Remove</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");


  grid.querySelectorAll(".btn-load-fav").forEach(btn => {
    btn.addEventListener("click", (e) => {
      loadApod(e.target.dataset.date);
    });
  });

  grid.querySelectorAll(".btn-remove-fav").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const dateToRemove = e.target.dataset.date;
      const updated = getFavorites().filter(item => item.date !== dateToRemove);
      saveFavorites(updated);
      renderFavoritesModal(); 
      loadApod(document.querySelector("#select_date").value); 
    });
  });
}


function loadApod(selectedDate = "") {
  const app = document.querySelector("#app");
  const datePicker = document.querySelector("#select_date");

  if (!app) return;

  app.innerHTML = `
    <div class="text-center my-5">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-white">Fetching space data...</p>
    </div>
  `;

  let url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
  if (selectedDate) {
    url += `&date=${selectedDate}`;
  }

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (datePicker) datePicker.value = data.date;

     
      const favs = getFavorites();
      const isFav = favs.some(item => item.date === data.date);

      let mediaHtml = "";
      if (data.media_type === "image") {
        mediaHtml = `<img src="${data.url}" alt="${data.title}" class="img-fluid rounded shadow my-3" />`;
      } else if (data.media_type === "video" && data.url && data.url.includes("youtube")) {
        mediaHtml = `
          <div class="ratio ratio-16x9 my-3 rounded overflow-hidden">
            <iframe src="${data.url}" title="${data.title}" allowfullscreen></iframe>
          </div>
        `;
      } else {
        mediaHtml = `
          <div class="ratio ratio-16x9 my-3 rounded overflow-hidden">
            <video src="${data.url}" controls></video>
          </div>
        `;
      }

      app.innerHTML = `
        <div class="card bg-dark text-white border-secondary shadow-lg p-3 p-md-4">
          <div class="card-body text-center">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="badge text-bg-info">📅 ${data.date}</span>
              <button id="btn-toggle-fav" class="btn ${isFav ? 'btn-danger' : 'btn-outline-danger'} btn-sm">
                ${isFav ? '❤️ Saved in Favorites' : '🤍 Save to Favorites'}
              </button>
            </div>
            <h1 class="card-title h2 mb-3">${data.title}</h1>
            ${mediaHtml}
            <p class="card-text explanation text-start mt-3">${data.explanation}</p>
          </div>
        </div>
      `;

    
      document.querySelector("#btn-toggle-fav").addEventListener("click", () => {
        let currentFavs = getFavorites();
        const existingIndex = currentFavs.findIndex(item => item.date === data.date);

        if (existingIndex > -1) {
        
          currentFavs.splice(existingIndex, 1);
        } else {
          // Save new item
          currentFavs.push({
            date: data.date,
            title: data.title,
            url: data.url,
            media_type: data.media_type
          });
        }

        saveFavorites(currentFavs);
        loadApod(data.date);  
      });
    })
    .catch(err => {
      app.innerHTML = `
        <div class="alert alert-danger my-3" role="alert">
          <h4 class="alert-heading">Error Loading APOD</h4>
          <p>${err.message}</p>
        </div> 
      `;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const datePicker = document.querySelector("#select_date");
  const btnRandom = document.querySelector("#btn-random");
  const favsModal = document.querySelector("#favsModal");

  const today = new Date().toISOString().split("T")[0];
  if (datePicker) {
    datePicker.max = today;
    datePicker.addEventListener("change", (e) => {
      if (e.target.value) loadApod(e.target.value);
    });
  }

  if (btnRandom) {
    btnRandom.addEventListener("click", () => {
      loadApod(getRandomApodDate());
    });
  }

  if (favsModal) {
    favsModal.addEventListener("show.bs.modal", renderFavoritesModal);
  }

  updateFavCount();
  loadApod();
});
