"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// next up better var detection
// handle deleted files
require("./utils/global");
const cli_1 = require("./watch/cli");
const settings_loader_1 = require("./watch/settings-loader");
const watcher_1 = require("./watch/watcher");
(0, settings_loader_1.initGlobalSettings)();
const cliOptions = (0, cli_1.parseCli)();
(0, cli_1.runCliActions)(cliOptions);
const watcher = (0, watcher_1.createFileWatcher)();
(0, watcher_1.startWatching)(watcher);
