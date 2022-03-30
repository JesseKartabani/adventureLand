/*
    TODO:
    * Farmers need to decide what monsters are best to farm
    * Want farmers to help each other when killing harder monsters
    * Optimal bee farming for rangers
    * Phoneix farming
    * Ranger kiting for hard mobs
    * Merchant mining/fishing
    * Skills need complete rework
    * Reduce code calls when creating party
*/

// Zoom game in by 1.25x
const {webFrame} = require('electron');
webFrame.setZoomFactor(1.25);

// Monster we want to farm and monsters we want to monster hunt
const farmMonster = ['arcticbee', 'bee']; // Can refactor to handle multiple monsters
const monsterHuntWhitelist = [farmMonster[0], 'goo', 'bee', 'crab', 'croc', 'armadilo', 'snake', 'crab', 'squig', 'frog', 'tortoise', 'minimush'];
// In game names
const partyNames = ['JesseSells', 'Gollum', 'Samwise', 'Pippin']; // Keep merchant first
const merchantName = partyNames[0];
const farmerNames = [partyNames[1], partyNames[2], partyNames[3]]; // Everyone except our merchant
// Items we will vendor, keep and exchange
const sellWhitelist = ['slimestaff', 'stinger', 'hpamulet', 'hpbelt', 'mushroomstaff', 'whiteegg']; // Items we want to vendor
const exchangeWhitelist = ['gem0', 'armorbox', 'weaponbox', 'redenvelopev4']; // Add items here for exchanging
const potionTypes = ['hpot0', 'mpot0', 600]; // Value is stack amount desired
const keepWhitelist = [potionTypes[0], potionTypes[1], 'tracker']; // Farmers keep these items at all times
// Misc
const merchantIdle = [true, {map: 'main', x: -74, y: -140}]; // Location has access to almost all npcs
const codeName = 'master';
const mainServer = 'EU I'; // If you change this you must also change visitServers function

load_code('upgradeCompound'); // Upgrading/compounding, refer to upgradeCompound.js
load_code('ponty'); // Buys from Ponty, refer to ponty.js
load_code('autoBank'); // Merchant banks fully upgraded and compounded items every 40 mins, refer to autoBank.js
load_code('Logs'); // Logs deaths and rare item drops

// Run all code only once
setTimeout(function() {
  if (character.name == merchantName) {
    startFarmers(); // merchant starts other 3 farmer characters in same window
  }
}, 5000);

// Run all code on a loop
setInterval(function() {
  masterGlobal(); // any character uses code
  masterMerchant(); // only merchant uses code
  masterFarmers(); // any farmer uses code
}, 250);

// Activates each classes skills according to functions logic
// warriorSkills();
// priestSkills();
// hunterSkills();

// Each hour we will check every server for ponty items
visitServers();

// Any character regardless of class runs this code
function masterGlobal() {
  if (character.rip) { // If character is dead, try to respawn
    respawn();
  } else { // If character is alive
    usePotions();
    loot();
    handleParty();
  }
}

// Only run by your merchant character (in my case the one also running other characters in the same window)
function masterMerchant() {
  if (character.name == merchantName) {
    openCloseStand(); // Opens and closes our stand depending on if moving or not
    if (merchantIdle[0]) { // Check our const for true or false value
      handleMerchantLocationIdle(); // Control where merchant idles
    }
    const potionSeller = getNpcById('fancypots');
    if (character.map == potionSeller.map) { // If we are on the same map as the potion seller
      const distance = distanceToPoint(potionSeller.x, potionSeller.y, character.real_x, character.real_y);
      if (distance <= 300) { // If we are close enough to the potion seller
        sellItems();
        buyPotions();
      }
    }
    buyUpgradeScrolls();
    fixFullInventory();
    exchangeItems();
  }
}

// All the farmer characters will run this, but never a merchant
function masterFarmers() {
  if (farmerNames.includes(character.name)) {
    sendItemsToMerchant(); // Send loot and gold to merchant when nearby
    handleFarming(); // Attempt to complete monster hunt quests and farm tokens
    requestMerchant(); // Ask the merchant to deliver potions when low or when low inventory space
  }
}

// Comapare two x and y locations to find the total distance between
function distanceToPoint(x1, y1, x2, y2) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sqrt
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/pow
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

