# React Trezor Container

React Component that implements [Trezor Connect](https://github.com/trezor/connect)

## Features

- Public Address retrieval
  - Returns an HD wallet that allows you to retrieve public addresses based ond the provided path
- Transactions
  - `signTransaction`
  - `sigMessage`
  - `getAddress`
- `getAddresses` option for pulling addresses based on the specified path (defaults to first account if not provided)
- `expect` option for validating address
- `onReady` event handler for triggering actions

## Example

- Getting addresses

```
  import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Message } from 'semantic-ui-react';

import TrezorContainer from '@digix/react-trezor-container';

import TrezorAddressList from './trezor_keystore_address_list';
import TrezorKeystoreAddressItem from './trezor_keystore_address_item';

export default class TrezorKeystoreCreationForm extends Component {
  constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
    this.handleItemChange = this.handleItemChange.bind(this);
    this.renderContainer = this.renderContainer.bind(this);
  }
  handleItemChange(e) {
    const { name, value } = e;
    const { enabled } = value;
    const addresses = (this.props.formData || {}).addresses || {};
    if (!enabled && addresses) {
      delete addresses[name];
      this.props.formChange({ name: 'addresses', value: { ...addresses } });
    } else {
      const update = {
        networks: (addresses[name] || {}).networks || this.props.formData.networks,
        tokens: (addresses[name] || {}).tokens || this.props.formData.tokens,
        ...value,
      };
      this.props.formChange({ name: 'addresses', value: { ...addresses, [name]: { ...addresses[name], ...update } } });
    }
  }

  renderContainer({ renderItems }) {
    const count = Object.values(this.props.formData.addresses || {}).filter(a => a.enabled).length;
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Select addresses to enable</Table.HeaderCell>
            <Table.HeaderCell textAlign="right" colSpan={100}>
              {count} enabled
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>{renderItems()}</Table.Body>
      </Table>
    );
  }
  renderError({ error }) {
    return <Message icon="warning sign" negative header="Trezor Error" content={`${error}`} />;
  }
  renderItem(item) {
    if (!item.address) {
      return (
        <Table.Row disabled key={item.kdPath}>
          <Table.Cell colSpan={100}>Getting Address Info...</Table.Cell>
        </Table.Row>
      );
    }
    const data = ((this.props.formData || {}).addresses || {})[item.kdPath] || {};
    return <TrezorKeystoreAddressItem key={item.kdPath} {...item} data={data} onChange={this.handleItemChange} />;
  }
  render() {
    const { renderContainer, renderItem } = this;
    // return <TrezorAddressList {...this.props} {...{ renderContainer, renderItem }} />;
    return (
      <TrezorContainer
        renderError={this.renderError}
        renderLoading={() => (
          <Message
            icon="info circle"
            info
            header="Connecting to Trezor"
            content="Please follow instructions on the Trezor Popup window to continue."
          />
        )}
        getAddresses={props => <TrezorAddressList {...props} {...{ renderContainer, renderItem }} />}
      />
    );
  }
}

TrezorKeystoreCreationForm.propTypes = {
  formData: PropTypes.object.isRequired,
  formChange: PropTypes.func.isRequired,
};
```

- Signing Transaction

```
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';
import TrezorContainer from '@digix/react-trezor-container';

export default class TrezorKeystoreTransactionSigner extends Component {
  constructor(props) {
    super(props);
    this.handleSign = this.handleSign.bind(this);
    this.state = { signed: false };
  }
  handleSign({ signTransaction }) {
    const { txData, address, hideTxSigningModal } = this.props;
    const { kdPath } = address;
    signTransaction(kdPath, txData, hideTxSigningModal)
      .then((signedTx) => {
        this.setState({ signed: true });
        hideTxSigningModal({ signedTx });
      })
      .catch(error => this.setState({ error }));
  }
  renderError() {
    const { error } = this.state;
    return <Message icon="warning sign" negative header={'Trezor Transaction'} content={error} />;
  }
  render() {
    const { kdPath, address } = this.props.address;
    const { error } = this.state;
    if (error) {
      return this.renderError();
    }
    const { signed } = this.state;
    return (
      <TrezorContainer
        expect={{ kdPath, address }}
        onReady={this.handleSign}
        signed={signed}
        renderReady={() => (
          <Message
            icon="check"
            positive
            header={'Ready to Sign Transaction'}
            content="Trezor Popup window is loading. Please follow instructions from the popup and your Trezor Wallet to continue."
          />
        )}
      />
    );
  }
}

TrezorKeystoreTransactionSigner.propTypes = {
  hideTxSigningModal: PropTypes.func.isRequired,
  address: PropTypes.object.isRequired,
  txData: PropTypes.object.isRequired,
};
```

# TODO

- Bitcoin support
