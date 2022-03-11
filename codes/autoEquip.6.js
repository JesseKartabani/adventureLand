// How to access each bank teller
// character.bank.items0[]
// character.bank.items1[]
const bank_loaction = [true, { map: 'bank', x: 4, y: -370 }];

add_bottom_button("autoEquip", "🛡", auto_equip);

function auto_equip() {
    smart_move(bank_loaction[1]);
}