function buyFromPonty(itemName, itemLevel) {
	// Set up the handler
	parent.socket.once("secondhands", function (data) {
		for (let d of data) {
			// If ponty has something in our items_wanted whitelist and its the right ilvl
			if (itemName.includes(d.name) && (d.level == itemLevel || null == d.level)) {
				// Buy item
				parent.socket.emit("sbuy", { "rid": d.rid })
			}
		}
	});
	parent.socket.emit("secondhands");
}

// Only change this
items_wanted = [
	"gslime",
	"crabclaw",
	"beewings",
	"wattire",
	"wshoes",
	"wcap",
	"wbreeches",
	"wgloves",
	"firestaff",
	"fireblade",
	"firebow",
	"wbook0",
	"strearring",
	"intearring",
	"dexearring",
	"dexamulet",
	"stramulet",
	"intamulet",
	"dexbelt"
]

// Buy items_wanted from ponty at level 0 every 20 seconds
setInterval(function () {
	buyFromPonty(items_wanted, 0);
}, 20000);
