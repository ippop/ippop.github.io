let currentCharacter = null;
let currentChoice = null;

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
    level: 1,
    race: null,
    class: {Fighter: 0, Specialist: 0, Cleric: 0, Mage: 0},
    class_name: "",
    stats: generateStats(), // object with lists, base stat first then modifiers tagged with their origins
    proficiencyBonus: 3,
    hp: Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 12,
    hitDice: 0,
    movespeed: [],
    equipment: [],
    money: {Platinum: 0, Gold: 0, Silver: 0, Copper: 0},
    proficiencies:
    {
      skills:
      {
        athletics: 0, acrobatics: 0, sleightofHand: 0, stealth: 0, arcana: 0, history: 0, investigation: 0,
        nature: 0, religion: 0, animalHandling: 0, insight: 0, medicine: 0, perception: 0, survival: 0,
        deception: 0, intimidation: 0, performance: 0, persuasion: 0
      }, // times proficiency bonus
    saves: 
    {
      strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0}, instruments: [], tools: [], armor: [], weapons: []
    }, // stored with value, 1 for proficient, 2 for expert
    feats: [],
    choices: [],
    choiceIdCounter: 0 // simple way to give unique IDs to choice items
  };

  // Add to saved characters list immediately
  savedCharacters.push({ ...currentCharacter });
  localStorage.setItem(
    "savedCharacters",
    JSON.stringify(savedCharacters)
  );

  initChoiceList();

  //updateCharacterInfo();
  clearSelections();
  openTab("Race");
  //updateSavedCharactersList();
  //updateButtonStates();
  //updateStatButtons();
  updateEverything()
}

function generateStats() {
  const baseStats = {
    Strength: [{stat: rollStat(), parent: null}],
    Dexterity: [{stat: rollStat(), parent: null}],
    Constitution: [{stat: rollStat(), parent: null}],
    Intelligence: [{stat: rollStat(), parent: null}],
    Wisdom: [{stat: rollStat(), parent: null}],
    Charisma: [{stat: rollStat(), parent: null}],
  };
  return baseStats;
}

function rollStat4d6() { // TODO: update to balance final roll. Let player switch stats, always default to order of largest first (str). For character generation have them prioritize based on class
  // Roll 4d6, drop lowest
  const rolls = Array.from(
    { length: 4 },
    () => Math.floor(Math.random() * 6) + 1
  );
  rolls.sort((a, b) => b - a);
  return rolls.slice(0, 3).reduce((a, b) => a + b, 0);
}

function rollStat() {
  return Math.floor(Math.random() * 10) + -5;
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

// Function that gets called when text in name field is entered
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
    currentChoice = null;
    updateCharacterInfo();
    updateRaceButtons();
    updateClassButtons();
    openTab("Overview");
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

    updateEverything();
    closeDeleteModal();
  }
}

