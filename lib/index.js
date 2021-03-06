'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _hdkey = require('ethereumjs-wallet/hdkey');

var _hdkey2 = _interopRequireDefault(_hdkey);

var _trezorConnect = require('trezor-connect');

var _trezorConnect2 = _interopRequireDefault(_trezorConnect);

var _constants = require('./constants');

var _signing = require('./signing');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// import TrezorConnect from './connect';

var TrezorReactContainer = function (_Component) {
  _inherits(TrezorReactContainer, _Component);

  function TrezorReactContainer(props) {
    _classCallCheck(this, TrezorReactContainer);

    var _this = _possibleConstructorReturn(this, (TrezorReactContainer.__proto__ || Object.getPrototypeOf(TrezorReactContainer)).call(this, props));

    _this.getTrezorWallet = function () {
      _this.getDefaultPubKey().then(function (_ref) {
        var payload = _ref.payload;

        var hdWallet = _hdkey2.default.fromExtendedKey(payload.xpub);
        _this.setState({
          trezor: { hdWallet: hdWallet },
          showAddresses: true,
          loading: false
        });
      }).catch(function (error) {
        _this.setState({ showAddresses: false, loading: false, error: error });
        if (_this.props.onError) {
          _this.props.renderError(error);
          _this.props.onError();
        }
      });
    };

    _this.getChildProps = function () {
      var _this$state = _this.state,
          trezor = _this$state.trezor,
          error = _this$state.error;

      return {
        trezor: trezor,
        config: null,
        signTransaction: _this.handleSignTransaction,
        signMessage: _this.handleSignMessage,
        verifyMessage: _this.verifyMessage,
        reconnect: _this.getTrezorWallet,
        onSuccess: _this.props.onSuccess,
        error: error
      };
    };

    _this.getErrorProps = function () {
      var _this$state2 = _this.state,
          error = _this$state2.error,
          trezor = _this$state2.trezor;

      return {
        reconnect: _this.getDefaultPubKey,
        error: error,
        trezor: trezor
      };
    };

    _this.realoadPubKey = function () {
      _this.getTrezorWallet();
      return _this.renderAddresses();
    };

    _this.renderReady = function () {
      return _this.props.renderReady(_this.getChildProps());
    };

    _this.renderAddresses = function () {
      return _this.props.getAddresses(_this.getChildProps());
    };

    _this.renderError = function () {
      var error = _this.state.error;

      if (error && _this.props.renderError) {
        return _this.props.renderError(_this.getErrorProps());
      }
      return null;
    };

    _this.renderLoading = function () {
      var renderLoading = _this.props.renderLoading;

      if (renderLoading) {
        return _this.props.renderLoading();
      }
      return null;
    };

    _this.renderSigningReady = function () {
      var _this$props = _this.props,
          renderReady = _this$props.renderReady,
          onReady = _this$props.onReady;

      if (renderReady) {
        onReady(_this.getChildProps());
        return _this.props.renderReady();
      }
      return _react2.default.createElement(
        'div',
        null,
        'Ready to Sign...'
      );
    };

    _this.renderInitialSigning = function () {
      var renderInitSigning = _this.props.renderInitSigning;

      if (renderInitSigning) {
        return renderInitSigning(_this.getChildProps());
      }
      return _react2.default.createElement(
        'div',
        null,
        'Ready to Sign...'
      );
    };

    _this.state = {
      error: false,
      ready: false,
      showAddresses: false,
      trezor: {},
      loading: true
    };
    _this.handleSignTransaction = _this.handleSignTransaction.bind(_this);
    _this.handleSignMessage = _this.handleSignMessage.bind(_this);
    // this.getTrezor = this.getTrezor.bind(this);
    _this.ethTrezor = _trezorConnect2.default;
    return _this;
  }

  _createClass(TrezorReactContainer, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var wallet = this.state.trezor.wallet;
      var getAddresses = this.props.getAddresses;

      _trezorConnect2.default.manifest({
        email: 'rbanate@digixglobal.com',
        appUrl: 'https://digix.global'
      });

      if (!wallet && getAddresses) {
        this.getTrezorWallet();
      }
      this.setState({
        showAddresses: false,
        loading: false,
        error: undefined,
        trezor: _trezorConnect2.default
      });
    }

    // getTrezor = () => new TrezorConnect();

  }, {
    key: 'getDefaultPubKey',
    value: function getDefaultPubKey() {
      var _ref2 = this.props || {},
          expect = _ref2.expect;

      var _ref3 = expect || {},
          kdPath = _ref3.kdPath;

      return _trezorConnect2.default.getPublicKey({
        path: kdPath || _constants.DEFAULT_KD_PATH + '0',
        coin: 'eth'
      });
    }
  }, {
    key: 'handleSignTransaction',
    value: function handleSignTransaction(kdPath, txData) {
      // if (!this.ethTrezor) this.ethTrezor = this.getTrezor();
      return (0, _signing.signTransaction)(_trezorConnect2.default, kdPath, txData);
    }
  }, {
    key: 'handleSignMessage',
    value: function handleSignMessage(kdPath, txData) {
      // if (!this.ethTrezor) this.ethTrezor = this.getTrezor();
      return (0, _signing.signMessage)(_trezorConnect2.default, kdPath, txData);
    }
  }, {
    key: 'handleVerifyMessage',
    value: function handleVerifyMessage(kdPath, txData) {
      var ethTrezor = this.ethTrezor;

      return (0, _signing.verifyMessage)(ethTrezor, kdPath, txData);
    }
  }, {
    key: 'handleGetAddress',
    value: function handleGetAddress(kdPath) {
      var ethTrezor = this.ethTrezor;

      return (0, _signing.getAddress)(ethTrezor, kdPath);
    }
  }, {
    key: 'render',
    value: function render() {
      var _state = this.state,
          error = _state.error,
          showAddresses = _state.showAddresses,
          loading = _state.loading;
      var _props = this.props,
          signing = _props.signing,
          signed = _props.signed,
          realoadPubKey = _props.realoadPubKey,
          renderInitSigning = _props.renderInitSigning;

      if (loading) return this.renderLoading();

      if (realoadPubKey) return this.realoadPubKey();

      if (showAddresses) return this.renderAddresses();

      if (!signed && renderInitSigning && !signing) return this.renderInitialSigning();

      if (!signed && (this.props.renderReady || signing)) return this.renderSigningReady();

      if (error) return this.renderError();

      return null;
    }
  }]);

  return TrezorReactContainer;
}(_react.Component);

exports.default = TrezorReactContainer;


TrezorReactContainer.propTypes = {
  renderReady: _propTypes2.default.func,
  getAddresses: _propTypes2.default.func,
  renderLoading: _propTypes2.default.func,
  renderError: _propTypes2.default.func,
  onReady: _propTypes2.default.func,
  signing: _propTypes2.default.bool,
  signed: _propTypes2.default.bool,
  realoadPubKey: _propTypes2.default.bool,
  onError: _propTypes2.default.func,
  onSuccess: _propTypes2.default.func,
  renderInitSigning: _propTypes2.default.func,
  expect: _propTypes2.default.shape({
    kdPath: _propTypes2.default.string,
    address: _propTypes2.default.string
  })
};