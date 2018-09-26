<template>
  <div class="">
    <!-- Modal Component -->
    <b-modal ref="modalConfirm" 
             :id="modalId || 'modal-prompt'"
             class="modal-platform"
             size="sm"
             centered
             no-close-on-backdrop>
      <template slot="modal-header">
        <div style="width: 100%">
          <b-row>
            <!-- <b-col><span v-html="modalTitle()"></span></b-col> -->
            <b-col><span>{{message}}</span></b-col>
          </b-row>
          <div>
            <input type="text" 
                   placeholder="Enter here" 
                   class="input" 
                   v-model="promptInput"
                   @keypress.enter="onConfirm"/>
            <p v-if="message2"
               class="text-info message2" style="margin-bottom:10px;">{{message2}}</p>
            <!-- <div v-if="promptInputError"
                 class="text-danger">&nbsp;invalid mixer username</div> -->
            <div v-if="promptInputError"
                 class="text-danger">&nbsp;{{promptInputErrorMessage}}</div>
          </div>
        </div>
      </template>
      <div>
        
        <!-- <br>
        <br> -->
      </div>

      <template slot="modal-footer" class="text-left">
          <button v-if="!processing"
                  type="button" 
                  class="modal-button" 
                  @click="dismiss"
                  :disabled="processing">{{cancelLabel}}</button>
          <button type="submit"
                  class="modal-button"
                  @click="onConfirm"
                  :disabled="processing"
                  :class="{ 'highlight': !processing }">{{ processing ? 'loading ..' : okLabel}}</button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import _ from "lodash";
import HostingRegions from "./hostingRegions";

export default {
  name: "PromptModal",
  props: ["modalId", "message", "message2", "errorMessage", "okText", "cancelText"],
  mounted () {
    this.okLabel = this.okText || 'Yes' 
    this.cancelLabel = this.cancelText || 'No' 
    this.promptInputErrorMessage = this.errorMessage || 'invalid input'
  },
  data() {
    return {
      processing: false,
      okLabel: null,
      cancelLabel: null,
      promptInput: '',
      promptInputError: null,
      promptInputErrorMessage: null
    };
  },
  methods: {
    onConfirm() {
      this.promptInputError = false

      if (!this.promptInput) {
        this.promptInputError = true
        return
      }

      this.processing = true
      this.$emit("modal-prompt", this.promptInput, (err) => {
        this.processing = false

        if (err) {
          this.promptInputError = true
          return
        }

        this.dismiss();
      });
      // this.dismiss();
    },
    dismiss() {
      this.$refs.modalConfirm.hide();
      // lazy clear
      setTimeout(() => {
        this.processing = false;
        this.promptInput = ''
        this.promptInputError = false
      }, 1000);
    }
  },
  components: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.modal-button {
  border: none;
  padding: 7px 30px;
  font-size: 15.5px;
  color: #f7f7f7;
  background-color: transparent;
  text-transform: capitalize;
  font-size: 13.5px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border-radius: 50px;
  outline: none;
}
.modal-button:hover {
  background-color: rgb(13, 15, 61);
}
.modal-button:active {
  background-color: rgb(13, 15, 50);
}
.modal-button.highlight {
  background-color: #ab3147;
}
.modal-button.highlight:hover {
  background-color: #8d1d32;
}
.field-container {
  width: 100%;
  padding: 10px 0;
}
.field-container:last-of-type {
  border-bottom: none;
}
.label {
  font-size: 12px;
  opacity: 0.65;
  text-transform: capitalize;
}
.message2 {
  font-size: 12.5px;
}
.input {
  display: block;
  width: 100%;
  height: auto !important;
  margin: 7px 0 7px 0;
  padding: 10px 14px;
  color: #ffffff;
  background-color: #010329;
  border: none;
  border-radius: 2px;
}
.input:focus {
  background-color: rgba(1, 3, 41, 0.47);
}
</style>
