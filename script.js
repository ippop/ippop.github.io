let currentCharacter = null;
let savedCharacters = JSON.parse(
  localStorage.getItem("savedCharacters") || "[]"
);

// Initial setup
window.onload = function () {
  document.getElementById("characterFormSection").style.display = "block";
  document.getElementById("deleteCharacterBtn").classList.add("disabled");
  updateSavedCharactersList();
  updateButtonStates();
  generateRandomName();
};

// Creates new character unsaved, resets character selection
function showNewCharacterForm() {
  document.getElementById("characterFormSection").style.display = "block"; // TODO: probably can remove this
  document.getElementById("charactersTab").style.display = "none";
  document.getElementById("characterName").value = "";
  document.getElementById("characterName").focus();

  // Deselect character and randomize a name
  currentCharacter = null;
  generateRandomName();
}

function createNewCharacter() {
  var name = document.getElementById("characterName").value.trim();

  if (!name) { // Empty string? Generate a random name
    generateRandomName();
    name = document.getElementById("characterName").value.trim();
  }
  // Check if name already exists
  if (savedCharacters.some((char) => char.name === name)) {
    alert("A character with this name already exists!"); // TODO: option to overwrite or save new?
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

function rollStat() { // TODO: update to balance final roll. Let player switch stats, always default to order of largest first (str). For character generation have them prioritize based on class
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
    //alert("No character to save!");
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
    //alert("Character updated successfully!");
  } else {
    //alert("Error: Character not found in saved list!");
  }

  updateSavedCharactersList();
}

// Function that gets called when text is entered
function nameInputUpdate() {
  // No character do nothing
  if(!currentCharacter) {
    return;
  }
  currentCharacter.name = document.getElementById("characterName").value.trim();
  if(!currentCharacter.name) {
    document.getElementById("noNameModal").style.display =
    "flex";
    //alert("Character needs a name!");
    return;
  }
  // Just update character name
  saveCharacter();
}

function newCharacterName() {
  generateRandomName();
  currentCharacter.name = document.getElementById("characterName").value.trim();
  saveCharacter();
  closeNoNameModal();
}

// Adding an event listener to the input field to call onInputChange when text is typed
const inputField = document.getElementById("characterName");
inputField.addEventListener("blur", nameInputUpdate); // "Input" for every text change, "Blur" for every deselect input for less spam

function openCharacterSelector() {
  document.getElementById("characterFormSection").style.display = "block"; // TODO: probably can remove this, used to be none
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

    document.getElementById('characterName').value = currentCharacter.name;

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

function closeNoNameModal() {
  document.getElementById("noNameModal").style.display =
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

// Changes race of the current selected character to the "race" input
function selectRace(race) {
  if (!currentCharacter) {
    createNewCharacter();
  }
  currentCharacter.race = race

  updateCharacterInfo();
  updateRaceButtons();
  saveCharacter(); // Auto-save when race is selected
  openTab(2); // TODO: make it switch to next tab from TODO list. 0 when complete. Toggle to stay on page?
}

// Changes class of current selected character to the "characterClass" input
function selectClass(characterClass) {
  if (!currentCharacter) {
    createNewCharacter();
  }
  currentCharacter.class = characterClass

  updateCharacterInfo();
  updateClassButtons();
  saveCharacter(); // Auto-save when class is selected
  openTab(0); // TODO: make it switch to next tab from TODO list. 0 when complete
}

// Updates info on overview tab
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

// updates race buttons if selected or unselected
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// Name Generator ////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const firstNames = [
    "Aldrich", "Balthazar", "Cedric", "Darius", "Edmund", "Finnegan", "Galahad", "Henrik", "Igor", "Jasper",
    "Kendrick", "Lysander", "Magnus", "Nathaniel", "Octavius", "Perseus", "Quinlan", "Roderick", "Sebastian", "Thaddeus",
    "Ulric", "Viktor", "Wilhelm", "Xavier", "Yorick", "Zacharias", "Alaric", "Benedict", "Constantine", "Dominic",
    "Eleanor", "Freya", "Guinevere", "Helena", "Isolde", "Juliana", "Katerina", "Lucinda", "Marigold", "Nimue",
    "Ophelia", "Primrose", "Rosalind", "Sylvanna", "Theodora", "Ursula", "Violet", "Wilhelmina", "Xandra", "Yseult",
    "Ariadne", "Beatrix", "Celestia", "Delphine", "Evangeline", "Fiona", "Gwendolyn", "Gwynex", "Heloise", "Iris", "Jessamine",
    "Katriona", "Lyra", "Meridian", "Nephele", "Odette", "Penelope", "Quinn", "Rhiannon", "Seraphina", "Thessaly",
    "Undine", "Valeria", "Wynne", "Xiomara", "Yvette", "Zelda", "Ademar", "Baudoin", "Clovis", "Draven",
    "Eldred", "Falco", "Gareth", "Hadrian", "Ignatius", "Jorah", "Kestrel", "Leander", "Malachi", "Nikolai",
    "Orion", "Peregrine", "Quintus", "Raphael", "Silas", "Tristan", "Uther", "Varys", "Wolfram", "Xerxes",
    "Yoren", "Zephyr", "Aldwin", "Blackwood", "Caspian", "Drake", "Evander", "Falcon", "Galamir", "Hawthorne", "Harris",
    "Laufrey", "Faye", "Magni", "Brodi", "Gadd", "Gertrud", "Torsten", "Tård", "Örjan", "Ulf" , "Klaes", "Tor", "Tyr", "Anton",
    "Geoffrey", "Stig", "Stefan", "Jakob", "Oden", "Mordecai"
];

const lastNames = [
    "Alfheim", "Blackwood", "Crowley", "Duskfall", "Elderhart", "Foxglove", "Greywind", "Hawthorne", "Ironweave", "Jadestar", "Kingsley",
    "Lightbringer", "Moonshadow", "Nightshade", "Oakenshield", "Phoenixdown", "Queensbury", "Ravenscroft", "Silvermark", "Thornheart", "Umbermist",
    "Valorheart", "Winterborne", "Wyvernguard", "Yellowcloak", "Zephyrheart", "Ashenheart", "Bolderhart", "Crimsonweave", "Dragonbane", "Ebonhart",
    "Frostweaver", "Goldencrest", "Heavensblade", "Iceforge", "Jesterly", "Knightfall", "Lionheart", "Mistweaver", "Northstar", "Obsidianforge",
    "Proudspear", "Queensgard", "Runeheart", "Stormwind", "Thornguard", "Underhill", "Valekeeper", "Warweaver", "Xenohart", "Yewkeeper",
    "Aldermark", "Blackthorn", "Crestfall", "Darkweaver", "Eldermark", "Flameheart", "Greymark", "Highwind", "Ironheart", "Jadeweaver",
    "Kingsmark", "Lightweaver", "Moonweaver", "Nightweaver", "Oakenmark", "Phoenixheart", "Queensmark", "Ravenmark", "Silverweaver", "Thornmark",
    "Darksworth", "Blackmantle", "Stormweaver", "Frostbane", "Shadowheart", "Dawnkeeper", "Moonblade", "Steelwind", "Wraithbane", "Thundermark",
    "Grimweaver", "Starweaver", "Ghostheart", "Frostweave", "Shadowmark", "Dawnweaver", "Moonkeeper", "Steelheart", "Wraithweaver", "Thunderheart",
    "Dreadweaver", "Stormheart", "Ghostmark", "Frostmark", "Shadowweaver", "Dawnmark", "Moonweave", "Steelmark", "Wraithmark", "Thunderweave"
];

const honorifics = ["Sir", "Lady", "Lord", "Dame", "Master", "Mistress", "Dr", "Elder"];
const particles = ["von", "van", "de", "af", "der", "of"];

function generateRandomName() {
    const useHonorific = Math.random() < 0.1; // 10% chance
    const useParticle = Math.random() < 0.1;  // 10% chance
    
    let name = "";
    
    if (useHonorific) {
        name += honorifics[Math.floor(Math.random() * honorifics.length)] + " ";
    }
    
    name += firstNames[Math.floor(Math.random() * firstNames.length)];
    
    if (useParticle) {
        name += " " + particles[Math.floor(Math.random() * particles.length)];
    }
    
    name += " " + lastNames[Math.floor(Math.random() * lastNames.length)];
    
    document.getElementById('characterName').value = name;
}

function generateRandomNameAndSave() {
  generateRandomName();
  if(currentCharacter) {
    currentCharacter.name = document.getElementById('characterName').value;
    saveCharacter();
  }
}
