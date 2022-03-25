// TODO BUG FIX: death log is writing duplicate entries,
// I think this is because each character is doing their own entry each time
// someone dies.

// (if our char dies while they aren't near another of our chars there is only
// one entry as intented)


const fs = require('fs')

// Logs deaths into csv
function deathLog() {
    const filePath = 'C:/Users/jesse/AppData/Roaming/Adventure Land/autosync5755988142981120/adventureland/logs/deaths.csv';
    // When character is hit
    character.on("hit", function (data) {
        // If hit doesn't kill us return
        let isDead = data.kill;
        if (!isDead) return;
        // Else if we are dead
        let timeOfDeath = new Date();
        let charName = character.name;
        let killedBy = parent.entities[data.actor]?.mtype;
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



// TODO: Rare item logger
// on exchange check for rare item
// 1. one solution is too parse the game logs when we exchange
// 2. or we can make our exchange function return a promise of the item we got

function dropLog() {
    let filePath = 'C:/Users/jesse/AppData/Roaming/Adventure Land/autosync5755988142981120/adventureland/logs/drops.csv';
    // on "loot" is emitted to the entire party so we only want our merchant to access it
    if (character.ctype != 'merchant') return;
    character.on("loot", function (data) {
        let loot = data.items;
        // If theres no item when we loot return
        if (loot == "" || loot == undefined) return;
        // Else if there is an item get its name 
        let lootName = loot[0]['name'];
        // Then append drops.csv
        fs.appendFile(filePath, lootName + "\n", err => {
            if (err) {
                console.error(err)
                return;
            }
        })
    });
}

setTimeout(function () {
    deathLog();
    dropLog();
}, 250);

// TODO: Upgrade Log
// Should log successful upgrades as well as failed upgrades, each with the
// percentage chance of that upgrade wokring and date of upgrade