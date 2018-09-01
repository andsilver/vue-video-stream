<template>
  <div class="">
    <!-- Modal Component -->
    <b-modal ref="modalAddDiscord" 
             id="modal-add-discord"
             class="modal-platform"
             size="lg"
             centered
             no-close-on-esc
             no-close-on-backdrop>
      <template slot="modal-header">
        <div class="container" style="margin-top:10px">
          <button class="btn btn-sm btn-link btn-close"
                  :disabled="webhookVerificationProcessing"
                  @click="closeModal">CLOSE</button>

          <b-row class="steps-container">
            <b-col offset="2" cols="4" 
                   class="step-item"
                   :class="{active: stage===0}"
                   @click="setStep(0)">
              <div class="step-count">1</div>
              <div class="step-title">Setup Discord Webhook</div>
            </b-col>
            <b-col cols="4"
                   class="step-item"
                   :class="{active: stage===1}"
                   @click="setStep(1)">
              <div class="step-count">2</div>
              <div class="step-title">Integrate With Castr</div>
            </b-col>
          </b-row>
        </div>
      </template>
      <div class="container">
        <br>
        <section v-if="stage==0" style="text-align:center;">
          <div class="view-title">
            Get started with Discord
            <a target="_blank" href="https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks">Article</a>
            on Webhooks</div>
          <p style="margin:10px 0;">
            Once your channel webhook is ready, tap below to begin integration with Castr
          </p>
          <br>
          <button @click="setStep(1, true)"
                  class="btn btn-lg btn-primary btn-variant">
            &nbsp; Continue&nbsp;
            <i class="fas fa-angle-right"></i>
          </button>
        </section>
        
        <section v-if="stage==1" style="text-align:center;">
          <div class="view-title">Paste your Discord Webhook url</div>
          <p style="margin:10px 0;">
            Once you have successfuly created your chanel webhook, tap below to begin integration with Castr
          </p>
          <div>
            <input v-model="channel.channelName"
                  placeholder="#CHANNEL NAME"
                  class="input input-webhook"
                  style="margin:15px 0 3px 0;"
                  @change="onInputChanged('channelName')"
                  autofocus/>
            <p v-show="formErrors.channelName" 
              class="text-danger">specify channel name for convinience</p>
          </div>

          <div>
            <input v-model="channel.webhookURL"
                  class="input input-lg input-webhook" 
                  placeholder="https://discordapp.com/api/webhooks/{channel_id}/{webhook_id}"
                  @change="onInputChanged('webhookURL')"/>
            <p v-show="formErrors.webhookURL" 
              class="text-danger"
              style="margin-bottom:0;">plase specify webhook url for sending chat messages</p>
          </div>

          <br>

          <div>
            <button class="modal-button modal-button-variant2"
                    :class="{highlight: !webhookVerificationProcessing}"
                    @click="requestWebhookVerify">
              &nbsp;
              <span v-if="webhookVerificationProcessing">VERIFYING ..</span>
              <span v-else>SAVE WEBHOOK</span>
              &nbsp;
            </button>
          </div>

          <p v-if="error" 
             class="text-danger" 
             style="margin-top:10px;">{{error && error.message || 'unknown error occured'}}</p>

        </section>
        <br>

      </div>
      <template slot="modal-footer" class="text-left">
        <div></div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import Vue from "vue";
import _ from "lodash";
import platformConfigurations from "./platformConfigurations";
import UserService from "../../services/UserService";
import StreamService from "../../services/StreamService";
import IntegrationService from "../../services/IntegrationService";

const Platforms = platformConfigurations.platforms;
const ModalTitles = ["Select Streaming Platform", ""];
_.each(Platforms, plat => {
  plat.id = _.replace(plat, /\s/gi, "_");
  plat.iconUrl = true;
});

export default {
  name: "DiscordIntegrationModal",
  props: ["stream"],
  mounted() {
    this.$refs.modalAddDiscord.$on("show", this.onInit.bind(this));
  },
  data() {
    return {
      stage: 0,
      processing: false,
      error: null,
      channel: {
        channelName: null,
        webhookURL: null
      },
      webhookVerificationProcessing: false,
      formErrors: {
        channelName: false,
        webhookURL: false
      },
    };
  },
  methods: {
    onInit() {},
    stepBack() {
      this.stage--;

      this.clearErrors();
      this.resetPlatform();
    },
    setStep (stage, bypassValidation) {
      if (this.webhookVerificationProcessing) return

      if (bypassValidation || stage < this.stage)
        this.stage = stage

      // put focus on channel-name input 
      if (stage === 1) {
        const input = document.querySelector('.input-webhook')
        if (input)
          setTimeout(() => input.focus(), 100)
      }
    },
    onInputChanged(propname){
      this.formErrors[propname] = false
    },
    async requestWebhookVerify () {
      if (this.webhookVerificationProcessing) return

      this.error = null
      this.webhookVerificationProcessing = true

      const {channel} = this
      let errorCount=0
      _.each(['channelName', 'webhookURL'], (propname) => {
        if (!channel[propname]) {
          this.formErrors[propname] = true
          errorCount++
        }
      })

      if (errorCount) {
        this.webhookVerificationProcessing = false
        return
      }

      try {
        const newChannel = await IntegrationService.saveDiscordIntegration(this.stream._id, channel)
        this.$emit('new-channel', newChannel)
        this.closeModal()
      } catch (e) {
        this.error = e
      } finally {
        this.webhookVerificationProcessing = false
      }

    },
    closeModal () {
      this.$refs.modalAddDiscord.hide()
      this.error = null
      this.channel = {}
      this.formErrors = {}
      this.webhookVerificationProcessing = false
    }
  },
  components: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
.steps-container {
  /* padding: 10px; */
}
.steps-container .step-item {
  padding: 10px;
  opacity: 0.6;
  cursor: pointer;
}
.steps-container .step-item.active {
  opacity: 1;
}
.steps-container .step-item .step-count {
  font-size: 13.5px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
  background-color: #334ed2;
  padding: 4px 11px;
  text-align: center;
  line-height: 19px;
  border-radius: 200px;
  height: 25px;
  box-sizing: border-box;
  font-weight: 600;
}
.steps-container .step-item .step-title {
  letter-spacing: 0;
  font-size: 13.5px;
  display: inline-block;
  vertical-align: middle;
}
.steps-container .step-item.active .step-count {
  background-color: #1223b3;
}
.view-title {
  font-size: 20px;
  letter-spacing: -0.5px;
}
.btn-variant {
  background-color: #334ed2;
  border-color: #334ed2;
}
.input-webhook {
  font-size: 14px;
  display: inline-block;
  /* margin-bottom: 30px; */
  width: 80%;
  background-color: transparent;
  border-bottom: 1px solid #535377;
}
.btn-close {
  right:25px;
  position:absolute;
}
</style>
