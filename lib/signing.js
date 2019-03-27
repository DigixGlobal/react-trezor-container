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

// import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants';

// export function signTransaction(trezor, kdPath, txData) {
//   const { to, nonce, gasPrice, value, gas, data } = txData;

//   const sanitizedTxData = {
//     to: util.addHexPrefix(to),
//     nonce: util.addHexPrefix(nonce === '0x0' ? '00' : nonce),
//     gasPrice: util.addHexPrefix(gasPrice), // `0${util.stripHexPrefix(gasPrice)}`,
//     value: util.addHexPrefix(value),
//     data: data !== '' ? util.addHexPrefix(data) : null,
//     gasLimit: util.addHexPrefix(gas),
//     chainId: txData.chainId || 1
//   };

//   return new Promise((resolve, reject) => {
//     trezor.ethereumSignTx(
//       kdPath,
//       hex(util.stripHexPrefix(sanitizedTxData.nonce)),
//       hex(util.stripHexPrefix(sanitizedTxData.gasPrice)),
//       hex(util.stripHexPrefix(sanitizedTxData.gasLimit)),
//       util.stripHexPrefix(sanitizedTxData.to),
//       hex(util.stripHexPrefix(sanitizedTxData.value)),
//       util.stripHexPrefix(sanitizedTxData.data),
//       sanitizedTxData.chainId,
//       response => {
//         if (response.success) {
//           const tx = new EthTx(sanitizedTxData);

//           tx.v = addHexPrefix(response.v);
//           tx.r = addHexPrefix(response.r);
//           tx.s = addHexPrefix(response.s);
//           // sanity check
//           const sender = tx.getSenderAddress().toString('hex');
//           // TrezorConnect.close();
//           if (
//             txData.from &&
//             sanitizeAddress(sender) !== sanitizeAddress(txData.from)
//           ) {
//             return reject('Signing address does not match sender');
//           }
//           // format the signed transaction for web3
//           const signedTx = addHexPrefix(tx.serialize().toString('hex'));
//           return resolve(signedTx);
//         }
//         return reject(response.error);
//       }
//     );
//   });
// }

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
  return _trezorConnect2.default.ethereumSignMessage({
    path: kdPath,
    message: txData
  }).then(function (response) {
    if (response.success) {

      var signedTx = (0, _ethereumjsUtil.addHexPrefix)(response.payload.signature);
      console.log({ signedTx: signedTx });
      return signedTx;
    }
  });
}

// export function signMessage(trezor, kdPath, txData) {
//   return new Promise((resolve, reject) => {

//     trezor.ethereumSignMessage(kdPath, txData, response => {
//       if (response.success) {
//         // address.value = response.address;
//         // messageV.value = message.value;
//         // signature.value = response.signature;
//         const signature = addHexPrefix(response.signature);
//         return resolve(signature);
//       }
//       // address.value = '';
//       // messageV.value = '';
//       // signature.value = '';
//       return reject(response.error);
//     });
//   });
// }

function verifyMessage(trezor, kdPath, txData) {
  trezor.ethereumVerifyMessage(kdPath, txData.signature, txData.Messsage, function (response) {
    return response;
  });
}