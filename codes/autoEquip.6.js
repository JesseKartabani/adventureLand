// How to access each bank teller
// character.bank.items0[]
// character.bank.items1[]

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
            if (names.inculdes(item) && level >= lvl) {
                // Take that item out of the bank
                bank_retrieve("items0", i);
            }
        }
    }
}
setInterval(function () {
    auto_equip();
}, 10000);
