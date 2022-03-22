// Mongodb setup
const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://Jesse1224:8characters@cluster0.oqzgc.mongodb.net/deathLog?retryWrites=true&w=majority'
const client = new MongoClient(url);

// Logs deaths into csv
function deathLog() {
    // When character is hit
    character.on("hit",function(data){
        let incDamage = data.damage; // Damage we will take
        let charHealth = character.hp; // How much hp we have left
        // If we are not going to die return
        if (incDamage - charHealth > 0) return;
        // Else if we are dead
        let timeOfDeath = new Date();
        let charName = character.name;
        let killedBy = data.actor;
        // Connect to database
        client.connect();
        // Save to database
        createListing(client, {
            character_name: charName,
            killed_by: killedBy,
            time_of_death: timeOfDeath
        })
        // Close mongo connection
        client.close();
    });
}

async function createListing(client, newListing) {
    const result = await client.db("deathLog").collection("deaths").insertOne
    (newListing);
}

setInterval(function () {
    deathLog();
}, 250);