// updates all character information displayed on HTML pages
function updateEverything() {
  updateCharacterInfo();
  updateRaceButtons();
  updateClassButtons();
  updateSavedCharactersList();
  updateButtonStates();
  updateStatButtons();
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
              <p>${char.race || "No race"} ${char.class_name || "No class"}</p>
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

function updateStatButtons() {
  const strNumber = document.getElementById("stat-value-strength");
  const dexNumber = document.getElementById("stat-value-dexterity");
  const conNumber = document.getElementById("stat-value-constitution");
  const intNumber = document.getElementById("stat-value-intelligence");
  const wisNumber = document.getElementById("stat-value-wisdom");
  const chaNumber = document.getElementById("stat-value-charisma");

  // reset colors and numbers if no character selected, such as when deleting a character
  if(!currentCharacter) {
    strNumber.innerText = 0;
    strNumber.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    dexNumber.innerText = 0;
    dexNumber.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    conNumber.innerText = 0;
    conNumber.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    intNumber.innerText = 0;
    intNumber.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    wisNumber.innerText = 0;
    wisNumber.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    chaNumber.innerText = 0;
    chaNumber.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
  }

  const str = getStatStr();
  const dex = getStatDex();
  const con = getStatCon();
  const int = getStatInt();
  const wis = getStatWis();
  const cha = getStatCha();
  
  statNumber(strNumber, str);
  statNumber(dexNumber, dex);
  statNumber(conNumber, con);
  statNumber(intNumber, int);
  statNumber(wisNumber, wis);
  statNumber(chaNumber, cha);
}

// Displays ability score with + if positive and colors it green, also colors it red if negative
function statNumber(statNumber, stat) {
  if(stat > 0) {
    statNumber.innerText = "+" + stat;
    statNumber.style.color = 'green';
  }
  else if(stat < 0) {
    statNumber.innerText = stat;
    statNumber.style.color = 'red';
  }
  else {
    statNumber.innerText = stat;
    statNumber.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
  }
}

function getStatStr() {  return currentCharacter.stats.Strength.reduce((sum, nextValue) => sum+nextValue.stat, 0);}
function getStatDex() {  return currentCharacter.stats.Dexterity.reduce((sum, nextValue) => sum+nextValue.stat, 0);}
function getStatCon() {  return currentCharacter.stats.Constitution.reduce((sum, nextValue) => sum+nextValue.stat, 0);}
function getStatInt() {  return currentCharacter.stats.Intelligence.reduce((sum, nextValue) => sum+nextValue.stat, 0);}
function getStatWis() {  return currentCharacter.stats.Wisdom.reduce((sum, nextValue) => sum+nextValue.stat, 0);}
function getStatCha() {  return currentCharacter.stats.Charisma.reduce((sum, nextValue) => sum+nextValue.stat, 0);}

// Opens corret tab and selects a choice that fits the tab
function openTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Open correct tab
  document.getElementById("tab-" + tabName).classList.add("active");

  // Highlight selected tab button that is selected
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    if (btn.classList.contains(tabName)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Select a choice that fits the tab "tabName" if one exist
  selectChoice(tabName);
}

// Goes to the next choice in the choice list and relevant tab. Goes back to overview if all choices are complete
function nextTab() {
  const index = currentCharacter.choices.findIndex(item => item.completed === false);
  if(index === -1) {
    currentChoice = null;
    openTab("Overview");
  }
  else {
    currentChoice = currentCharacter.choices[index];
    openTab(currentCharacter.choices[index].type);
  }
}

function addFeature(parent, title, description) {
  currentCharacter.feats.push(`<h4>${title}:</h4><p>${description}</p>`, parent);
}

// Changes race of the current selected character to the "race" input
function selectRace(race) {
  if (!currentCharacter) {
    createNewCharacter();
  }
  // Already selected race before then change the existing choice
  if (!currentCharacter.race) {
    // Find race choice, should always be only 1
    const index = currentCharacter.choices.findIndex(choice => choice.type === "Race");
    if(index !== -1)
      removeChoiceChildren(currentCharacter.choices[index].id);
  }

  // make sure we can only select class while we still have levels
  const raceChoice = currentCharacter.choices.find((choice) => choice.type === "Race");
  raceChoice.completed = true;
  raceChoice.mouseover = race;
  raceChoice.value = race; // adds (<choice>) to completed choice
  currentCharacter.race = race;

  switch(race) {
    case 'Human':
      addChoice({id: currentCharacter.choiceIdCounter++, name: "Choose Ability Score", completed: false, type: "Skill", parent: raceChoice.id}); // ADD choice Ability Score (name: Human Ability Score). Should be hidden tab (not switchable to without the choice)
      currentCharacter.movespeed[0] = 6;
      // TODO: add feat choice
      // CULTURE Skill
      // CULTURE culture weapons?
      break;
    case 'Dwarf':
      // +1 constitution
      // 5m speed
      // FEAT and passive +1 max HP per level
      // FEAT Poison Resistance (TODO: later make it stat)
      addFeature(raceChoice, "Tremorsense", "Bonus action to gain tremorsense 60 feet"); // FEAT tremorsense (Perhaps TODO list for each action, then this is tagged as bonus)
      // CULTURE language
      // CULTURE Tool (3 choices)
      // CULTURE FEAT stonecunning
      // CULTURE weapons
      break;
    case 'Elf':
      // Choice subclass
      //    Subrace ability score
      //    Subrace spellchoice or movement or feats
      // FEAT low light
      // FEAT Trance
      // FEAT charm resistance
      // PROFICIENCY Keen Senses
      break;
    case 'Halfling':
      // +1 charisma
      // 5m speed
      // FEAT small
      // FEAT lucky
      // FEAT halfling nimble
      // CULTURE language
      // CULTURE brave
      break;
    case 'Orc':
      // +1 Strength
      // FEAT relentless endurance
      // FEAT iron stomach
      // FEAT powerful build
      // CULTURE language
      // CULTURE savage attacks
      break;
  } 

  updateChoiceList();
  updateCharacterInfo();
  updateRaceButtons();
  saveCharacter(); // Auto-save when race is selected
  nextTab();
}

// Changes class of current selected character to the "characterClass" input
function selectClass(characterClass) {
  if (!currentCharacter) {
    createNewCharacter();
  }

  // TODO: when changing earlier class levels, remove class choice children but remember level then add levels again (or just set them to uncomplete, i.e reset them?)

  // if currentChoice is not a class choice, find latest class choice
  if(currentChoice === null || currentChoice.type !== "Class") {

    // Find oldest uncompleted class choice, if all complete choose newest class choice
    for (let i = 0; i < currentCharacter.choices.length; i++) {
      if(currentCharacter.choices[i].type === "Class") {
        currentChoice = currentCharacter.choices[i];

        // Break if choice is incomplete
        if(!currentChoice.completed) {
          break;
        }
      }
    } 
  }

  // remove previous choice if one for this choice is already made
  if(currentChoice.value) {
      currentCharacter.class[currentChoice.value]--;
  }

  // level up current class
  currentCharacter.class[characterClass]++;

  // Check if not using a custom class name and instead using atleast one of the 4 base classes
  const baseClasses = [`Fighter`, `Specialist`, `Cleric`, `Mage`];
  if(currentCharacter.class_name === "" || baseClasses.some(baseClass => currentCharacter.class_name.startsWith(baseClass))) {

    // Generate class name based on classes leveled, sorted by highest level first
    currentCharacter.class_name = Object.entries(currentCharacter.class)
      .filter(([key, value]) => value > 0)  // Exclude variables with values <= 0
      .sort((a, b) => b[1] - a[1])          // Sort by value, descending order
      .map(([key]) => key)                  // Extract only the variable names
      .join('-');                           // Join the names with a hyphen
  }

  // make sure we can only select class while we still have levels
  currentChoice.completed = true;
  currentChoice.mouseover = characterClass + " level " + currentCharacter.class[characterClass];
  currentChoice.value = characterClass;

  updateChoiceList();
  updateCharacterInfo();
  updateClassButtons();
  saveCharacter(); // Auto-save when class is selected
  nextTab();
}

// stat is ability score in text, ex "Strength". Result is increase of ability score chosen
function selectStat(stat) {
  // Stats SHOULD in theory always be generated when I get here, do not have to check for it

  // Names of lists to search through in object
  const statAttributes = [
    'Strength', 'Dexterity', 'Constitution', 
    'Intelligence', 'Wisdom', 'Charisma'
  ];

  // Search all stat lists if this choice selected ability score already
  for (const attribute of statAttributes) {

    const index = characterStats[attribute].findIndex(item => item.id === targetId);

    // If found, remove it (only first encountered)
    if (index !== -1) {
      currentCharacter.stats[attribute].splice(index, 1);
      break;
    }

    currentCharacter.stats[stat].push({value: 1, parent: currentChoice.id});
  }


}
// TODO other selects. Require we have the choice in our choice list


// Updates info on overview tab
function updateCharacterInfo() {
  const infoDiv = document.getElementById("characterInfo");
  if (!currentCharacter) {
    infoDiv.innerHTML =
      '<p>No character created yet. Click "Create New Character" to begin.</p>';
    return;
  }

  // Pre calculate and save ability scores to skip multiple recalculations
  const abilityScores = [getStatStr(), getStatDex(), getStatCon(), getStatInt(), getStatWis(), getStatCha()];

  let info = `<div class="text-grid"><div><h3>${currentCharacter.name}</h3>`;
  info += `<p>Level: ${currentCharacter.level}</p>`;
  info += `<p>Race: ${currentCharacter.race || "Not selected"}</p>`;
  info += `<p>Class: ${currentCharacter.class_name || "Not selected"}</p>`;

  info += `</div>`;

  // hp, hitdice
  info += `<div>`;
  info += `<p>Max Hit Points (HP): ${currentCharacter.hp+currentCharacter.level*abilityScores[2]}</p><p>Hit Dice: ${currentCharacter.hitDice}</p>`;

  // movementspeed
  info += `<p>Movement Speed: ${currentCharacter.movespeed}</p>`;

  // TODO: armorclass
  info += `<p>Evasion: ${currentCharacter.hp}</p>`;
  info += `<p>Armor: ${currentCharacter.hp}</p>`;
  info += `<p>Damage Reduction: ${currentCharacter.hp}</p>`;
  info += `</div>`;

  info += `<div>`;

  // TODO: Attacks
  info += `<h4>Attacks</h4>`;

  info += `</div></div>`;

  let i = 0;
  if (currentCharacter.stats) {
    info += `<div class="stats-grid">`; // TODO: add proper explanation to this line ||| title="${stat}+stat+stat"
    for (const [stat, value] of Object.entries(currentCharacter.stats)) {
      info += `
                  <div class="stat-box">
                      <h4>${stat}</h4>
                      <p>${abilityScores[i]>=0 ? '+' : ""}${abilityScores[i++]}</p>
                  </div>
              `;
    }
    info += "</div>";
  }

  // proficiency bonus
  info += `</div class="stat-box" display=flex><div class="stat-box">Proficiency Bonus: ${currentCharacter.proficiencyBonus}</div></div>`

  info += `<div class="stats-grid"><div class="skill-box">`
  info += `<p>⦾ Athletics: ${currentCharacter.proficiencies.skills.athletics*currentCharacter.proficiencyBonus+abilityScores[0]}</p>`
  info += `<p>⦿ Acrobatics: ${currentCharacter.proficiencies.skills.acrobatics*currentCharacter.proficiencyBonus+abilityScores[1]}</p>`
  info += `<p>✪ Sleight of Hand: ${currentCharacter.proficiencies.skills.sleightofHand*currentCharacter.proficiencyBonus+abilityScores[1]}</p>`
  info += `<p>Stealth: ${currentCharacter.proficiencies.skills.stealth*currentCharacter.proficiencyBonus+abilityScores[1]}</p>`
  info += `<p>Arcana: ${currentCharacter.proficiencies.skills.arcana*currentCharacter.proficiencyBonus+abilityScores[3]}</p>`
  info += `<p>History: ${currentCharacter.proficiencies.skills.history*currentCharacter.proficiencyBonus+abilityScores[3]}</p>`
  info += `<p>Investigation: ${currentCharacter.proficiencies.skills.investigation*currentCharacter.proficiencyBonus+abilityScores[3]}</p>`
  info += `<p>Nature: ${currentCharacter.proficiencies.skills.nature*currentCharacter.proficiencyBonus+abilityScores[3]}</p>`
  info += `<p>Religion: ${currentCharacter.proficiencies.skills.religion*currentCharacter.proficiencyBonus+abilityScores[3]}</p>`
  info += `<p>Animal Handling: ${currentCharacter.proficiencies.skills.animalHandling*currentCharacter.proficiencyBonus+abilityScores[4]}</p>`
  info += `<p>Insight: ${currentCharacter.proficiencies.skills.insight*currentCharacter.proficiencyBonus+abilityScores[4]}</p>`
  info += `<p>Medicine: ${currentCharacter.proficiencies.skills.medicine*currentCharacter.proficiencyBonus+abilityScores[4]}</p>`
  info += `<p>Perception: ${currentCharacter.proficiencies.skills.perception*currentCharacter.proficiencyBonus+abilityScores[4]}</p>`
  info += `<p>Survival: ${currentCharacter.proficiencies.skills.survival*currentCharacter.proficiencyBonus+abilityScores[4]}</p>`
  info += `<p>Deception: ${currentCharacter.proficiencies.skills.deception*currentCharacter.proficiencyBonus+abilityScores[5]}</p>`
  info += `<p>Intimidation: ${currentCharacter.proficiencies.skills.intimidation*currentCharacter.proficiencyBonus+abilityScores[5]}</p>`
  info += `<p>Performance: ${currentCharacter.proficiencies.skills.performance*currentCharacter.proficiencyBonus+abilityScores[5]}</p>`
  info += `<p>Persuasion: ${currentCharacter.proficiencies.skills.persuasion*currentCharacter.proficiencyBonus+abilityScores[5]}</p>`
  info += `</div>`

  info += `<div class="item-column">`
  // money
  info += `<div class="money-box"><p>`;
    for (const [stat, value] of Object.entries(currentCharacter.money)) {
      info += `${stat} 🟡: ${value}  `;
    }
    info += "</p></div>";

  info += `<div class="skill-box">`;
  // equipment (and from there armor and top 3 weapon attacks)
  if (currentCharacter.equipment.length != 0) {
    info += `<div class="stats-grid">`;
    for (const item of currentCharacter.equipment) {
      info += `<p>${item}</p>`;
    }
    info += "</div>";
  }
  else {
    info += `<p>Inventory is empty</p>`;
  }


  info += `</div></div>`

  // feats
  info += `<div class="skill-box">`
  if (currentCharacter.feats.length != 0) {
    info += `<div class="stats-grid">`;
    for (const feat of currentCharacter.feats) {
      info += `<p>${feat}</p><br>`;
    }
    info += "</div>";
  }
  else {
    info += `<p>No features</p>`;
  }
  info += `</div>`

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
  document.querySelectorAll("#classButtons .choice-card").forEach((card) => {
      card.classList.remove("selected");
      if (currentCharacter?.class[card.querySelector("h3").textContent] > 0) {
        card.classList.add("selected");
        card.querySelector(".level").textContent = `Level: ${currentCharacter.class[card.querySelector("h3").textContent]}`;
      }
      else {
        card.querySelector(".level").textContent = ``;
      }
    });
}

// Clears ALL button selections. Called on new characters
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
    "Laufrey", "Faye", "Magni", "Brodi", "Gadd", "Gertrud", "Torsten", "Tård", "Örjan", "Ulf" , "Klaes", "Thor", "Tyr", "Anton",
    "Geoffrey", "Stig", "Stefan", "Jakob", "Oden", "Mordecai", "Gustavo", "Suleman", "Wilhelm", "Kaiser", "Bernard", "Damien",
    "Declan", "Dedan", "Lumbar", "Stephano", "Guiseppe", "Slick", "Frank", "John", "Johnny", "Fred", "Dan", "Danny", "Morgan",
    "Rick", "Tyrone", "Shank", "Daud", "Doug", "Dexter", "Arthur", "Ping", "Ming", "Anthony", "Alphonse", "Vergil", "Basil"
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
    "Dreadweaver", "Stormheart", "Ghostmark", "Frostmark", "Shadowweaver", "Dawnmark", "Moonweave", "Steelmark", "Wraithmark", "Thunderweave", "Goldenstar",
    "Rosenkrans", "Duchel", "Swordhill", "Blackthorn", "Ring", "Lodbrok", "Wartooth", "Bourdain", "Hildebrand", "Hellelil", "Nightguard", "MacFlaire",
    "Strong",
    "Archer", "Angler", "Actor", "Artist", "Carpenter", "Cantor", "Cutter", "Cook", "Coachman", "Courier", "Courtmage", "Courtier", "Captain", "Cleric", "Baker",
    "Bankman", "Butcher", "Brewer", "Baron", "Bandit", "Boatsman", "Bookbinder", "Bishop", "Driver", "Deacon", "Dean", "Deckhand", "Falconer", "Farmer",
    "Fortuneteller", "Foreman", "Healer", "Judge", "Lord", "Luthier", "Mariner", "Marshall", "Merchant", "Messanger", "Miller", "Milliner", "Miner", "Monk",
    "Mason", "Panhandler", "Pilgrim", "Potter", "Priest", "Ratcatcher", "Hunter", "Vanguard", "Sailor", "Salesman", "Scout", "Shepard", "Singer", "Skinner",
    "Smith", "Seer", "Skipper", "Tailor", "Tanner", "Traveler", "Translator", "Thief", "Tempelman", "Troubadour", "Gardener", "Guard", "Raider", "Rider", "Fisher", 
    "Fletcher", "Foreman", "Prince", "Priest", "Painter", "King", "Knight", "Noble", "Usher", "Vizier", "Warden", "Wizard", "Writer", "Rider", "Burglar"
];

