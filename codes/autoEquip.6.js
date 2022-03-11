// How to access each bank teller
// character.bank.items0[]
// character.bank.items1[]
const bank_loaction = [true, { map: 'bank', x: 4, y: -370 }];

// no more button instead do it on 50 min interval 

function auto_equip() {
    if (character.ctype != "merchant"){
        smart_move(bank_loaction[1]);
    }
}