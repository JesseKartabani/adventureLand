// This is the back of the bank
const bank_loaction = [true, { map: 'bank', x: 4, y: -370 }];

// Item, level
var bank_whitelist = {
    // Maxed upgrades
	quiver: 7,
    firestaff: 7,
    firebow: 7,
    fireblade: 7,
    sshield: 7,
    shield: 7,
    gloves: 7,
    coat: 7,
    helmet: 7,
    pants: 7,
    shoes: 7,
    gloves1: 7,
    coat1: 7,
    helmet1: 7,
    pants1: 7,
    shoes1: 7,
    harbringer: 5,
    oozingterror: 5,
    bataxe: 7,
    spear: 7,
    xmaspants: 7,
    xmassweater: 7,
    xmashat: 7,
    xmasshoes: 7,
    mittens: 7,
    ornamentstaff: 7,
    candycanesword: 7,
    warmscarf: 7,
    t2bow: 7,
    pmace: 7,
    basher: 7,
    harmor: 5,
    hgloves: 5,
    wingedboots: 7,
    wcap: 8,
    wshoes: 8,
    wgloves: 8,
    wattire: 8,
    wbreeches: 8,
    xmace: 7,
    cclaw: 7,
    ololipop: 7,
    // Maxed compounds
    wbook0: 3,
    lostearring: 2,
    strearring: 3,
    intearring: 3,
    dexearring: 3,
    hpbelt: 3,
    ringsj: 3,
    strring: 3,
    intring: 3,
    dexring: 3,
    vitring: 3,
    dexamulet: 3,
    intamulet: 3,
    stramulet: 3,
    vitearring: 3,
    dexbelt: 3,
    intbelt: 3,
    strbelt: 3

};

// Merchant auto bank items in our bank_whitelist
function auto_bank() {
    // If character is our merchant
    if (character.ctype == "merchant") {
        // Loop through our inventory
        for (let i in character.items) {
            let slot = character.items[i];
            if (slot != null) {
                let level = bank_whitelist[slot.name];
                // If the level matches what is set in bank whitelist
                if (slot.level == level) {
                    // We move to the bank
                    smart_move(bank_loaction[1]);
                    // Once we are inside the bank
                    if (character.map == "bank") {
                        bank_store(i); // We store that item
                    }
                }
            }
        }
    }
}

// Auto banks every 40 minutes
setInterval(function () {
    auto_bank();
}, /*2400000*/ 10000);