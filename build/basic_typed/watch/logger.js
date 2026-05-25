"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.msg = void 0;
const msg = (...msgs) => {
    const time = new Date().toLocaleString().split(" ")[1];
    console.log(`${time}|`, ...msgs);
};
exports.msg = msg;
