let currentCharacter = null;
let savedCharacters = JSON.parse(
  localStorage.getItem("savedCharacters") || "[]"
);

// Initial setup
window.onload = function () {
  document.getElementById("characterFormSection").style.display = "none";
  document.getElementById("deleteCharacterBtn").classList.add("disabled");
  updateSavedCharactersList();
  updateButtonStates();
};

function showNewCharacterForm() {
  document.getElementById("characterFormSection").style.display = "block";
  document.getElementById("charactersTab").style.display = "none";
  document.getElementById("characterName").value = "";
  document.getElementById("characterName").focus();
}

function createNewCharacter() {
  const name = document.getElementById("characterName").value.trim();
  if (!name) {
    alert("Please enter a character name!");
    return;
  }

  // Check if name already exists
  if (savedCharacters.some((char) => char.name === name)) {
    alert("A character with this name already exists!");
    return;
  }

  currentCharacter = {
    id: Date.now().toString(), // Unique ID based on timestamp
    name: name,
    race: null,
    class: null,
    stats: generateStats(),
  };

  // Add to saved characters list immediately
  savedCharacters.push({ ...currentCharacter });
  localStorage.setItem(
    "savedCharacters",
    JSON.stringify(savedCharacters)
  );

  document.getElementById("characterFormSection").style.display = "none";
  updateCharacterInfo();
  clearSelections();
  openTab(1);
  updateSavedCharactersList();
  updateButtonStates();
}

function generateStats() {
  const baseStats = {
    Strength: rollStat(),
    Dexterity: rollStat(),
    Constitution: rollStat(),
    Intelligence: rollStat(),
    Wisdom: rollStat(),
    Charisma: rollStat(),
  };
  return baseStats;
}

function rollStat() {
  // Roll 4d6, drop lowest
  const rolls = Array.from(
    { length: 4 },
    () => Math.floor(Math.random() * 6) + 1
  );
  rolls.sort((a, b) => b - a);
  return rolls.slice(0, 3).reduce((a, b) => a + b, 0);
}

function saveCharacter() {
  if (!currentCharacter) {
    alert("No character to save!");
    return;
  }

  const existingIndex = savedCharacters.findIndex(
    (char) => char.id === currentCharacter.id
  );
  if (existingIndex >= 0) {
    savedCharacters[existingIndex] = { ...currentCharacter };
    localStorage.setItem(
      "savedCharacters",
      JSON.stringify(savedCharacters)
    );
    alert("Character updated successfully!");
  } else {
    alert("Error: Character not found in saved list!");
  }

  updateSavedCharactersList();
}

function openCharacterSelector() {
  document.getElementById("characterFormSection").style.display = "none";
  const charactersTab = document.getElementById("charactersTab");

  if (charactersTab.style.display === "none") {
    updateSavedCharactersList();
    charactersTab.style.display = "block";
  } else {
    charactersTab.style.display = "none";
  }
}

function loadCharacter(id) {
  const charIndex = savedCharacters.findIndex((char) => char.id === id);
  if (charIndex >= 0) {
    currentCharacter = { ...savedCharacters[charIndex] };
    updateCharacterInfo();
    updateRaceButtons();
    updateClassButtons();
    openTab(0);
    updateButtonStates();

    // Highlight the selected character
    document.querySelectorAll(".saved-character").forEach((el) => {
      el.classList.remove("active");
    });
    document.getElementById(`char-${id}`).classList.add("active");
  }
}

function showDeleteConfirmation() {
  if (!currentCharacter) {
    alert("No character selected to delete!");
    return;
  }

  document.getElementById("deleteCharacterName").textContent =
    currentCharacter.name;
  document.getElementById("deleteConfirmationModal").style.display =
    "flex";
}

function closeDeleteModal() {
  document.getElementById("deleteConfirmationModal").style.display =
    "none";
}

