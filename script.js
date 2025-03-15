const dungeons = [
  {
    id: 14938,
    challenge_mode_id: 500,
    slug: "the-rookery",
    name: "The Rookery",
    short_name: "ROOK",
  },
  {
    id: 12841,
    challenge_mode_id: 382,
    slug: "theater-of-pain",
    name: "Theater of Pain",
    short_name: "TOP",
  },
  {
    id: 14882,
    challenge_mode_id: 504,
    slug: "darkflame-cleft",
    name: "Darkflame Cleft",
    short_name: "DFC",
  },
  {
    id: 8064,
    challenge_mode_id: 247,
    slug: "the-motherlode",
    name: "The MOTHERLODE!!",
    short_name: "ML",
  },
  {
    id: 800002,
    challenge_mode_id: 370,
    slug: "mechagon-workshop",
    name: "Mechagon Workshop",
    short_name: "WORK",
  },
  {
    id: 15103,
    challenge_mode_id: 506,
    slug: "cinderbrew-meadery",
    name: "Cinderbrew Meadery",
    short_name: "BREW",
  },
  {
    id: 14954,
    challenge_mode_id: 499,
    slug: "priory-of-the-sacred-flame",
    name: "Priory of the Sacred Flame",
    short_name: "PSF",
  },
  {
    id: 15452,
    challenge_mode_id: 525,
    slug: "operation-floodgate",
    name: "Operation: Floodgate",
    short_name: "FLOOD",
  },
];

const keyScores = {
  2: 165,
  3: 180,
  4: 205,
  5: 220,
  6: 235,
  7: 265,
  8: 280,
  9: 295,
  10: 320,
  11: 335,
  12: 365,
  13: 380,
  14: 395,
  15: 410,
  16: 425,
  17: 440,
  18: 455,
  19: 470,
  20: 485,
  21: 500,
  22: 515,
  23: 530,
  24: 545,
  25: 560,
  26: 575,
  27: 590,
  28: 605,
  29: 620,
  30: 635,
};

let api_url = "";
let data;
let dungeon_scores = {};
const numberOfCol = 8;

// Initialize dungeon scores
dungeons.forEach((dungeon) => {
  dungeon_scores[dungeon.id.toString()] = 0;
});

document.addEventListener("DOMContentLoaded", function () {
  // Set up form submission
  document.getElementById("rioForm").addEventListener("submit", function (e) {
    e.preventDefault();
    getURLInput();
  });

  // Check for URL parameter
  const queryString = window.location.search;
  if (queryString) {
    const urlParams = new URLSearchParams(queryString);
    const rioURL = urlParams.get("rio");

    if (rioURL) {
      // Set the input value
      document.getElementById("raiderioUrl").value = rioURL;
      getURLInput();
    }
  }
});

function getURLInput() {
  const inputUrl = document.getElementById("raiderioUrl").value;
  if (!inputUrl) return;

  // Show loading state
  setLoading(true);

  // Update URL with query parameter
  const newUrl =
    window.location.origin +
    window.location.pathname +
    "?rio=" +
    encodeURIComponent(inputUrl);
  window.history.pushState({ path: newUrl }, "", newUrl);

  splitUrl(inputUrl);
  clearTable();
  getBestScore();
}

function setLoading(isLoading) {
  const spinner = document.getElementById("loadingSpinner");
  const submitText = document.getElementById("submitText");
  const submitButton = document.getElementById("submitURL");

  if (isLoading) {
    spinner.classList.remove("hidden");
    submitText.textContent = "Loading...";
    submitButton.disabled = true;
  } else {
    spinner.classList.add("hidden");
    submitText.textContent = "Submit";
    submitButton.disabled = false;
  }
}

function clearTable() {
  // Clear table headers except first two
  const headerRow = document.getElementById("tb_headers");
  while (headerRow.children.length > 2) {
    headerRow.removeChild(headerRow.lastChild);
  }

  // Clear table body
  document.getElementById("dungeonTableBody").innerHTML = "";

  // Reset dungeon scores
  for (var key in dungeon_scores) {
    dungeon_scores[key] = 0;
  }
}

function splitUrl(url) {
  var urlArray = url.split("/");
  var urlIndex = urlArray.indexOf("characters");

  if (urlIndex === -1) {
    alert("Invalid Raider.io URL");
    setLoading(false);
    return;
  }

  var region = urlArray[urlIndex + 1];
  var realm = urlArray[urlIndex + 2];
  var name = urlArray[urlIndex + 3];

  api_url =
    "https://raider.io/api/v1/characters/profile?region=" +
    region +
    "&realm=" +
    realm +
    "&name=" +
    name +
    "&fields=mythic_plus_best_runs:all,mythic_plus_scores_by_season:current";
}

