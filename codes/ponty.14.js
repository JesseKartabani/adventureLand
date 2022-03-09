function buyFromPonty(itemName, itemLevel) {
    // Set up the handler
    parent.socket.once("secondhands", function(data) {
        for(let d of data){
            if (itemName.includes(d.name) && (d.level == itemLevel || null == d.level) ) {
                parent.socket.emit("sbuy", { "rid": d.rid })
            }
        }
    });

    // Attempt to buy stuff
    parent.socket.emit("secondhands");
}

// Only change this
items_wanted = [
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

setInterval(function(){
	buyFromPonty(items_wanted, 0);	
}, 20000);
