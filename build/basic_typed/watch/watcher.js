"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWatching = exports.createFileWatcher = void 0;
const path = require("path");
require("../utils/global");
const config_1 = require("./config");
const compile_handler_1 = require("./compile-handler");
const file_writer_1 = require("./file-writer");
const logger_1 = require("./logger");
const paths_1 = require("./paths");
const settings_loader_1 = require("./settings-loader");
const chokidar = require("chokidar");
const createFileWatcher = () => chokidar.watch("file or dir", {
    ignored: config_1.IGNORED_PATTERN,
    persistent: true,
});
exports.createFileWatcher = createFileWatcher;
const startWatching = (watcher) => {
    (0, logger_1.msg)("Started..");
    const { rulesFileName, rulesFullPath } = (0, settings_loader_1.resolveWatchPaths)();
    const userRules = (0, settings_loader_1.loadUserRules)(rulesFullPath);
    const settingsFile = (0, settings_loader_1.loadSettingsFile)(rulesFullPath);
    const settings = (0, settings_loader_1.mergeSettings)(settingsFile);
    const folders = [settings.srcFolder, settings.distFolder];
    const srcDirectory = path.join(process.cwd(), folders[0]);
    global.settings = settings;
    const runtime = {
        folders,
        rulesFileName,
        rulesFullPath,
        userRules,
    };
    const compileHandler = (0, compile_handler_1.createCompileHandler)(runtime);
    watcher
        .on("add", compileHandler)
        .on("change", compileHandler)
        .on("unlink", (fileName) => (0, file_writer_1.deleteOutput)((0, paths_1.getOutputPath)(fileName, folders)))
        .on("error", (error) => {
        console.log("An error has occured error...\n", error);
    });
    watcher.add(srcDirectory);
    watcher.add(path.join(process.cwd(), rulesFileName));
};
exports.startWatching = startWatching;
