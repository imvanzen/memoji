"use strict";

const fs = require("fs");

const emojis_list = fs.readdirSync("img/emojis", { encoding: "utf8" });

console.log(JSON.stringify(emojis_list, null, 2));
