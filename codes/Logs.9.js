const fs = require('fs')

// Logs deaths into csv
function deathLog() {
    const filePath = 'C:/Users/jesse/AppData/Roaming/Adventure Land/autosync5755988142981120/adventureland/logs/deaths.csv';
    // When character is hit
    character.on("hit", function (data) {
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

// TODO: Rare item logger
// On loot check item name for rare drop
// And on exchange check for rare item 

// Sudo code

// character.on loot
// if name != commonItemWhiteList
// store date
// store id of mob we looted
// store item name
// write to csv
// itemName, mobID, date

/*
function dropLog() {
    
    character.on("loot", function(data) {
        // Return if nothing dropped
        if (data.items != null) {
            // Something did drop get it's name
            console.log(data.items.name);
        }
        return;
    });
}

setTimeout(function () {
    dropLog();
}, 250);
*/