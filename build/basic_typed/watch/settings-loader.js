"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeSettings = exports.resolveWatchPaths = exports.initGlobalSettings = exports.loadUserRules = exports.loadSettingsFile = void 0;
require("../utils/global");
const path = require("path");
const config_1 = require("./config");
const highlight = require("../highlight");
const compileModule = require("../core/compile");
const loadSettingsFile = (settingsFileName) => {
    try {
        Object.keys(require.cache).forEach((key) => {
            delete require.cache[key];
        });
        const settingsFile = require(settingsFileName);
        global.settingsFile = Object.assign(Object.assign({}, global.settingsFile), settingsFile || {});
        global.settings = Object.assign(Object.assign({}, global.settings), settingsFile.settings || {});
        return settingsFile;
    }
    catch (_a) {
        console.log("rules file not found, make sure you have a valid _extend.js file at the current directory, run extendx -h for help");
        process.exit();
    }
};
exports.loadSettingsFile = loadSettingsFile;
const loadUserRules = (fileName) => {
    let settingsFile = (0, exports.loadSettingsFile)(fileName);
    for (let i = 0; i < config_1.MAX_RULES_RELOAD_ATTEMPTS; i++) {
        if (!Object.keys(settingsFile).length) {
            settingsFile = (0, exports.loadSettingsFile)(fileName);
        }
        else {
            break;
        }
    }
    console.log(".>>>", settingsFile, Object.keys(settingsFile));
    const userRules = compileModule.handleRules(settingsFile);
    const markers = [settingsFile.settings.codeOpening, settingsFile.settings.codeClosing];
    highlight.start(userRules, markers);
    return userRules;
};
exports.loadUserRules = loadUserRules;
const initGlobalSettings = () => {
    global.settings = Object.assign({}, config_1.DEFAULT_SETTINGS);
};
exports.initGlobalSettings = initGlobalSettings;
const resolveWatchPaths = (cwd = process.cwd()) => ({
    rulesFileName: config_1.RULES_FILE_NAME,
    rulesFullPath: path.join(cwd, config_1.RULES_FILE_NAME),
});
exports.resolveWatchPaths = resolveWatchPaths;
const mergeSettings = (settingsFile) => (Object.assign(Object.assign({}, config_1.DEFAULT_SETTINGS), settingsFile.settings));
exports.mergeSettings = mergeSettings;
