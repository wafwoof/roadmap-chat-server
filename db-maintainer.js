// A daemon for tracking the file size of ./logs/chat-log.json
var cron = require('node-cron');
var fs = require("fs");

function shrinkDatabase() {
    var stats = fs.statSync("./logs/chat-log.json");
    var fileSizeInBytes = stats["size"];
    var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
    console.log("JSON DB is " + fileSizeInMegabytes + " megabytes");
    // 0.01mB = 10kB
    if (fileSizeInMegabytes > 0.01) {
        // DB TOO LARGE, MUST SHRINK DB
        console.log("DB file size is too big, must shrink to prevent data usage.");

	    // 1. Read chatlog file, load into memory as json
	    fs.readFile("./logs/chat-log.json", function (err, data) {
		    var json = JSON.parse(data);
		    // 2. delete all but the last 40 messages
            var shrunkjson = json.messages.slice(-40);
		    // 3. write changes to actual file
		    fs.writeFileSync("./logs/chat-log.json", JSON.stringify(shrunkjson));
        })
    }
    else {
        console.log("DB file size is not big enough to warrant shrinking.");
        return;
    }
}

cron.schedule('*/5 * * * *', () => {
    shrinkDatabase();
  });
