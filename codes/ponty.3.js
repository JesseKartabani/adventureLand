function buyFromPonty(itemName, itemLevel) {
  // Set up the handler
  parent.socket.once('secondhands', function(data) {
    for (const d of data) {
      // If ponty has something in our itemsWanted whitelist and its the right ilvl
      if (itemName.includes(d.name) && (d.level == itemLevel || null == d.level)) {
        // Buy item
        parent.socket.emit('sbuy', {'rid': d.rid});
      }
    }
  });
  parent.socket.emit('secondhands');
}

// Only change this
itemsWanted = [
  'gslime',
  'crabclaw',
  'beewings',
  'wattire',
  'wshoes',
  'wcap',
  'wbreeches',
  'wgloves',
  'firestaff',
  'fireblade',
  'firebow',
  'wbook0',
  'strearring',
  'intearring',
  'dexearring',
  'dexamulet',
  'stramulet',
  'intamulet',
  'dexbelt',
  'spores',
  'cape'
];

// Buy itemsWanted from ponty at level 0 every 20 seconds
setInterval(function() {
  buyFromPonty(itemsWanted, 0);
}, 20000);
