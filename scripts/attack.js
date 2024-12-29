document.addEventListener("DOMContentLoaded", () => {
    // Retrieve registered users from local storage
    const players = JSON.parse(localStorage.getItem("players")) || [];

    // Populate the dropdown with registered players
    const enemySelector = document.getElementById("enemySelector");
    if (players.length === 0) {
        const option = document.createElement("option");
        option.textContent = "No players available";
        enemySelector.appendChild(option);
    } else {
        players.forEach(player => {
            const option = document.createElement("option");
            option.value = player.username;
            option.textContent = player.username;
            enemySelector.appendChild(option);
        });
    }

    // Add event listener to the attack button
    document.getElementById("attackButton").addEventListener("click", startBattle);
});

function startBattle() {
    const enemySelector = document.getElementById("enemySelector");
    const selectedEnemy = enemySelector.value;
    if (selectedEnemy === "No players available") {
        alert("No players available to attack.");
        return;
    }

    // Retrieve players from local storage
    const players = JSON.parse(localStorage.getItem("players")) || [];
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const enemy = players.find(p => p.username === selectedEnemy);

    if (!loggedInUser || !enemy) {
        alert("Invalid players.");
        return;
    }

    // Calculate scores based on race attributes
    const raceAttributes = {
        Human: { offense: 1, defense: 1 },
        Elf: { offense: 0.8, defense: 1.2 },
        Orc: { offense: 1.2, defense: 0.8 }
    };

    const userAttributes = raceAttributes[loggedInUser.race];
    const enemyAttributes = raceAttributes[enemy.race];

    const userScore = loggedInUser.score * userAttributes.offense - enemy.score * enemyAttributes.defense;
    const enemyScore = enemy.score * enemyAttributes.offense - loggedInUser.score * userAttributes.defense;

    const battleLog = document.getElementById("battleLog");
    if (userScore > enemyScore) {
        battleLog.textContent = `You attacked ${selectedEnemy} and won!`;
        loggedInUser.score += 10;
        enemy.score -= 5;
    } else {
        battleLog.textContent = `You attacked ${selectedEnemy} and lost.`;
        loggedInUser.score -= 5;
        enemy.score += 10;
    }

    // Update players in local storage
    localStorage.setItem("players", JSON.stringify(players));
    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
}