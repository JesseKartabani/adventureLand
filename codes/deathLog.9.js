const filePath = 'C:/Users/jesse/AppData/Roaming/Adventure Land/autosync5755988142981120/adventureland/logs/deaths.csv';
const fs = require('fs')

// Logs deaths into csv
function deathLog() {
    // When character is hit
    character.on("hit",function(data){
        let incDamage = data.damage; // Damage we will take
        let charHealth = character.hp; // How much hp we have left
        // If we are not going to die return
        if (charHealth - incDamage > 0) return;
        // Else if we are dead
        let timeOfDeath = new Date();
        let charName = character.name;
        let killedBy = data.actor;
        let deathData = [charName, killedBy, timeOfDeath];
        // Write to file
        fs.appendFile(filePath, deathData + "\n", err => {
            if (err) {
            console.error(err)
            return;
            }
        })
        return;
    });
}

setTimeout(function () {
    deathLog();
}, 250);