function deleteCharacter() {
  if (!currentCharacter) return;

  const index = savedCharacters.findIndex(
    (char) => char.id === currentCharacter.id
  );
  if (index >= 0) {
    savedCharacters.splice(index, 1);
    localStorage.setItem(
      "savedCharacters",
      JSON.stringify(savedCharacters)
    );

    // Select another character or set to null
    if (savedCharacters.length > 0) {
      currentCharacter = { ...savedCharacters[0] };
    } else {
      currentCharacter = null;
    }

    updateCharacterInfo();
    updateRaceButtons();
    updateClassButtons();
    updateSavedCharactersList();
    updateButtonStates();
    closeDeleteModal();
  }
}

function updateSavedCharactersList() {
  const list = document.getElementById("savedCharactersList");
  const noCharactersMessage = document.getElementById(
    "noCharactersMessage"
  );

  if (savedCharacters.length === 0) {
    list.innerHTML = "";
    noCharactersMessage.style.display = "block";
    return;
  }

  noCharactersMessage.style.display = "none";
  list.innerHTML = savedCharacters
    .map(
      (char) => `
          <div id="char-${char.id}" class="saved-character ${
        currentCharacter && char.id === currentCharacter.id
          ? "active"
          : ""
      }" onclick="loadCharacter('${char.id}')">
              <h3>${char.name}</h3>
              <p>${char.race || "No race"} ${char.class || "No class"}</p>
          </div>
      `
    )
    .join("");
}

function updateButtonStates() {
  // Enable/disable delete button based on whether a character is selected
  const deleteBtn = document.getElementById("deleteCharacterBtn");
  if (currentCharacter) {
    deleteBtn.classList.remove("disabled");
  } else {
    deleteBtn.classList.add("disabled");
  }
}

function openTab(tabIndex) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  document.getElementById("tab" + tabIndex).classList.add("active");

  document.querySelectorAll(".tab-btn").forEach((btn, index) => {
    if (index === tabIndex) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function selectRace(race) {
  if (!currentCharacter) {
    alert("Please create a new character first!");
    return;
  }

  currentCharacter.race = race;
  updateCharacterInfo();
  updateRaceButtons();
  saveCharacter(); // Auto-save when race is selected
  openTab(2);
}

function selectClass(characterClass) {
  if (!currentCharacter) {
    alert("Please create a new character first!");
    return;
  }

  currentCharacter.class = characterClass;
  updateCharacterInfo();
  updateClassButtons();
  saveCharacter(); // Auto-save when class is selected
  openTab(0);
}

function updateCharacterInfo() {
  const infoDiv = document.getElementById("characterInfo");
  if (!currentCharacter) {
    infoDiv.innerHTML =
      '<p>No character created yet. Click "Create New Character" to begin.</p>';
    return;
  }

  let info = `<h3>${currentCharacter.name}</h3>`;
  info += `<p>Race: ${currentCharacter.race || "Not selected"}</p>`;
  info += `<p>Class: ${currentCharacter.class || "Not selected"}</p>`;

  if (currentCharacter.stats) {
    info += '<div class="stats-grid">';
    for (const [stat, value] of Object.entries(currentCharacter.stats)) {
      info += `
                  <div class="stat-box">
                      <h4>${stat}</h4>
                      <p>${value}</p>
                  </div>
              `;
    }
    info += "</div>";
  }

  infoDiv.innerHTML = info;
}

function updateRaceButtons() {
  document
    .querySelectorAll("#raceButtons .choice-card")
    .forEach((card) => {
      card.classList.remove("selected");
      if (
        currentCharacter?.race &&
        card.querySelector("h3").textContent === currentCharacter.race
      ) {
        card.classList.add("selected");
      }
    });
}

function updateClassButtons() {
  document
    .querySelectorAll("#classButtons .choice-card")
    .forEach((card) => {
      card.classList.remove("selected");
      if (
        currentCharacter?.class &&
        card.querySelector("h3").textContent === currentCharacter.class
      ) {
        card.classList.add("selected");
      }
    });
}

function clearSelections() {
  document.querySelectorAll(".choice-card").forEach((card) => {
    card.classList.remove("selected");
  });
}