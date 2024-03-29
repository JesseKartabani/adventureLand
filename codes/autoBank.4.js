// This is the back of the bank
const bank_loaction = [true, {map: 'bank', x: 4, y: -370}];

// Item, level
const bankWhitelist = {
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
  strbelt: 3,

};

// Merchant auto bank items in our bankWhitelist
function auto_bank() {
  // If character is our merchant
  if (character.ctype == 'merchant') {
    // Loop through our inventory
    for (const i in character.items) {
      const slot = character.items[i];
      // If the slot isnt empty we get the name and level of whats in it
      if (slot != null) {
        const slotLevel = slot.level;
        const slotName = slot.name;
        // Loop through our bank whitelist
        for (const j in bankWhitelist) {
          // If the level and name are equal to whats in our slot
          if (slotLevel == bankWhitelist[j] && slotName == j) {
            // We move to the bank
            smart_move(bank_loaction[1]);
            // Once we are inside the bank
            if (character.map == 'bank') {
              bank_store(i); // We store that item
            }
          }
        }
      }
    }
  }
}

// Auto banks every 40 minutes
setInterval(function() {
  auto_bank();
}, 2400000);