const honorifics = ["Sir", "Lady", "Lord", "Dame", "Master", "Maister", "Mistress", "Dr", "Elder"];
const particles = ["von", "van", "de", "af", "der", "of", "le"];
const nicknames = [`"The Shiv"`, `"Booty"`, `"Boot"`, `"Slick"`, `"Moon-eye"`, `"Redfinger"`, `"Blackhand"`, `"Ratman"`, `"Eye-Eater"`, `"Black Cat"`,
  `"Chain breaker"`, `"Sun-Chaser"`, `"Slackjaw"`, `"Gold Tooth"`, `"Gold Teeth"`, `"The Grin"`, `"Happyface"`, `"Silver Tongue"`, `"Horseface"`, `"Spellhammer"`,
  `"Lazy-eye"`, `"Gleamtooth"`, `"Irontoe"`, `"Sixfinger"`, `"Twister"`, `"Drooler"`, `"Smudger"`, `"The Scholar"`, `"Redcap"`, `"Twirly"`, `"Red-eyes"`, `"Spit-Tongue"`,
  `"Black-Foot"`, `"Clubber"`, `"Fleet Foot"`, `"Trumpet"`, `"Godboy"`, `"Bone Eater"`, `"Broken-fang"`, `"Hates you"`, `"Angry"`, `"Wormfood"`, `"Bloodhound"`, `"Boar-snout"`,
  `"Boneless"`, `"Spineless"`, `"Bloodaxe"`, `"Stoneskin"`, `"Blacktooth"`, `"No teeth"`, `"Gums"`, `"Slippy"`,  `"Stonebiter"`, `"Heartless"`, `"Wormspit"`, `"Snaketongue"`,
  `"Bloodknuckle"`, `"The Mountain"`, `"Fatty"`, `"Four Toe"`, `"Ironfist"`, `"Royal"`, `"Face"`, `"Muscles"`, `"Fishbone"`, `"Smalls"`, `"Crabapple"`, `"Touchy"`, `"Ironside"`,
  `"Morningstar"`, `"Glasseye"`, `"Death"`, `"Knapsack"`, `"Bloody Murder"`, `"The River"`, `"Scary"`, `"Snowman"`, `"The Bald"`, `"The Oar"`, `"Cartwheel"`, `"The Mast"`,
  `"The Man"`, `"Dirk"`, `"The Knife"`, `"Claymore"`, `"Lucky"`, `"Chip"`, `"Rook"`, `"Ace"`,
  `"The Wolf"`, `"The Bear"`, `"The Jackal"`, `"The Wasp"`, `"The Cod"`, `"The Fish"`, `"The Duck"`, `"The Beetle"`, `"The Harpy"`, `"The Penguin"`, `"The Crab"`, `"The Crow"`,
  `"The Lion"`, `"The Eagle"`, `"The Hawk"`, `"The Antlion"`, `"The Termite"`];

