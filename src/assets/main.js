const API_KEY = import.meta.env.VITE_NASA_API_KEY;
const app = document.querySelector("#app");
const datePicker = document.querySelector("#select_date");
const btnRandom = document.querySelector("#btn-random");


const today = new Date().toISOString().split("T")[0];
datePicker.max = today;


function getRandomApodDate() {
  const startDate = new Date("1995-06-16").getTime(); 
  const endDate = new Date().getTime();
  const randomTime = startDate + Math.random() * (endDate - startDate);
  return new Date(randomTime).toISOString().split("T")[0];
}

 
function loadApod(selectedDate = "") {
 
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
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
       
      datePicker.value = data.date;

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
            <h1 class="card-title h2 mb-3">${data.title}</h1>
            <span class="badge text-bg-info mb-3">📅 ${data.date}</span>
            ${mediaHtml}
            <p class="card-text explanation text-start mt-3">${data.explanation}</p>
          </div>
        </div>
      `;
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

 
datePicker.addEventListener("change", (e) => {
  const chosenDate = e.target.value;
  if (chosenDate) {
    loadApod(chosenDate);
  }
});

 
btnRandom.addEventListener("click", () => {
  const randomDate = getRandomApodDate();
  loadApod(randomDate);
});

 
loadApod();