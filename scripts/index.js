document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    // Retrieve players and guilds from local storage
    const players = JSON.parse(localStorage.getItem('players')) || [];
    const guilds = JSON.parse(localStorage.getItem('guilds')) || [];

    // Sort players and guilds by score
    players.sort((a, b) => b.score - a.score);
    guilds.sort((a, b) => b.score - a.score);

    // Populate top players table
    const topPlayersBody = document.getElementById("top-players-body");
    if (topPlayersBody) {
        players.forEach((player, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><a href="player_profile.html?username=${encodeURIComponent(player.username)}">${player.username}</a></td>
                <td>${player.score}</td>
            `;
            topPlayersBody.appendChild(row);
        });
    } else {
        console.error("Element with id 'top-players-body' not found");
    }

    // Populate top guilds table
    const topGuildsBody = document.getElementById("top-guilds-body");
    if (topGuildsBody) {
        guilds.forEach((guild, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><a href="guild_profile.html?name=${encodeURIComponent(guild.name)}">${guild.name}</a></td>
                <td>${guild.score}</td>
            `;
            topGuildsBody.appendChild(row);
        });
    } else {
        console.error("Element with id 'top-guilds-body' not found");
    }
});