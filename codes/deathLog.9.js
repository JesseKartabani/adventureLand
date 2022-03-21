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
        let deathData = [charName, killedBy, timeOfDeath];
    });
}