// We can type the id in and find the location of any NPC
function getNpcById(name) {
  // Look through all the maps in the game
  for (i in parent.G.maps) {
    const map = G.maps[i]; // Single map in the current loop
    const ref = map.ref; // Single ref in the current loop
    // We now loop through all the npcs in this specific ref; remember we are looping all game maps
    // For each game map loop, this loop happens, so this is being checked a lot of times
    for (j in ref) {
      const data = ref[j]; // Data (+ location info) for this specific ref, in the ref loop
      const id = data.id; // Unique npc id we are looking for
      if (id == name) { // If the id is equal to the string we specified
        // We return the location of the npc we specified
        return data;
      }
    }
  } return null; // If nothing is returned, we return null to let us know the npc we specified doesn't exist
}

// Leaves merchant with one inventory space by sending last item in bags to the bank
async function fixFullInventory() {
  // If inventory is not full return
  if (character.esize >= 1) return;
  // If we are moving return
  if (smart.moving) return;
  // Else move to bank and store last item in inventory
  await smart_move('bank');
  bank_store(41);
}

// Buys potions until reaching desired stack amount
function buyPotions() {
  const mp = potionTypes[1];
  const hp = potionTypes[0];
  const stack = potionTypes[2];
  // If we have enough gold to purchase, and we need at least one potion
  if (character.gold >= parent.G.items[hp].g && (stack - quantity(hp)) > 0) {
    // We buy enough potions to top off and meet the stack amount
    parent.buy_with_gold(mp, stack - quantity(mp));
  }
  // If we have enough gold to purchase, and we need at least one potion
  if (character.gold >= parent.G.items[mp].g && (stack - quantity(mp)) > 0) {
    // We buy enough potions to top off and meet the stack amount
    parent.buy_with_gold(hp, stack - quantity(hp));
  }
}

// Uses mana or hp potions accoring to our logic
function usePotions() {
  // Immediately need mana to be able to continue attacking, use skills, etc
  if (character.mp <= character.mp_cost) {
    if (quantity(potionTypes[1]) > 0) {
      parent.use_skill('mp');
    }
  } else {
    // Focus on health before mana, as long as there's just enough mana
    if (character.hp <= character.max_hp - parent.G.items[potionTypes[0]].gives[0][1]) {
      if (quantity(potionTypes[0]) > 0) {
        parent.use_skill('hp');
      }
    } else {
      // If health is okay, focus on mana
      if (character.mp <= character.max_mp - parent.G.items[potionTypes[1]].gives[0][1]) {
        if (quantity(potionTypes[1]) > 0) {
          parent.use_skill('mp');
        }
      }
    }
  }
}

// Merchant always keeps 50 of each type of upgrade scroll
function buyUpgradeScrolls() {
  // If character is a merchant and isnt moving
  if (character.name != merchantName && smart.moving) return;
  // If too far away from vendor return
  const npc = getNpcById('scrolls');
  const distance = distanceToPoint(npc.x, npc.y, character.real_x, character.real_y);
  if (distance > 400) return;
  // Checks if we have 50 of each scroll before restocking back up to 50
  keepCertainAmount('scroll0', 50);
  keepCertainAmount('scroll1', 50);
  keepCertainAmount('cscroll0', 50);
  keepCertainAmount('cscroll1', 50);
}

// str, int
function keepCertainAmount(item, amount) {
  // If the quantity of the item is greater than the amount return
  if (quantity(item) >= amount) return;
  // Else buy item
  parent.buy_with_gold(item);
}

// Keep our merchants stand open if stopped and closed if we are moving
function openCloseStand() {
  if (character.moving) {
    // Close the stand if moving
    close_stand();
  } else {
    // If not moving open the stand
    open_stand();
  }
}

// This is run only once when the code is first initialized, and only by the merchant
function startFarmers() {
  // Loop only through our farmer characters
  for (const i in farmerNames) {
    const farmer = farmerNames[i]; // Define each farmer
    if (farmer) {
      // This will start a character based on where we are in the array loop
      parent.start_character_runner(farmer, codeName);
    }
  }
}

// Farmers will send farmed items to the merchant
function sendItemsToMerchant() {
  const merchant = get_player(merchantName);
  if (merchant != null) { // Is the merchant around?
    const distance = distanceToPoint(merchant.real_x, merchant.real_y, character.real_x, character.real_y);
    if (distance <= 300) {
      // If we are close to the merchant, so we can send items...
      // We loop through all the items in our inventory
      for (const i in character.items) {
        const slot = character.items[i]; // This defines a slot in the loop
        if (slot != null) { // If something is in the slot, and it's not empty
          const name = slot.name; // We grab the item name
          if (!keepWhitelist.includes(name)) { // If we don't have the item whitelisted to keep
            // We sell the item.
            // i is for the current slot in your loop
            // 9999 is to sell the max amount of whatever is in the slot
            send_item(merchantName, i, 9999);
          }
        }
      }
      sendGoldToMerchant();
    }
  }
}

