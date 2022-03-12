// ONLY WORKS WITH LEFT BANK TELLER.
// DOESNT WORK WITH ACCESSORIES.

const lvl = 8; // This is what is_upgrade uses to calculate highest level
const ranger_set = [ // Desired set of armour for ranger class
    "wcap",
    "wbreeches",
    "wshoes",
    "wgloves",
    "wattire"
];
// This is the back of the bank
const bank_loaction = [true, { map: 'bank', x: 4, y: -370 }];

function auto_equip(set) {
    // If character isn't our merchant
    if (character.ctype != "merchant") {
        // Move to the back of the bank
        smart_move(bank_loaction[1]);
        // Once we are inside the bank
        if (character.map == "bank") {
            // We retrieve any items in our set that count as an upgrade
            retrieve_bank_item(set);
            // Then we equip any retrieved items
            inventory_equip();
        }
    }
}

// We loop through the bank to retrieve our chosen items if they are an upgrade
function retrieve_bank_item(names) {
    // Loops through left bankers items
    for (let i in character.bank.items0) {
        let slot = character.bank.items0[i];
        // If the slot isn't empty
        if (slot != null) {
            let item = slot.name; // Name of whatever item is in current slot
            // if the item is in our list and is an upgrade
            if (names.includes(item) == true && is_upgrade(item) == true) {
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
                return true; // Item is an upgrade so we return true
            }
        }
    }
}

// Checks inventory for a gear upgrade and equips it
function inventory_equip() {
    // Loops through all items in our inventory
    for (let i in character.items) {
        let slot = character.items[i];
        // If the slot in our inventory isn't empty
        if (slot != null) {
            let item = slot.name; // Name of whatever item is in current slot
            // If that item is an upgrade
            if (is_upgrade(item) == true) {
                // Then we equip that item
                equip(i); 
            }
        }
    }
}

// Auto equips highest level ranger set from bank every 50 minutes
setInterval(function () {
    auto_equip(ranger_set);
}, 10000);
