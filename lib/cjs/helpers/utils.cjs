"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCurrentDate = exports.clone = void 0;
const getCurrentDate = () => new Date().toLocaleString();
exports.getCurrentDate = getCurrentDate;
const clone = obj => JSON.parse(JSON.stringify(obj));
exports.clone = clone;