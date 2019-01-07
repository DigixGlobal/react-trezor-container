'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signTransaction = signTransaction;
exports.getAddress = getAddress;
exports.signMessage = signMessage;
exports.verifyMessage = verifyMessage;

var _ethereumjsTx = require('ethereumjs-tx');

var _ethereumjsTx2 = _interopRequireDefault(_ethereumjsTx);

var _ethereumjsUtil = require('ethereumjs-util');

var _ethereumjsUtil2 = _interopRequireDefault(_ethereumjsUtil);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants';

function signTransaction(trezor, kdPath, txData) {
  var to = txData.to,
      nonce = txData.nonce,
      gasPrice = txData.gasPrice,
      value = txData.value,
      gas = txData.gas,
      data = txData.data;


  var sanitizedTxData = {
    to: _ethereumjsUtil2.default.addHexPrefix(to),
    nonce: _ethereumjsUtil2.default.addHexPrefix(nonce === '0x0' ? '00' : nonce),
    gasPrice: _ethereumjsUtil2.default.addHexPrefix(gasPrice), // `0${util.stripHexPrefix(gasPrice)}`,
    value: _ethereumjsUtil2.default.addHexPrefix(value),
    data: data !== '' ? _ethereumjsUtil2.default.addHexPrefix(data) : null,
    gasLimit: _ethereumjsUtil2.default.addHexPrefix(gas),
    chainId: txData.chainId || 1
  };

  return new Promise(function (resolve, reject) {
    trezor.ethereumSignTx(kdPath, (0, _helpers.hex)(_ethereumjsUtil2.default.stripHexPrefix(sanitizedTxData.nonce)), (0, _helpers.hex)(_ethereumjsUtil2.default.stripHexPrefix(sanitizedTxData.gasPrice)), (0, _helpers.hex)(_ethereumjsUtil2.default.stripHexPrefix(sanitizedTxData.gasLimit)), _ethereumjsUtil2.default.stripHexPrefix(sanitizedTxData.to), (0, _helpers.hex)(_ethereumjsUtil2.default.stripHexPrefix(sanitizedTxData.value)), _ethereumjsUtil2.default.stripHexPrefix(sanitizedTxData.data), sanitizedTxData.chainId, function (response) {
      if (response.success) {
        var tx = new _ethereumjsTx2.default(sanitizedTxData);

        tx.v = (0, _ethereumjsUtil.addHexPrefix)(response.v);
        tx.r = (0, _ethereumjsUtil.addHexPrefix)(response.r);
        tx.s = (0, _ethereumjsUtil.addHexPrefix)(response.s);
        // sanity check
        var sender = tx.getSenderAddress().toString('hex');
        // TrezorConnect.close();
        if (txData.from && (0, _helpers.sanitizeAddress)(sender) !== (0, _helpers.sanitizeAddress)(txData.from)) {
          return reject('Signing address does not match sender');
        }
        // format the signed transaction for web3
        var signedTx = (0, _ethereumjsUtil.addHexPrefix)(tx.serialize().toString('hex'));
        return resolve(signedTx);
      }
      return reject(response.error);
    });
  });
}

// import TrezorConnect from './connect';
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

    trezor.ethereumSignMessage(kdPath, txData, function (response) {
      if (response.success) {
        // address.value = response.address;
        // messageV.value = message.value;
        // signature.value = response.signature;
        var signature = (0, _ethereumjsUtil.addHexPrefix)(response.signature);
        return resolve(signature);
      }
      // address.value = '';
      // messageV.value = '';
      // signature.value = '';
      return reject(response.error);
    });
  });
}

function verifyMessage(trezor, kdPath, txData) {
  trezor.ethereumVerifyMessage(kdPath, txData.signature, txData.Messsage, function (response) {
    return response;
  });
}