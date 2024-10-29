async function fetchAndStoreCharacters() {
  try {
    const response = await fetch("https://rickandmortyapi.com/api/character");
    const data = await response.json();
    const characters = data.results.slice(0, 20).map((char) => ({
      id: char.id,
      name: char.name,
      status: char.status,
      species: char.species,
      image: char.image,
    }));

    characters.forEach(async (character) => {
      await fetch("http://localhost:3000/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(character),
      });
    });
  } catch (error) {
    console.error("Error fetching characters:", error);
  }
}

// fetchAndStoreCharacters();

let currentPage = 1;
let searchValue = "";
let characterStatus = "alive";
let maxPages;

const tileBox = document.getElementById("tile-container");
const searchInput = document.getElementById("search");
const selectStatus = document.querySelectorAll('input[name="status"]');
const newCharacterName = document.getElementById("new-character");
const newStatus = document.getElementById("new-status");
const newSpecies = document.getElementById("new-species");

async function fetchCharacter() {
  try {
    const response = await fetch(
      `http://localhost:3000/characters?_page=${currentPage}&_limit=5&status_like=${characterStatus}&name_like=${searchValue}`
    );
    const data = await response.json();
    const totalCharacters = response.headers.get("X-Total-Count");
    maxPages = Math.ceil(totalCharacters / 5);
    if (data.length === 0) {
      createNoResutlMessage();
    } else {
      renderCharactersTile(data);
    }
  } catch (error) {
    console.error("Problem z pobraniem danych", error);
  }
}
fetchCharacter();

function renderCharactersTile(characters) {
  tileBox.innerHTML = "";

  characters.forEach((character) => {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.innerHTML = `
    <img src=${character.image} alt=${character.name}>
    <h2>${character.name}</h2>
    <div class=tile-info>
    <p>Status: ${character.status}</p>
    <p>Gatunke: ${character.species}</p>
    <button class="delete-button" onclick="deleteCharacter(${character.id}, event)">Usuń Postać</button>
    </div>`;
    tileBox.append(tile);
  });
}

async function deleteCharacter(id, event) {
  event.preventDefault();
  try {
    await fetch(`http://localhost:3000/characters/${id}`, {
      method: "DELETE",
    });
    fetchCharacter();
  } catch (error) {
    console.error("Błąd przy usuwaniu postaci", error);
  }
}

async function addCharacter() {
  if (!newCharacterName.value || !newSpecies.value) {
    return alert("Uzupełnij wymagane pola");
  }
  const postData = {
    id: "",
    name: newCharacterName.value,
    status: newStatus.value,
    species: newSpecies.value,
    image: "https://rickandmortyapi.com/api/character/avatar/3.jpeg",
  };
  try {
    await fetch(`http://localhost:3000/characters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });
    newCharacterName.value = "";
    newStatus.value = "";
    newSpecies.value = "";
    fetchCharacter();
  } catch (error) {
    console.error("Błąd przy tworzeniu postaci", error);
  }
}

searchInput.addEventListener("input", () => {
  searchValue = searchInput.value;
  currentPage = 1;
  fetchCharacter();
});

function nextPage() {
  if (currentPage < maxPages) currentPage++;
  fetchCharacter();
}

function prevPage() {
  if (currentPage > 1) currentPage--;
  fetchCharacter();
}

function createNoResutlMessage() {
  tileBox.innerHTML = "";
  const message = document.createElement("div");
  message.innerHTML = `<p id ="message" >Nie znaleziono postaci spełniających kryteria wyszukiwania.</p>`;
  tileBox.append(message);
}

selectStatus.forEach((radio) => {
  if (radio.value === "alive") {
    radio.checked = true;
  }

  radio.addEventListener("change", (event) => {
    characterStatus = event.target.value;
    currentPage = 1;
    fetchCharacter();
  });
});