function generateRandomName() {
    const useHonorific = Math.random() < 0.1; // 10% chance
    const useParticle = Math.random() < 0.1;  // 10% chance
    const useNickname = Math.random() < 0.1;  // 10% chance
    
    let name = "";
    
    if (useHonorific) {
        name += honorifics[Math.floor(Math.random() * honorifics.length)] + " ";
    }
    
    name += firstNames[Math.floor(Math.random() * firstNames.length)];
    
    if (useNickname) {
      name += " " + nicknames[Math.floor(Math.random() * nicknames.length)];
    }

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////// Choice List ///////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Initialize choices list with choice of any new character
function initChoiceList() {
  addChoice("Race", "Race", null);
  addChoice("Level 1 Class", "Class", null);
  currentChoice = currentCharacter.choices[0];
  updateChoiceList();
}

// Simply adds a new choice to choice list
function addChoice(name, type, parent) {
  currentCharacter.choices.push({ id: currentCharacter.choiceIdCounter++, name: name, completed: false, selected: false, mouseover: null, type: type, parent: parent});
}

// Removes choice with choice ID of input
function removeChoice(choiceId) {
  // Find the index of the object with the matching choiceId
  const index = currentCharacter.choices.findIndex(choice => choice.id === choiceId);
  
  // If the index is found, remove the element from the array
  if (index !== -1) {
    // First remove this element
    currentCharacter.choices.splice(index, 1);

    // remove all children
    removeChoiceChildren();
  }
}

// Necessary in case of a choice being changed and thus children that depend on it are killed while original choice remains to start a new family
function removeChoiceChildren(choiceId) {
  if(choiceId === 0) return; // Origin
  const childrenToRemove = choices.filter(choice => choice.parent === choiceId);
  for (const child of childrenToRemove) {
    removeChoice(child.id);
  }
}

// Sets current choice to current ongoing choice
function openChoice(choiceId) {
  // Search choice list, find choice from choiceId
  const index = currentCharacter.choices.findIndex(choice => choice.id === choiceId)

  if(index !== -1) {

    currentChoice = currentCharacter.choices[index];

    // If class choice, instead select lowest level uncompleted class (cant choose level 3 without level 2), possibly unecessary, can remove if deem fit
    if(currentCharacter.choices[index].type === "Class" && !currentCharacter.choices[index].completed) {
      for (let i = 0; i < currentCharacter.choices.length; i++) {
        if(currentCharacter.choices[i].type === "Class" && !currentCharacter.choices[i].completed) {
          currentChoice = currentCharacter.choices[i];
          break;
        }
      } 
    }

    openTab(currentCharacter.choices[index].type);
  }
}

// Select next choice, or deselect all choices (such as when switching to overview tab)
function selectChoice(tabName) {
  if(currentCharacter) {
    //deselect previous choice
    currentCharacter.choices.forEach(choice => choice.selected = false);

    if(currentChoice) {
      currentChoice.selected = true; 
    }

    // Update choice selection
    updateChoiceList();
  }
}

// Update the choice list display
function updateChoiceList() {
  const choiceListElement = document.getElementById("choiceList");
  choiceListElement.innerHTML = "";

  // Incomplete choices at the top
  const incompleteChoices = currentCharacter.choices.filter(
    (choice) => !choice.completed
  );
  incompleteChoices.forEach((choice) => {
    const choiceItem = document.createElement("div");
    choiceItem.className = "choice-list-item";
    choiceItem.textContent = choice.name;
    choiceItem.onclick = () => openChoice(choice.id);
    choiceListElement.appendChild(choiceItem);
    if(choice.selected) choiceItem.classList.add('selected');
    else choiceItem.classList.remove('selected');
  });

  // Completed choices at the bottom
  const completedChoices = currentCharacter.choices.filter(
    (choice) => choice.completed
  );
  completedChoices.forEach((choice) => {
    const choiceItem = document.createElement("div");
    choiceItem.className = "choice-list-item completed";
    choiceItem.textContent = `${choice.name} (${choice.mouseover})`;
    choiceItem.title = choice.mouseover;
    choiceItem.onclick = () => openChoice(choice.id);
    choiceListElement.appendChild(choiceItem);
    if(choice.selected) choiceItem.classList.add('selected');
    else choiceItem.classList.remove('selected');
  });
}

// Level up the character
function levelUp() {
  if(currentCharacter) {
    if(currentCharacter.level >= 20) return;
    currentCharacter.level += 1;

    // Find previous class choice. Search backwards, first found should always be highest level and should always find 1
    let parent = null;
    for (let i = currentCharacter.choices.length-1; i >= 0; i--) {
      if(currentCharacter.choices[i].type === "Class") {
        parent = currentCharacter.choices[i].id;
        break;
      }
    } 

    // Add a new class choice to the choice list
    const choiceId = `class-${currentCharacter.level}`;
    addChoice(`Level ${currentCharacter.level} Class`, "Class", parent);
    currentChoice = currentCharacter.choices[currentCharacter.choices.length-1];

    document.getElementById(
      "characterLevel"
    ).textContent = `Level: ${currentCharacter.level}`;
    updateChoiceList();
    updateCharacterInfo();
    openTab("Class"); // Open the class tab for the new choice
  }
}