// Farmers will send excess gold to the merchant
function sendGoldToMerchant() {
  const retain = retainGoldAmount(); // Gold we want farmers to retain
  if (character.gold > retain) {
    const sendAmount = character.gold - retain;
    // If we have at least 1,000 gold to send
    if (sendAmount >= 1000) {
      // Send gold to the merchant
      parent.socket.emit('send', {name: merchantName, gold: sendAmount});
    }
  }
}

// The farmers will try to farm normal monsters if they deem the monsters designated in hunting quests too hard
function farmNormally() {
  // If we don't have a monster hunt quest, don't farm normally, go get a quest
  if (character.s.monsterhunt == undefined) return;
  // If we do have a quest and the monster to kill is in our whitelist stop running the function
  if (monsterHuntWhitelist.includes(character.s.monsterhunt.id)) return;

  const target = get_targeted_monster(); // If we have a target, define it
  // This checks to make sure any monster around is in our farmMonster array
  // No target means it's safe to assume another player has not aggro'd it, and we get the rewards on kill
  const desiredMonster = get_nearest_monster({type: farmMonster[0], no_target: true});
  if (target) { // If we are targeting something...
    // Try and kill it!
    attackMonsters(target);
  } else if (desiredMonster) { // If we are not targeting anything and there is a monster we want to target and kill
    // We target the desired monster
    change_target(desiredMonster);
  } else if (!smart.moving) { // If there's nothing around we want to kill and we aren't smart moving
    // We will move too our first farm monster
    smart_move(farmMonster[0]);
  }
}

// Gets, completes and hands in monster hunts
function handleMonsterHunts() {
  const currentServer = parent.server_region + ' ' + parent.server_identifier;
  // Checks to see if we have a monster hunting quest and if we are on our main server
  if (character.s.monsterhunt == undefined && currentServer == mainServer) { // If we do not have a quest and we are on main server
    // Go get a quest from daisy
    if (!smart.moving) {
      smart_move('monsterhunter', function() {
        // Once we have arrived at daisy, we need to interact with her
        setTimeout(function() {
          // This acts like the game has clicked on her
          parent.socket.emit('monsterhunt');
        }, 250); // Wait 1/4th second after arriving
        setTimeout(function() {
          // This then acts like we are clicking on "accept quest", and get assigned one
          parent.socket.emit('monsterhunt');
        }, 500); // Wait 1/2 second after first click
      });
    }
  } else { // If we DO have a monster hunting quest active...
    const server = character.s.monsterhunt.sn; // Example: "US III"
    const monster = character.s.monsterhunt.id; // Example "mummy"
    const amount = character.s.monsterhunt.c; // Example 5
    const time = character.s.monsterhunt.ms; // Example 1768677 milliseconds
    // We check the name and location of the current server we are on
    const currentServer = parent.server_region + ' ' + parent.server_identifier;
    // If monster is in our whitelist
    if (monsterHuntWhitelist.includes(monster)) {
      // Return if we are on the wrong server for our monster hunt
      if (currentServer != server) return;
      // If we still have monsters left to kill
      if (amount > 0) {
        const target = get_targeted_monster();
        if (target) {
          attackMonsters(target);
        } else {
          // Refer to the 'farmNormally()' custom function
          const desiredMonster = get_nearest_monster({type: monster, no_target: true});
          if (!desiredMonster && !smart.moving) {
            smart_move(monster);
          } else {
            change_target(desiredMonster);
          }
        }
      } else if (!smart.moving) { // If we have killed enough to complete the quest and we aren't smart moving
        // We can turn in the quest
        smart_move('monsterhunter', function() {
          // Once we arrive at daisy, we interact with her to turn in the quest
          setTimeout(function() {
            parent.socket.emit('monsterhunt');
          }, 250); // 1/4th second after arriving
        });
      }
    }
  }
}

// Farms normally if we cant complete our monster hunt
function handleFarming() {
  // Make sure we have quests at all times, and decide if we can complete them
  handleMonsterHunts();
  // Too hard to complete quest, farm normally
  farmNormally();
}

