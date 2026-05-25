"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startsWithAt = exports.range = void 0;
const range = (start, end) => Array.from({ length: end - start }, (_, i) => start + i);
exports.range = range;
const startsWithAt = (str, needle, i) => str.slice(i, i + needle.length) === needle;
exports.startsWithAt = startsWithAt;
