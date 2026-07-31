const API_KEY = import.meta.env.VITE_NASA_API_KEY;


document.querySelector("#app").innerHTML = "<p>Loading daily picture...</p>";


fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    let media;

    
    if (data.media_type === "image") {
      media = `<img src="${data.url}" alt="${data.title}" class="apod-image" />`;
    } else if (data.media_type === "video" && data.url.includes("youtube")) {
      media = `<iframe src="${data.url}" frameborder="0" allowfullscreen class="apod-video"></iframe>`;
    } else {
      media = `<video src="${data.url}" controls class="apod-video"></video>`;
    }

    document.querySelector("#app").innerHTML = `
      <h1>${data.title}</h1>
      ${media}
      <p class="explanation">${data.explanation}</p>
    `;
  })
  .catch(err => {
    document.querySelector("#app").innerHTML = `<p class="error">Error loading image: ${err.message}</p>`;
  });