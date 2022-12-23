import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/neon-animation/neon-animations.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-a11y-keys/iron-a11y-keys.js';
import '@neogrup/nc-keyboard/nc-keyboard.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { AppLocalizeBehavior } from '@polymer/app-localize-behavior/app-localize-behavior.js';

class NcSimpleDialog extends mixinBehaviors([AppLocalizeBehavior], PolymerElement) {
  static get template() {
    return html`
      <style>
        :host{
          --paper-dialog-width: 400px;
        }

        paper-dialog {
          width: var(--paper-dialog-width);
        }

        @media (min-width: 1660px) {
          paper-dialog {
            max-width: 1460px;
          }
        }

        .content{
          margin-top: 0px;
        }

        div.content > div.content-numeric {
          @apply --layout-horizontal;
          @apply --layout-center;
          @apply --layout-center-justified;
        }

        div.content > div.content-numeric > div.numeric {
          width: 140px;
        }

        div.content > div.content-numeric > div.numeric > paper-input{
          --paper-input-container-input: {
            text-align: center;
            font-size: var(--paper-dialog-font-size);
          };
          --paper-input-suffix: {
            font-size: var(--paper-dialog-font-size);
          };
        }

        div.content > div.content-check {
          @apply --layout-horizontal;
          @apply --layout-center;
          @apply --layout-center-justified;
          margin-top: 20px;
          font-size: var(--paper-dialog-font-size);
        }

        paper-input{
          --paper-input-container-input: {
            font-size: var(--paper-dialog-font-size);
          };
          --paper-input-suffix: {
            font-size: var(--paper-dialog-font-size);
          };
          
        }
        
        .header {
          margin-top: 0px;
          @apply --layout-horizontal;
          @apply --layout-center;
        }

        iron-icon {
          margin-right: 12px;
          width: var(--paper-dialog-icon-size);
          height: var(--paper-dialog-icon-size);
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

        paper-button.delete:not([disabled]){
          background-color: var(--error-color);
        }

        paper-button.accept:not([disabled]){
          background-color: var(--success-color);
        }

        iron-a11y-keys{
          margin: 0px;
          padding: 0px;
        }
      </style>

      <paper-dialog id="simpleDialog" class="modalNoApp" modal dialog>
        <iron-a11y-keys id="a11ySignIn" keys="enter" on-keys-pressed="_accept"></iron-a11y-keys>
        <div class="header">
          <iron-icon icon="{{dialogIcon}}"></iron-icon><h3>{{localize(dialogTitle)}}</h3>
        </div>
        <div class="content">
          <div class="content-text">
            <paper-input id="textInput" hidden$="[[hideTextInput]]" type="text" value="{{formData.textValue}}" required="[[inputRequired]]" error-message="{{localize('INPUT_ERROR_REQUIRED')}}" on-focused-changed="_focusChanged" on-value-changed="_valueChanged"></paper-input>
          </div>

          <div class="content-email">
            <paper-input id="emailInput" hidden$="[[hideEmailInput]]" type="email" value="{{formData.emailValue}}" required="[[inputRequired]]" error-message="{{localize('INPUT_ERROR_INVALID_EMAIL')}}" on-focused-changed="_focusChanged" on-value-changed="_valueChanged"></paper-input>
          </div>
          
          <div class="content-numeric">
            <template is="dom-if" if="{{showNumberInput}}">
              <div class="numeric">
                <template is="dom-if" if="{{!dialogCanBypassInputMax}}">              
                  <paper-input id="numberInput" hidden$="[[hideNumberInput]]" type="number" step="[[dialogInputStep]]" min="[[dialogInputMin]]" max="[[dialogInputMax]]" value="{{formData.numberValue}}" required error-message="{{localize('INPUT_ERROR_INVALID_VALUE')}}" on-focused-changed="_focusChanged" on-value-changed="_valueChanged"></paper-input>
                </template>
                <template is="dom-if" if="{{dialogCanBypassInputMax}}">              
                  <paper-input id="numberInput" hidden$="[[hideNumberInput]]" type="number" step="[[dialogInputStep]]" min="[[dialogInputMin]]" value="{{formData.numberValue}}" required error-message="{{localize('INPUT_ERROR_INVALID_VALUE')}}" on-focused-changed="_focusChanged" on-value-changed="_valueChanged"></paper-input>
                </template>
              <div>              
            </template>
            
            <template is="dom-if" if="{{showNumberInputKeyboard}}">
              <div class="numeric">
                <paper-input id="numberInputKeyboard" hidden$="[[hideNumberInputKeyboard]]" type="text" value="{{formData.numberValue}}" required error-message="{{localize('INPUT_ERROR_INVALID_VALUE')}}" on-focused-changed="_focusChanged" on-value-changed="_valueChanged"></paper-input>
                
              </div>
            </template>
            
          </div>
          <div class="content-check">
            <template is="dom-if" if="{{showCanBypassInputMax}}">
              <paper-checkbox checked="{{byPassMaxCustomers}}" >{{localize('INPUT_QUANTITY_IGNORE')}}</paper-checkbox>
            </template>
          </div>
        </div>
        <div class="content-keyboard">
          <nc-keyboard
            keyboard-enabled="{{showKeyboard}}"
            keyboard-embedded='S'
            keyboard-type="{{keyboardType}}"
            value="{{keyboardValue}}"
            keyboard-current-input="{{keyboardCurrentInput}}">
          </nc-keyboard>
        </div>
        <div class="buttons">
          <paper-button raised on-tap="_close" class="delete" hidden\$="[[dialogCloseButtonDisabled]]">{{localize('BUTTON_CLOSE')}}</paper-button>
          <paper-button raised on-tap="_accept" class="accept">{{localize('BUTTON_ACCEPT')}}</paper-button>
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
      hideTextInput: {
        type: Boolean,
        value: false
      },
      hideEmailInput: {
        type: Boolean,
        value: true
      },
      hideNumberInput: {
        type: Boolean,
        value: true
      },
      hideNumberInputKeyboard: {
        type: Boolean,
        value: true
      },
      dialogInputType: String,
      dialogInputStep: {
        type: Number,
        value: 1
      },
      dialogInputMin: {
        type: Number,
        value: 1
      },
      dialogInputMax: {
        type: Number,
        value: 9999
      },
      dialogCanBypassInputMax: {
        type: Boolean,
        value: false
      },
      byPassMaxCustomers: {
        type: Boolean,
        value: false
      },
      showCanBypassInputMax: {
        type: Boolean,
        value: false
      },
      byPassMaxCustomers: {
        type: Boolean,
        value: false
      },
      dialogInputValue: String,
      dialogCloseButtonDisabled: {
        type: Boolean,
        value: false
      },
      // Product, ticket, etc.
      dialogDataAux: {
        type: Object,
        value: {}
      },
      inputRequired: {
        type: Boolean,
        value: true
      },
      dialogInputNotRequired: {
        type: Boolean,
        value: false
      },
      showKeyboard: {
        type: String,
      },
      showNumberInput: {
        type: Boolean,
        value: false
      },
      showNumberInputKeyboard: {
        type: Boolean,
        value: false
      },
      keyboardValue: {
        type: String,
        observer: '_keyboardValueChanged'
      },
      keyboardType: {
        type: String,
        value: 'keyboard'
      },
      keyboardCurrentInput: {
        type: Object
      },
      viewMode: {
        type: String,
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.useKeyIfMissing = true;
    this.loadResources(this.resolveUrl(this.urlTranslate));
    this.dialogCanBypassInputMax = false; // because initalization does not work
  }

  open(){
    this.$.simpleDialog.open();
    let paperDialogWidth = "400px";
    this.$.textInput.invalid = false;
    this.$.emailInput.invalid = false;
    this.formData = {};
    this.keyboardValue = "";
    this.currentInput = "";
    this.keyboardCurrentInput = {};

    if (this.dialogInputNotRequired){
      this.inputRequired = false;
    } else{
      this.inputRequired = true;
    }

    switch (this.dialogInputType) {
      case 'number':
        this.hideTextInput = true;
        this.hideEmailInput = true;
        this.set('keyboardType', 'keyboardNumeric');

        if (this.showKeyboard == "S") {
          this.currentInput = "numberInputKeyboard"
          this.hideNumberInput = true;
          this.hideNumberInputKeyboard = false;
          this.showNumberInput = false;
          this.showNumberInputKeyboard = true;
          if (this.shadowRoot.querySelector("#numberInputKeyboard")) {
            this.shadowRoot.querySelector("#numberInputKeyboard").invalid = false;
          }
        } else {
          this.currentInput = "numberInput"
          this.hideNumberInput = false;
          this.hideNumberInputKeyboard = true;
          this.showNumberInput = true;
          this.showNumberInputKeyboard = false;
          if (this.shadowRoot.querySelector("#numberInput")) {
            this.shadowRoot.querySelector("#numberInput").invalid = false;
          }
          // Default values
          if (!this.dialogInputStep){
            this.dialogInputStep = 1;
          }
          
          if (!this.dialogInputMin){
            if (this.dialogInputMin !== 0){
              this.dialogInputMin = 1;
            }
          }
          
          if (!this.dialogInputMax){
            if (this.dialogInputMax !== 0){
              this.dialogInputMax = 9999;
            }
          }
        }

        if (this.viewMode === 'KIOSK'){
          paperDialogWidth = "70%";
        }

        if (this.dialogInputValue) {
          this.set('formData.numberValue', this.dialogInputValue);
          this.set('keyboardValue', this.dialogInputValue);
        } 
        break;
    
      case 'email':
        this.hideTextInput = true;
        this.hideEmailInput = false;
        this.hideNumberInput = true;
        this.hideNumberInputKeyboard = true;
        this.currentInput = "emailInput"
        this.set('keyboardType', 'keyboard');
        if (this.dialogInputValue) {
          this.set('formData.emailValue', this.dialogInputValue);
          this.set('keyboardValue', this.dialogInputValue);
        }
        if (this.showKeyboard == "S") {
          paperDialogWidth = "95%";
        }
        if (this.viewMode === 'KIOSK'){
          paperDialogWidth = "95%";
        }
        break;

      default:
        this.hideTextInput = false;
        this.hideEmailInput = true;
        this.hideNumberInput = true;
        this.hideNumberInputKeyboard = true;
        this.currentInput = "textInput"
        this.set('keyboardType', 'keyboard');
        if (this.dialogInputValue) {
          this.set('formData.textValue', this.dialogInputValue);
          this.set('keyboardValue', this.dialogInputValue);
        }
        if (this.showKeyboard == "S") {
          paperDialogWidth = "95%";
        }
        if (this.viewMode === 'KIOSK'){
          paperDialogWidth = "95%";
        }
        break;
    }

    this._setFocusDebouncer = Debouncer.debounce(this._setFocusDebouncer,
      timeOut.after(500),
      () => this._setFocus()
    );

    this.updateStyles({
      '--paper-dialog-width':  paperDialogWidth,
    });
  }

  _keyboardValueChanged(){
    let input;
    input = this.shadowRoot.querySelector("#" + this.currentInput);

    if (input){
      this.keyboardCurrentInput = input;
      input.value = this.keyboardValue;
    }
  }

  _focusChanged(e){
    if (e.detail.value == true){
      this.currentInput = e.target.id;
      
      let input;
      input = this.shadowRoot.querySelector("#" + this.currentInput);
      if (input){
        this.keyboardCurrentInput = input;
        this.keyboardValue = input.value;
      }
    }
  }

  _valueChanged(e){
    this.keyboardValue = e.detail.value;

    if (this.showKeyboard == "S") {
      this._setFocus();
    }
  }

  _setFocus(){
    let input;
    input = this.shadowRoot.querySelector("#" + this.currentInput);
    
    if (input){
      this.keyboardCurrentInput = input;
      if (!input.focused){
        input.focus();
        input.inputElement.inputElement.select();
      }
    }
  }

  _accept(){
    if (this._validate()) {
      this.$.simpleDialog.close();

      let formDataValue;
      switch (this.dialogInputType) {
        case 'number':
          formDataValue = this.formData.numberValue;
          formDataValue = formDataValue.toString().replace(',','.');
          break;
        case 'email':
          formDataValue = this.formData.emailValue;
          break;
        default:
          formDataValue = this.formData.textValue;
          break;
      }


      this.dispatchEvent(new CustomEvent('accepted', {detail: {value: formDataValue, origin: this.dialogOrigin, group: this.dialogGroup, dataAux: this.dialogDataAux}, bubbles: true, composed: true }));
    }
  }

  _close(){
    this.$.simpleDialog.close();
    this.dispatchEvent(new CustomEvent('closed', {detail: {value: '', origin: this.dialogOrigin, group: this.dialogGroup, dataAux: this.dialogDataAux}, bubbles: true, composed: true }));
  }

  _validate(){
    let input;
    let inputInvalid = false;

    input = this.shadowRoot.querySelector("#" + this.currentInput);

    if (input === undefined) { // In this case the control does not exists (programming error), so, do validate to allow exit
      return !inputInvalid;
    }

    input.validate();
    
    if (input.invalid === true){
      inputInvalid = true;
      this._setFocus();
    } else {
      switch (this.dialogInputType) {
        case 'number':
          if (this.showKeyboard == "S") {
            if (isNaN(this.formData.numberValue)){
              input.invalid=true;
              inputInvalid = true;
              this._setFocus();
            }
          }
          if (!this.byPassMaxCustomers) {
            if (parseInt(this.dialogInputMax) < parseInt(this.formData.numberValue)) {
              input.invalid=true;
              inputInvalid = true;
              this.showCanBypassInputMax = true;
              this._setFocus();
            }
          } else {
            this.byPassMaxCustomers = false; //set again as not valid for the next check
            this.showCanBypassInputMax = false;
          }
          break;
        case 'email':
          if (input.value){
            let mailformat = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            if(!input.value.match(mailformat)){
              input.invalid=true;
              inputInvalid = true;
              this._setFocus();
            }
          }
          break;
        default:
          break;
      }
      
    }

    return !inputInvalid;
  }

}

window.customElements.define('nc-simple-dialog', NcSimpleDialog);
