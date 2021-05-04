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
          };
        }
        
        .header {
          margin-top: 0px;
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

        paper-button.delete:not([disabled]){
          background-color: var(--error-color);
        }

        paper-button.accept:not([disabled]){
          background-color: var(--success-color);
        }
      </style>

      <paper-dialog id="simpleDialog" modal dialog>
        <iron-a11y-keys id="a11ySignIn" keys="enter" on-keys-pressed="_accept"></iron-a11y-keys>
        <div class="header">
          <iron-icon icon="{{dialogIcon}}"></iron-icon><h3>{{localize(dialogTitle)}}</h3>
        </div>
        <div class="content">
          <div class="content-text">
            <paper-input id="textInput" hidden$="[[hideTextInput]]" type="text" value="{{formData.textValue}}" required="[[inputRequired]]" error-message="{{localize('INPUT_ERROR_REQUIRED')}}" on-focus="_setFocus" on-blur="_setBlur"></paper-input>
          </div>
          
          <div class="content-numeric">
            <template is="dom-if" if="{{showNumberInput}}">
              <div class="numeric">
                <paper-input id="numberInput" hidden$="[[hideNumberInput]]" type="number" step="[[dialogInputStep]]" min="[[dialogInputMin]]" max="[[dialogInputMax]]" value="{{formData.numberValue}}" required error-message="{{localize('INPUT_ERROR_INVALID_VALUE')}}" on-focus="_setFocus" on-blur="_setBlur"></paper-input>
              </div>
            </template>
            
            <template is="dom-if" if="{{showNumberInputKeyboard}}">
              <div class="numeric">
                <paper-input id="numberInputKeyboard" hidden$="[[hideNumberInputKeyboard]]" type="text" value="{{formData.numberValue}}" required error-message="{{localize('INPUT_ERROR_INVALID_VALUE')}}">
              </div>
            </template>
          </div>
        </div>
        <div class="content-keyboard">
          <nc-keyboard
            keyboard-enabled="{{showKeyboard}}"
            keyboard-embedded='S'
            keyboard-type="{{keyboardType}}"
            value="{{keyboardValue}}"
            >
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
    let paperDialogWidth = "400px";
    this.$.textInput.invalid = false;
    this.formData = {};
    this.keyboardValue = "";

    if (this.dialogInputNotRequired){
      this.inputRequired = false;
    } else{
      this.inputRequired = true;
    }

    if (this.dialogInputType == 'number'){
      this.hideTextInput = true;
      this.set('keyboardType', 'keyboardNumeric');

      if (this.showKeyboard == "S") {
        this.hideNumberInput = true;
        this.hideNumberInputKeyboard = false;
      } else {
        this.hideNumberInput = false;
        this.hideNumberInputKeyboard = true;
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

      if (this.dialogInputValue) {
        this.set('formData.numberValue', this.dialogInputValue);
        this.set('keyboardValue', this.dialogInputValue);
      } 
    } else {
      this.hideTextInput = false;
      this.hideNumberInput = true;
      this.hideNumberInputKeyboard = true;
      this.set('keyboardType', 'keyboard');
      if (this.dialogInputValue) {
        this.set('formData.textValue', this.dialogInputValue);
        this.set('keyboardValue', this.dialogInputValue);
      }
      if (this.showKeyboard == "S") {
        paperDialogWidth = "95%";
      }
    }

    if (this.showKeyboard == "S") {
      this.showNumberInput = false;
      this.showNumberInputKeyboard = true;
      if (this.shadowRoot.querySelector("#numberInputKeyboard")) {
        this.shadowRoot.querySelector("#numberInputKeyboard").invalid = false;
      }
    } else {
      this.showNumberInput = true;
      this.showNumberInputKeyboard = false;
      if (this.shadowRoot.querySelector("#numberInput")) {
        this.shadowRoot.querySelector("#numberInput").invalid = false;
      }
      this._setFocusDebouncer = Debouncer.debounce(this._setFocusDebouncer,
        timeOut.after(500),
        () => this.setFocus()
      );
    }
    
    this.updateStyles({
      '--paper-dialog-width':  paperDialogWidth,
    });
  }

  _keyboardValueChanged(){
    if (this.dialogInputType == 'number'){
      this.set('formData.numberValue', this.keyboardValue);
    } else {
      this.set('formData.textValue', this.keyboardValue);
    }
  }

  setFocus(){
    if (this.dialogInputType == 'number'){
      this.shadowRoot.querySelector("#numberInput").focus();
      this.shadowRoot.querySelector("#numberInput").inputElement.inputElement.select();
    } else{
      this.$.textInput.focus();
      this.$.textInput.inputElement.inputElement.select();
    }
  }

  _accept(){
    if (this._validate()) {
      this.$.simpleDialog.close();

      let formDataValue;

      if (this.dialogInputType == 'number'){
        formDataValue = this.formData.numberValue;
        formDataValue = formDataValue.toString().replace(',','.');
      } else {
        formDataValue = this.formData.textValue;
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

    if (this.dialogInputType == 'number'){
      if (this.showKeyboard == "S") {
        input = this.shadowRoot.querySelector("#numberInputKeyboard");
      } else {
        input = this.shadowRoot.querySelector("#numberInput");
      }
    } else{
      input = this.$.textInput;
    }

    input.validate();
    
    if (input.invalid === true){
      if (this.showKeyboard == "N") {
        if (this.dialogInputType == 'number'){
          this.$.numberInput.focus();
          this.$.numberInput.inputElement.inputElement.select();
        } else{
          this.$.textInput.focus();
          this.$.textInput.inputElement.inputElement.select();
        }
      }
      inputInvalid = true;
    } else {
      if ((this.dialogInputType == 'number') && (this.showKeyboard == "S")) {
        if (isNaN(this.formData.numberValue)){
          this.shadowRoot.querySelector("#numberInputKeyboard").invalid=true;
          inputInvalid = true;
        }
      }
    }

    return !inputInvalid;
  }

  _setFocus(){
    this.dispatchEvent(new CustomEvent('inputFocus', {bubbles: true, composed: true }));
  }

  _setBlur(){
    this._debouncer = Debouncer.debounce(this._debouncer,
      timeOut.after(500),
      () => this.dispatchEvent(new CustomEvent('inputBlur', {bubbles: true, composed: true }))
    );
  }
}

window.customElements.define('nc-simple-dialog', NcSimpleDialog);
