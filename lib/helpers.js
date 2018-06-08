'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitizeAddress = sanitizeAddress;
exports.decimalToHex = decimalToHex;
exports.hex = hex;

var _ethereumjsUtil = require('ethereumjs-util');

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sanitizeAddress(address) {
  return (0, _ethereumjsUtil.addHexPrefix)(address).toLowerCase();
}

function decimalToHex(dec) {
  return new _bignumber2.default(dec).toString(16);
}

function hex(val) {
  if (val.length % 2 !== 0) return '0' + val;

  return val;
}