// Custom attack function
function attackMonsters(target) {
  // If a target has been defined
  if (target) {
    const distance = distanceToPoint(target.real_x, target.real_y, character.real_x, character.real_y);
    // If we can attack it
    if (distance <= character.range) {
      // If we are not in cooldown
      if (can_attack(target)) {
        attack(target);
      }
    } else if (!character.moving) {
      // If we are not within attack range and not moving
      move(
          /*
                    This is similar too the 'distanceToPoint(x1, y1, x2, y2)' function,
                    except this one returns the center between two points, not the distance
                */
          character.real_x + (target.real_x - character.real_x) / 2,
          character.real_y + (target.real_y - character.real_y) / 2,
      );
    }
  }
}

// Retains a set amount of gold for potions, never gives to the merchant
function retainGoldAmount() {
  const hpGold = parent.G.items[potionTypes[0]].g; // Price of single health pot
  const mpGold = parent.G.items[potionTypes[1]].g; // Price of single mana pot
  const hpTotal = hpGold * potionTypes[2]; // Total gold to purchase our stack amount
  const mpTotal = mpGold * potionTypes[2]; // Total gold to purchase our stack amount
  const keepGold = hpTotal + mpTotal; // Costs of both a stack of health pots and a stack of mana pots
  return keepGold;
}

// A farmer will 'ping' the merchant with some information, and the merchant will be coded to respond
// this one will ask the merchant to bring potions based on three things...
function requestMerchant() {
  // 1) How many health pots we have. 2) How mana mana pots we have. 3) How much inventory space we have
  if (quantity(potionTypes[0]) < 100 || quantity(potionTypes[1]) < 100 || character.esize < 5) {
    // If any of those conditions are met, then we need a visit from the merchant
    // We need to give the merchant some information when we ping them.
    const data = {
      message: 'bring_potions',
      location: {x: character.real_x, y: character.real_y, map: character.map},
      hpot: potionTypes[2] - quantity(potionTypes[0]), // how many we need
      mpot: potionTypes[2] - quantity(potionTypes[1]), // how many we need
      name: character.name,
    };
    // This pings the merchant by name, and the information is defined as a letiable 'data'
    send_cm(merchantName, data);
  }
}

// This will not be run in an interval, it is fully static.
// This is the response logic, based on if someone pings you with information
function on_cm(sender, data) {
  if (data.message == 'bring_potions') { // Refer to 'requestMerchant()' function
    const potionSeller = getNpcById('fancypots');
    const potionSellerLocation = {x: potionSeller.x, y: potionSeller.y, map: potionSeller.map};
    // We need to top off our potions at the potion seller
    if (!smart.moving) {
      smart_move(potionSellerLocation, function() {
        // Once we arrive at the potion seller
        if (quantity(potionTypes[0]) < 4000) {
          buy_with_gold(potionTypes[0], data.hpot); // Buy health pots for the farmer
        }
        if (quantity(potionTypes[1]) < 4000) {
          buy_with_gold(potionTypes[1], data.mpot); // Buy mana pots for the farmer
        }
        // Move to the farmer
        smart_move(data.location, function() {
          // Once we arrive at the farmer, we send them potions they asked for
          send_item(data.name, locateItem(potionTypes[0]), data.hpot);
          send_item(data.name, locateItem(potionTypes[1]), data.mpot);
        });
      });
    }
  }
}

// Loop through the inventory to find an item by name
function locateItem(name) {
  for (const i in character.items) {
    const slot = character.items[i];
    if (slot != null) {
      const item = slot.name;
      if (item == name) {
        return i;
      }
    }
  }
  return null;
}

// Sells items in sellWhitelist
function sellItems() {
  for (const i in character.items) {
    const slot = character.items[i];
    if (slot != null) {
      const name = slot.name;
      if (sellWhitelist.includes(name)) {
        parent.sell(i, 9999);
      }
    }
  }
}

// Tell our merchant where to idle when they aren't doing anything
async function handleMerchantLocationIdle() {
  const location = merchantIdle[1]; // Check the letiable to see how we tell them where to "idle"
  if (character.map != location.map && !smart.moving) {
    await smart_move(location);
  } else {
    const distance = distanceToPoint(location.x, location.y, character.real_x, character.real_y);
    if (distance >= 10 && !smart.moving) {
      await smart_move(location);
    }
  }
}

