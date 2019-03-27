import EthTx from 'ethereumjs-tx';
import util, { addHexPrefix } from 'ethereumjs-util';

import TrezorConnect from 'trezor-connect';

import { sanitizeAddress, hex } from './helpers';

TrezorConnect.manifest({
  email: 'rbanate@digixglobal.com',
  appUrl: 'https://digix.global'
});

export function signTransaction(trezor, kdPath, txData) {
  const { to, nonce, gasPrice, value, gas, data, from } = txData;

    const sanitizedTxData = {
    to: util.addHexPrefix(to),
    nonce: util.addHexPrefix(nonce === '0x0' ? '00' : nonce),
    gasPrice: util.addHexPrefix(gasPrice), // `0${util.stripHexPrefix(gasPrice)}`,
    value: util.addHexPrefix(value),
    data: data !== '' ? util.addHexPrefix(data) : null,
    gasLimit: util.addHexPrefix(gas),
    from: util.addHexPrefix(from),
    chainId: txData.chainId || 1
  };

  return new Promise((resolve, reject)=> {
    TrezorConnect.ethereumSignTransaction({
      path: kdPath,
      transaction: {
          ...sanitizedTxData
      }
    }).then(response=> {

        if (response.success) {

          const tx = new EthTx(sanitizedTxData);
          tx.v = response.payload.v;
          tx.r = response.payload.r;
          tx.s = response.payload.s;
          // sanity check
          const sender = tx.getSenderAddress().toString('hex');

          if (
            txData.from &&
            sanitizeAddress(sender) !== sanitizeAddress(txData.from)
          ) {
            return reject('Signing address does not match sender');
          }
          // format the signed transaction for web3
          const signedTx = addHexPrefix(tx.serialize().toString('hex'));

          return resolve(signedTx);
      }
      else {
        return reject(response.payload.error);
      }

    });
  });


}

export function getAddress(trezor, kdPath) {
  return new Promise((resolve, reject) => {
    trezor.ethereumGetAddress(kdPath, response => {
      if (response.success) {
        return resolve(response);
      }
      return reject(response.error);
    });
  });
}

export function signMessage(trezor, kdPath, txData) {
  return new Promise((resolve, reject)=> {
    TrezorConnect.ethereumSignMessage({
      path: kdPath,
      message: txData
    }).then(response => {
      if (response.success) {

        const signedTx = addHexPrefix(response.payload.signature);
        return resolve(signedTx);
    }
    else {
      return reject(response.payload.error);
    }
  })

  });
 }

export function verifyMessage(trezor, kdPath, txData) {
  trezor.ethereumVerifyMessage(
    kdPath,
    txData.signature,
    txData.Messsage,
    response => response
  );
}