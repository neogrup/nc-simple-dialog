import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/neon-animation/neon-animations.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-a11y-keys/iron-a11y-keys.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { AppLocalizeBehavior } from '@polymer/app-localize-behavior/app-localize-behavior.js';

class NcSimpleDialog extends mixinBehaviors([AppLocalizeBehavior], PolymerElement) {
  static get template() {
    return html`
      <style>
        paper-dialog {
          width: 400px;
        }
        .header {
          @apply --layout-horizontal;
          @apply --layout-center;
        }
        iron-icon {
          margin-right: 12px;
        }
        .buttons {
          @apply --layout-horizontal;
          @apply --layout-center;
        }

        paper-button{
          margin: 10px 5px;
          background-color: var(--app-secondary-color);
          color: white;
        }
      </style>

      <paper-dialog id="simpleDialog" modal entry-animation="scale-up-animation" on-iron-overlay-opened="setFocus">
        <iron-a11y-keys id="a11ySignIn" keys="enter" on-keys-pressed="_accept"></iron-a11y-keys>
        <div class="header">
          <iron-icon icon="{{dialogIcon}}"></iron-icon><h3>{{localize(dialogTitle)}}</h3>
        </div>
        <div class="content">
          <paper-input error-message="{{localize('INPUT_ERROR_REQUIRED')}}" value="{{formData.value}}" required=""></paper-input>
        </div>
        <div class="buttons">
          <paper-button raised="" on-tap="_close" hidden\$="[[dialogCloseButtonDisabled]]">{{localize('BUTTON_CLOSE')}}</paper-button>
          <paper-button raised="" on-tap="_accept">{{localize('BUTTON_ACCEPT')}}</paper-button>
        </div>
      </paper-dialog>
    `;
  }

  static get properties() {
    return {
      language: {
        type: String
      },
      formData: {
        type: Object
      },
      urlTranslate: String,
      dialogGroup: String,
      dialogOrigin: String,
      dialogIcon: String,
      dialogTitle: String,
      dialogCloseButtonDisabled: {
        type: Boolean,
        value: false
      },
      // Product, ticket, etc.
      dialogDataAux: {
        type: Object,
        value: {}
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.useKeyIfMissing = true;
    this.loadResources(this.resolveUrl(this.urlTranslate));
  }

  open(){
    this.$.simpleDialog.open();
    this.formData = {};
  }

  setFocus(){
    this.shadowRoot.querySelector('paper-input').focus();
  }

  _accept(){
    if (this._validate()) {
      this.$.simpleDialog.close();
      this.dispatchEvent(new CustomEvent('accepted', {detail: {value: this.formData.value, origin: this.dialogOrigin, group: this.dialogGroup, dataAux: this.dialogDataAux}, bubbles: true, composed: true }));
    }
  }

  _close(){
    this.$.simpleDialog.close();
    this.dispatchEvent(new CustomEvent('closed', {detail: {value: '', origin: this.dialogOrigin, group: this.dialogGroup, dataAux: this.dialogDataAux}, bubbles: true, composed: true }));
  }

  _validate(){
    let inputs = dom(this.root).querySelectorAll("paper-input,paper-textarea");
    let firstInvalid = false;
    let i;
    for (i = 0; i < inputs.length; i++) {
      inputs[i].validate();
    }
    for (i = 0; i < inputs.length; i++) {
      if (!firstInvalid && inputs[i].invalid===true) {
        inputs[i].focus();
        firstInvalid = true;
      }
    }
    return !firstInvalid;
  }
}

window.customElements.define('nc-simple-dialog', NcSimpleDialog);