async function getBestScore() {
  try {
    var response = await fetch(api_url);
    data = await response.json();

    // Update character info
    document.getElementById("characterNameDisplay").textContent =
      data.name + " - " + data.realm;
    document.getElementById("characterThumbnail").src = data.thumbnail_url;
    document.getElementById("profileLink").href = data.profile_url;

    // Process best runs
    if (data.mythic_plus_best_runs) {
      for (const dun of data.mythic_plus_best_runs) {
        var dungeonID = String(dun.zone_id);
        var dungeonScore = dun.score;
        dungeon_scores[dungeonID] = Math.max(
          dungeon_scores[dungeonID] || 0,
          dungeonScore
        );
      }
    }

    // Get alternate runs if available
    if (data.mythic_plus_alternate_runs) {
      for (const dun of data.mythic_plus_alternate_runs) {
        const dungeonID = String(dun.zone_id);
        const dungeonScore = dun.score;
        dungeon_scores[dungeonID] = Math.max(
          dungeon_scores[dungeonID] || 0,
          dungeonScore
        );
      }
    }

    // Get season score
    var seasonScore = data.mythic_plus_scores_by_season[0].scores.all;
    document.getElementById("characterScore").textContent =
      seasonScore.toLocaleString();

    // Set score color class
    const scoreElement = document.getElementById("characterScore");
    scoreElement.className = "score-value " + getScoreQualityClass(seasonScore);

    // Show character info and build table
    document.getElementById("characterInfo").classList.remove("hidden");
    document.getElementById("welcomeCard").classList.add("hidden");

    buildTable();
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Error fetching data from Raider.io");
  } finally {
    setLoading(false);
  }
}

function getScoreQualityClass(score) {
  if (score >= 2800) return "quality-legendary";
  if (score >= 2400) return "quality-epic";
  if (score >= 2000) return "quality-rare";
  if (score >= 1600) return "quality-uncommon";
  if (score >= 1200) return "quality-common";
  return "quality-poor";
}

function getKeyByScore(score) {
  let keyLevel = 0;
  for (const [key, value] of Object.entries(keyScores)) {
    if (value < score) {
      keyLevel = parseInt(key);
    }
  }
  return Math.max(2, keyLevel);
}

function getLowestKey() {
  var lowestScore = Infinity;
  var highestScore = 0;

  for (var dungeonID in dungeon_scores) {
    var dungeonScore = dungeon_scores[dungeonID];
    if (dungeonScore > 0) {
      lowestScore = Math.min(lowestScore, dungeonScore);
    }
    highestScore = Math.max(highestScore, dungeonScore);
  }

  // If all scores are 0, default to key level 2
  if (lowestScore === Infinity) lowestScore = 0;

  var startingKey = Math.max(
    getKeyByScore(lowestScore),
    getKeyByScore(highestScore) - numberOfCol + 2
  );
  return Math.max(startingKey, 2);
}

function getArrayPoints(startingKey, baseScore) {
  var arraySize = numberOfCol;
  var tablePoints = [];
  var currentScore = baseScore;

  for (var i = 0; i < arraySize; i++) {
    var newKeyScore = keyScores[startingKey + i] || 0;
    var newScore = Math.max(newKeyScore, currentScore);
    tablePoints.push(
      Math.round(Math.max(0, newScore - currentScore) * 10) / 10
    );
  }

  return tablePoints;
}

function getScoreBadgeClass(score) {
  if (score === 0) return "score-0";
  if (score >= 350) return "score-max";
  if (score >= 300) return "score-very-high";
  if (score >= 250) return "score-high";
  if (score >= 200) return "score-medium";
  return "score-low";
}

// Updated to use consistent thresholds with positive progression
function getPointsBadgeClass(points) {
  // Use consistent global thresholds for all rows
  if (points <= 0) return "badge-points-none";
  if (points <= 15) return "badge-points-low";
  if (points <= 30) return "badge-points-medium";
  if (points <= 45) return "badge-points-high";
  return "badge-points-very-high"; // 46+ points
}

function buildTable() {
  // Get starting key level
  const startingKey = getLowestKey();

  // Add key level headers
  const headerRow = document.getElementById("tb_headers");
  for (let i = 0; i < numberOfCol; i++) {
    const keyLevel = startingKey + i;
    const th = document.createElement("th");
    th.className = "text-center";
    th.textContent = "+" + keyLevel;
    headerRow.appendChild(th);
  }

  // Build dungeon rows
  const tableBody = document.getElementById("dungeonTableBody");
  tableBody.innerHTML = "";

  dungeons.forEach((dungeon) => {
    const dungeonScore = dungeon_scores[dungeon.id.toString()] || 0;
    const pointsArray = getArrayPoints(startingKey, dungeonScore);

    const row = document.createElement("tr");

    // Dungeon name cell with fixed width abbreviation for alignment
    const nameCell = document.createElement("td");
    nameCell.innerHTML = `
          <div class="dungeon-name">
              <span class="dungeon-abbr">${dungeon.short_name}</span>
              <span class="dungeon-full-name">${dungeon.name}</span>
          </div>
      `;
    row.appendChild(nameCell);

    // Score cell
    const scoreCell = document.createElement("td");
    scoreCell.className = "text-center";
    scoreCell.innerHTML = `
          <span class="badge ${getScoreBadgeClass(dungeonScore)}">
              ${dungeonScore}
          </span>
      `;
    row.appendChild(scoreCell);

    // Points cells
    pointsArray.forEach((points) => {
      const pointsCell = document.createElement("td");
      pointsCell.className = "text-center";
      pointsCell.innerHTML = `
              <span class="badge ${getPointsBadgeClass(points)}">
                  ${points > 0 ? "+" + points : "-"}
              </span>
          `;
      row.appendChild(pointsCell);
    });

    tableBody.appendChild(row);
  });
}
