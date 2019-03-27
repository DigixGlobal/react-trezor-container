'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.signTransaction = signTransaction;
exports.getAddress = getAddress;
exports.signMessage = signMessage;
exports.verifyMessage = verifyMessage;

var _ethereumjsTx = require('ethereumjs-tx');

var _ethereumjsTx2 = _interopRequireDefault(_ethereumjsTx);

var _ethereumjsUtil = require('ethereumjs-util');

var _ethereumjsUtil2 = _interopRequireDefault(_ethereumjsUtil);

var _trezorConnect = require('trezor-connect');

var _trezorConnect2 = _interopRequireDefault(_trezorConnect);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_trezorConnect2.default.manifest({
  email: 'rbanate@digixglobal.com',
  appUrl: 'https://digix.global'
});

function signTransaction(trezor, kdPath, txData) {
  var to = txData.to,
      nonce = txData.nonce,
      gasPrice = txData.gasPrice,
      value = txData.value,
      gas = txData.gas,
      data = txData.data,
      from = txData.from;


  var sanitizedTxData = {
    to: _ethereumjsUtil2.default.addHexPrefix(to),
    nonce: _ethereumjsUtil2.default.addHexPrefix(nonce === '0x0' ? '00' : nonce),
    gasPrice: _ethereumjsUtil2.default.addHexPrefix(gasPrice), // `0${util.stripHexPrefix(gasPrice)}`,
    value: _ethereumjsUtil2.default.addHexPrefix(value),
    data: data !== '' ? _ethereumjsUtil2.default.addHexPrefix(data) : null,
    gasLimit: _ethereumjsUtil2.default.addHexPrefix(gas),
    from: _ethereumjsUtil2.default.addHexPrefix(from),
    chainId: txData.chainId || 1
  };

  return _trezorConnect2.default.ethereumSignTransaction({
    path: kdPath,
    transaction: _extends({}, sanitizedTxData)
  }).then(function (response) {

    if (response.success) {

      var tx = new _ethereumjsTx2.default(sanitizedTxData);
      tx.v = response.payload.v;
      tx.r = response.payload.r;
      tx.s = response.payload.s;
      // sanity check
      var sender = tx.getSenderAddress().toString('hex');

      if (txData.from && (0, _helpers.sanitizeAddress)(sender) !== (0, _helpers.sanitizeAddress)(txData.from)) {
        return reject('Signing address does not match sender');
      }
      // format the signed transaction for web3
      var signedTx = (0, _ethereumjsUtil.addHexPrefix)(tx.serialize().toString('hex'));

      return signedTx;
    }
  });
}

function getAddress(trezor, kdPath) {
  return new Promise(function (resolve, reject) {
    trezor.ethereumGetAddress(kdPath, function (response) {
      if (response.success) {
        return resolve(response);
      }
      return reject(response.error);
    });
  });
}

function signMessage(trezor, kdPath, txData) {
  return new Promise(function (resolve, reject) {
    _trezorConnect2.default.ethereumSignMessage({
      path: kdPath,
      message: txData
    }).then(function (response) {
      if (response.success) {

        var signedTx = (0, _ethereumjsUtil.addHexPrefix)(response.payload.signature);
        console.log({ signedTx: signedTx });
        return resolve(signedTx);
      } else {
        return reject(response.payload.error);
      }
    });
  });
}

function verifyMessage(trezor, kdPath, txData) {
  trezor.ethereumVerifyMessage(kdPath, txData.signature, txData.Messsage, function (response) {
    return response;
  });
}