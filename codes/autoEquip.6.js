// How to access each bank teller
// character.bank.items0[]
// character.bank.items1[]
const lvl = 8;
const ranger_set = [
    "wcap",
    "wbreeches"
]

const bank_loaction = [true, { map: 'bank', x: 4, y: -370 }];

// no more button instead do it on 50 min interval 

function auto_equip() {
    // If character isn't our merchant
    if (character.ctype != "merchant") {
        // Move to the back of the bank
        smart_move(bank_loaction[1]);
        // Once we are inside the bank
        if (character.map == "bank") {
           retrieve_bank_item(ranger_set, 7)
        }
    }
}

// We loop through the bank to find and retieve our chosen items
function retrieve_bank_item(names, lvl) {
    // Loops through left bankers items
    for (let i in character.bank.items0) {
        let slot = character.bank.items0[i];
        // If the slot isn't empty
        if (slot != null) {
            let item = slot.name; // Name of whatever item is in current slot
            let level = slot.level; // Level of whatever item is in current slot
            // if the item is in our list and is high enough level
            if (names.includes(item) == true && level >= lvl) {
                // Take that item out of the bank
                bank_retrieve("items0", i);
            }
        }
    }
}

// Checks if an item is an upgrade for our character 
function is_upgrade(gear_name) {
    // Loops through all the gear we are wearing
    for (let i in parent.character.slots) {
        let slot = parent.character.slots[i]; // This is the gear type ("ring1, earring1, etc")
        // If slot isn't empty we can get the level of the item
        if (slot != null) {
            let level = slot.level;
            // If the name of the gear is the same we compare their levels
            if (slot.name == gear_name && lvl > level) {
                return true; // Item is higher level than what we currently have on
            } else {
                return false; // Item is not an upgrade
            }
        }
    }
}

setInterval(function () {
    auto_equip();
}, 10000);