// Merchant and farmers run logic allowing them to always build a proper party
function handleParty() {
  if (character.name == merchantName) {
    // We check the amount of characters in our party
    // If we haven't got the three farmers in our party (4 ppl total)
    // Then we keep trying to create the party
    // Merchant only runs this party of the logic
    if (Object.keys(parent.party).length < partyNames.length) {
      // Loop through our party members array
      for (const i in partyNames) {
        const player = partyNames[i]; // Define each member in the array
        if (player && player != merchantName) {
          // If the player is not in a party, or if they are but not ours...
          if (player.party == undefined || (player.party != undefined && player.party != character.name)) {
            // Invite them to our party
            send_party_invite(player);
          }
        }
      }
    }
    // Only farmers run this party of the logic if we are not in any party
  } else if (farmerNames.includes(character.name) && character.party == null) {
    accept_party_invite(merchantName); // Accept invites from our merchant
  } else if (character.party != merchantName) {
    // If we are in a party, but it's not the merchant's party...
    // Leave this party to go to the merchant's party
    leave_party();
  }
}

// Exchanges items in our exchangeWhitelist
function exchangeItems() {
  // Loop through our inventory
  for (const i in character.items) {
    const item = character.items[i]; // Define an item in each slot
    if (item) { // If slot is not empty
      // If the item name is included in our whitelist
      if (exchangeWhitelist.includes(item.name)) {
        const npc = getNpcById('exchange');
        // We need to decide if we should move to the exchange npc
        if (character.map != npc.map) {
          const distance = null;
        } else {
          const distance = distanceToPoint(npc.x, npc.y, character.real_x, character.real_y);
        }
        // If the distance to the exchange npc is too far
        if (distance == null || (distance != null && distance >= 300)) {
          if (!smart.moving) {
            // We will move to the exchange npc
            const location = {x: npc.x, y: npc.y, map: npc.map};
            smart_move(location);
          }
        } else { // Are we close enough to the exchange npc?
          // If we are, then do an exchange!
          exchange(i);
        }
      }
    }
  }
}

// Uses priest spells
function priestSkills() {
  if (character.ctype != 'priest') return;
  const target = get_targeted_monster();
  setInterval(function() {
    use_skill('partyheal'); // Heals party
    use_skill('curse', target); // Debuffs enemy
  }, 5000); // every 5 seconds
}

// Uses warrior spells
function warriorSkills() {
  if (character.ctype != 'warrior') return;
  const target = get_targeted_monster();
  setInterval(function() {
    use_skill('taunt', target); // Taunts target
  }, 3000); // Every 3 seconds
  setInterval(function() {
    use_skill('charge'); // Charge too target
  }, 40000); // Every 40 seconds
  /*
    setInterval(function(){
        if(character.hp <= character.max_hp / 2){
            use_skill("hardshell"); // When half health hardshell is activated
        }
    }, 250);
    */
}

// Uses hunter spells
function hunterSkills() {
  // If class is ranger and mana is over 300
  if (character.ctype != 'ranger') return;
  if (character.mp < 300) return;

  setInterval(function() {
    const targets = Object.values(parent.entities).filter((entity) => entity.mtype === farmMonster[1] && is_in_range(entity, '3shot'));
    // Casts 3shot every 1 seconds if can use
    use_skill('3shot', targets);
  }, 1000);
}

// Stays on main server for one hour before cycling through all servers
function visitServers() {
  /*
        Main server EU I
        Stays on mainServer for a hour then swaps to "EU II".
        Goes through each server for one minute until returning to mainServer
    */
  // (currentServer, newServerRegion, newServerNumber)
  serverLogic(mainServer, 'EU', 'II');
  serverLogic('EU II', 'US', 'I');
  serverLogic('US I', 'US', 'II');
  serverLogic('US II', 'US', 'III');
  serverLogic('US III', 'ASIA', 'I');
  serverLogic('ASIA I', 'EU', 'I');
}

// str, str, str
function serverLogic(server, newRegion, newServerNumber) {
  const hour = 3600000; // One hour in milliseconds
  const minute = 60000; // One minute in milliseconds
  // Server we are on
  const currentServer = parent.server_region + ' ' + parent.server_identifier;
  // If we are on our main server mainServer We change servers after an hour
  // To change main server replace mainServer with your choice of server
  if (currentServer == mainServer && server == currentServer) {
    setTimeout(function() {
      change_server(newRegion, newServerNumber);
    }, hour);
    // Else if we are not on main server change server each minute
  } else if (server == currentServer) {
    setTimeout(function() {
      change_server(newRegion, newServerNumber);
    }, minute);
  }
}
