<template>
  <div>
    <div class="content-container">

      <div class="feature-item">
        <div class="feature-control">
          <span class="toggle-control"
                :class="{ enabled: features.ga.enabled }"
                @click="toggleFeature('ga')">
            <i class="fa"
               :class="{
                 'fa-toggle-on enabled': features.ga.enabled,
                 'fa-toggle-off': !features.ga.enabled,
                 'status-processing': featureProcessing.ga,
               }"></i>
          </span>
        </div>
        <div class="feature-desc">
          <div>Enable Google Analytics</div>
          <div v-if="features.ga.enabled" class="pane">
            <span>GA ID</span>
            <input class="input" 
                   v-model="features.ga.value"
                   placeholder="UA-00000.." />
            <button class="btn btn-primary"
                    :disabled="!features.ga.value"
                    @click="savePlayerGAId">
                {{ featureProcessing.ga ? 'saving ..' : 'save' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="feature-item">
        <div class="feature-control">
          <span class="toggle-control"
                :class="{ enabled: features.embedRewind.enabled }"
                @click="toggleFeature('embedRewind')">
            <i class="fa"
               :class="{
                 'fa-toggle-on': features.embedRewind.enabled,
                 'fa-toggle-off': !features.embedRewind.enabled,
                 'status-processing': featureProcessing.embedRewind,
               }"></i>
          </span>
        </div>
        <div class="feature-desc">
          Enable Embed Player Rewind
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-control">
          <span class="toggle-control"
                :class="{ enabled: features.abr.enabled }"
                @click="toggleFeature('abr')">
            <i class="fa"
               :class="{
                 'fa-toggle-on enabled': features.abr.enabled,
                 'fa-toggle-off': !features.abr.enabled,
                 'status-processing': featureProcessing.abr
               }"></i>
          </span>
        </div>
        <div class="feature-desc">
          Enable Multi-Bitrate Transcoding
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-desc">
          <div>Chat Embed Snippet</div>
          <div class="pane">
                <input class="input" 
                       :value="chatEmbedIframeSnippet"
                       readonly
                       style="width:500px;margin-left:0;"/>
                &nbsp;
                <button class="modal-button modal-button-sm highlight badge-button"
                        @click="clipboardCopy(chatEmbedIframeSnippet)">Copy</button>
          </div>
        </div>
      </div>

      <div class="feature-item">
        <!-- <div class="feature-control">
           <span class="toggle-control"
                :class="{ enabled: features.embedPoster.enabled }"
                @click="toggleFeature('embedPoster')">
            <i class="fa"
               :class="{
                 'fa-toggle-on enabled': features.embedPoster.enabled,
                 'fa-toggle-off': !features.embedPoster.enabled,
                 'status-processing': featureProcessing.embedPoster
               }"></i>
          </span>
        </div> -->
        <div class="feature-desc">
          <div>Custom Embed Poster</div>
          <div class="pane">
            <div v-if="posterUrl" 
                 class="poster-thumb-wrapper">
              <img :src="posterUrl" class="poster-thumb" />
            </div>
            
            <span class="hidden">Image File</span>
            <input type="file"
                   id="embed-poster-input"
                   class="input hidden" 
                   @change="onEmbedPosterPreview"
                   placeholder="UA-00000.." />

            <button v-if="!embedPosterTemp"
                    class="btn btn-danger"
                    :disabled="featureProcessing.embedPoster"
                    @click="hitUpload"
                    style="margin:0;">
              <span v-if="features.embedPoster.value">Change</span>
              <span v-else>Select Poster</span>
            </button>
            
            <button v-if="embedPosterTemp"
                    class="btn btn-success"
                    :disabled="featureProcessing.embedPoster"
                    @click="saveEmbedPoster"
                    style="margin:0;">
              <!-- <span v-if="features.embedPoster.value">Save Poster</span> -->
              <span>
                {{ featureProcessing.embedPoster ? 'Saving ..' : 'Save Poster' }}
              </span>
            </button>
            
            <button v-if="embedPosterTemp || features.embedPoster.value"
                    class="btn btn-link"
                    :disabled="featureProcessing.embedPoster"
                    @click="cancelUpload">
              <span v-if="embedPosterTemp && features.embedPoster.value">Restore</span>
              <span v-else-if="embedPosterTemp">Cancel</span>
              <span v-else>Remove</span>
            </button>

            <!-- <div v-else class="inline-block">
              <div v-if="features.embedPoster.value" 
                  class="inline-block">
                <button class="btn btn-primary"
                        @click="saveEmbedPoster">
                        {{ featureProcessing.embedPoster ? 'saving ..' :  'save' }}</button>
            </div> -->


            <!-- <button v-if="features.embedPoster.value"
                    class="btn btn-link"
                    :disabled="featureProcessing.embedPoster"
                    @click="removePoster">Remove</button> -->
            <div v-show="features.embedPoster.error"
                 class="alert alert-danger"
                 style="margin-top:10px;">{{features.embedPoster.error}}</div>
          </div>
        </div>
      </div>
      
    </div>

    <confirm-modal modal-id="platform-delete-confirm"
                   message="Would you like to remove selected publish platform"
                   @modal-confirm="onPlatformDeleteConfirm(configurablePlatform)"></confirm-modal>
    

     <alert-modal modal-id="alert-mixer-pull"
                  message="Mixer pull is not available in this region. Please use any regions in the US and it will not impact the quality of the stream"
                  okText="Got it"></alert-modal>

    <confirm-modal modal-id="feature-upgrade"
                   message="Please upgrade your subscription plan to access this feature"
                   okText="Upgrade Now"
                   cancelText="Later"
                   @modal-confirm="navigateToBilling()"></confirm-modal>
  </div>
</template>

<script>
import Vue from "vue";
import StreamService from "@/services/StreamService";
import UserService from "@/services/UserService";
import SubscriptionService from "@/services/SubscriptionService";
import IntegrationService from "@/services/IntegrationService";

import PromptModal from "@/components/PromptModal.vue";
import AlertModal from "@/components/AlertModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import utils from "@/utils";

export default {
  name: "LiveChannelManageSettings",
  props: ["stream", "streamAlive", "mediaPulse"],
  async mounted() {
    // event tracking
    window.trackEvent(
      this.stream.name + " - Live Stream Settings Page",
      this.stream
    );
  },
  watch: {
    mediaPulse() {
      this.onMediaPulseChanged();
    }
  },
  data() {
    return {
      processing: true,
      processingMessage: null,
      streamId: null,
      userSubscription: null,
      streamMeta: {},
      features: {
        ga: { 
          enabled: false, 
          value: null,
          valueType: 'string'
        },
        chatEnabled: { 
          enabled: false,
          valueType: 'bool' 
        },
        embedRewind: { 
          enabled: false,
          valueType: 'bool' 
        },
        abr: { 
          enabled: false,
          valueType: 'bool' 
        },
        embedPoster: { 
          error: false,
          enabled: false,
          value: null,
          valueType: 'string',
        },
      },
      featureProcessing: {
        ga: false,
        abr: false,
        chatEnabled: false,
        embedRewind: false,
        embedPoster: false,
      },
      embedPosterTemp: null
    };
  },
  async mounted () {
    this.streamId = this.stream._id

    const meta = await StreamService.getStreamMetadata(this.streamId)
    _.forIn(meta, (value, key) => {
      if (value && key in this.features) {
        this.features[key].enabled = true
        if(value.constructor !== Boolean) {
          this.features[key].value = value
        }
      }
    })

    // console.log('stream meta', meta)
  },
  computed: {
    chatEmbedUrl () {
      if (this.stream)
        return `https://voice.castr.io/chat/${this.stream.key}`
    },
    chatEmbedIframeSnippet () {
      let chatUrl = this.chatEmbedUrl
      if (chatUrl)
      return `<iframe src="${chatUrl}" width="350" height="500" frameborder="0" scrolling="no" allow="autoplay" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>`
    },
    posterUrl () {
      if (this.embedPosterTemp)
        return this.embedPosterTemp

      const imageId = this.features.embedPoster.value
      if (!imageId) return

      return `https://static.castr.io/embedPosters/${imageId}`
    }
  },
  methods: {
    clipboardCopy (text) {
      try {
        if (text instanceof Function) 
          text = text()

        this.$copyText(text);
        this.$notify({ group: "info", text: "Copied to clipboard" });
      } catch (e) {}
    },
    navigateToBilling () {
      // /manage/billing?category=live
      this.$router.push({ name: 'Payments', query: { category: 'live', action: 'upgrade' } })
      // this.$root.$emit('bv::show::modal', 'feature-upgrade')
    },
    async toggleFeature(featureName) {
      if (this.featureProcessing[featureName]) return
      
      const feature = this.features[featureName]
      if (!feature) return

      if (featureName === 'abr') {
        if (window.Intercom)
          window.Intercom('show')
        return
      }
      
      // ignore if chat toggled
      if (featureName === 'chatEnabled') {
        this.features.chatEnabled.enabled = !feature.enabled
        return
      }

      if (featureName === 'embedRewind' && !this.stream.dvrHours) {
        // window.alertt('not available in trial pack')
        this.$root.$emit('bv::show::modal', 'feature-upgrade')
        return
      }
      
      const nstate = !feature.enabled
      feature.enabled = nstate
      
      if (feature.valueType === 'bool' || !nstate) {
        await this.saveSetting(featureName, nstate)
      }

    },
    async savePlayerGAId () {
      var gaId = this.features.ga.value
      if(!gaId) return

      await this.saveSetting('ga', gaId)
    },
    hitUpload () {
      document.querySelector('#embed-poster-input').click()
    },
    onEmbedPosterPreview () {
      let imageInput = document.querySelector('#embed-poster-input')
      let imageFile = imageInput.files[0]
      if (!imageFile) return

      imageReader(imageFile, (base64) => {
        this.embedPosterTemp = base64
      })
    },
    async saveEmbedPoster (event) {
      this.features.embedPoster.error = false

      let imageInput = document.querySelector('#embed-poster-input')
      let imageFile = imageInput.files[0]
      
      if (!imageInput.value || !imageFile) {
        this.features.embedPoster.error = 'please pick an image file'
        return
      }

      this.featureProcessing.embedPoster = true
      
      // -- upload reuqest --
      const fdata = new FormData()
      fdata.append('file', imageFile)
      const fdataConfig = {
        headers: {
          'content-type': 'multipart/form-data'
        }
      }

      const res = await StreamService.uploadStreamPoster(this.streamId, fdata)
      if (res.success) {
        this.embedPosterTemp = null
        this.features.embedPoster.value = res.uploadId
        this.$notify({ group: 'success', text: 'Poster uploaded with success' })
      } else {
        this.features.embedPoster.error = 'could not handle image upload. Please try again later'
      }
      // -- upload reuqest ends --

      this.featureProcessing.embedPoster = false
    },
    async cancelUpload () {
      if (this.embedPosterTemp) {
        this.embedPosterTemp = null
        document.querySelector('#embed-poster-input').value = null
        return
      }

      this.removePoster()
      
    },
    async removePoster () {
      try {
        await this.saveSetting('embedPoster', null)
        this.features.embedPoster.value = null
      } catch (e) {
        console.log(e)
      }
    },
    onMediaPulseChanged() {},
    async saveSetting (key, value) {
      this.featureProcessing[key]=true
      try {
        const nmeta = await StreamService.saveStreamMetadata(this.streamId, key, value)
        console.log('new meta', nmeta)
      } catch (e) {
        this.$notify({ group: 'error', text: 'could not save changes' })
      }
      this.featureProcessing[key]=false
    }
  },
  components: {
    ConfirmModal,
    AlertModal,
    PromptModal
  }
};

function imageReader(file, cb) {
  if (!file) {
    return;
  }

  var reader = new FileReader();
  reader.onload = function() {
    if (cb) {
      cb(reader.result);
    }
  };

  reader.readAsDataURL(file);
}

function promisify(func) {
  return new Promise(resolve => {
    func.call(0, resolve);
  });
}

function flushBlobUrl(blob) {
  if (blob) {
    window.URL.revokeObjectURL(blob);
  }
}

function isValidUrl(url) {
  return /^(http|https|ftp|ftps|hls|rtsp|rtmp|mpegts)\:\/\//gi.test(url);
}

function isMixerFTLSource(pullUrl) {
  // return /^https?\:\/\/(www\.)?mixer\.com/gi.test(pullUrl)
  return /^https?\:\/\/((\w+)\.)?mixer\.com/gi.test(pullUrl);
}

function isRTSPSource(pullUrl) {
  return /^rtsp?\:\/\//gi.test(pullUrl);
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.view-wrapper {
  color: #f7f7f7;
  margin-top: 40px;
}
.title {
  padding: 5px 0;
  font-size: 20px;
}
.title input {
  margin: 0;
  padding: 2px 3px;
  color: inherit;
  background-color: transparent;
  border: none;
  width: auto;
  display: inline-block;
  transition: all 0.2s ease-in-out;
  border-radius: 2px;
}
.title input:hover {
  background-color: #17193e;
}
.title input:focus {
  /* background-color: #17193e; */
  outline-color: #ffffff;
}
.subtitle {
  padding: 5px 0;
  font-size: 15px;
}
.content-container {
  padding: 20px 0 40px 0;
}
.media-codec {
  font-size: 11.5px;
  margin-right: 4px;
  padding: 2px 7px 1px 7px;
  min-width: 25px;
  text-align: center;
  display: inline-block;
  background-color: dodgerblue;
  color: #ffffff;
  border-radius: 3px;
  text-transform: uppercase;
}
.media-codec.audio {
  background-color: #f33483;
}
.page-menu {
  margin: 10px 0 15px 0;
}
.preveiw-container {
  padding: 0 10px 0 20px;
}
.video-wrapper {
  width: 100%;
  height: 220px;
  background-color: #000000;
  position: relative;
}
.placeholder {
  font-size: 21px;
  opacity: 0.75;
  margin: 15px 0;
}
.source-switch-container {
  margin-top: 16px;
  margin-right: 15px;
  float: right;
  clear: both;
}

.field-container {
  /* width: 235px; */
  width: 100%;
  padding: 10px 0;
  position: relative;
}
.field-container-sm {
  padding: 0;
}
.field-container:last-of-type {
  border-bottom: none;
}
.label {
  font-size: 12px;
  opacity: 0.65;
  text-transform: capitalize;
}
.input {
  display: block;
  width: 100%;
  height: auto !important;
  margin: 10px 0 10px 0;
  padding: 10px 14px;
  color: #ffffff;
  /* background-color: #010329; */
  background-color: #17193e;
  border: none;
  border-radius: 2px;
}
.input:focus {
  background-color: rgba(1, 3, 41, 0.47);
}
.input:read-only:focus {
  background-color: #17193e;
}
.field-container-sm .input {
  margin-top: 0;
}
.field-container .badge-button {
  opacity: 0;
  font-size: 11px;
  padding: 4px 9px;
  position: absolute;
  right: 10px;
  top: 46px;
  pointer-events: none;
  transition: all 0.15s linear;
}
.field-container:hover .badge-button {
  opacity: 1;
  pointer-events: inherit;
}
.field-container-sm .badge-button {
  top: 8px;
}
.platform-list {
  margin: 15px 0;
}
.platform-item {
  position: relative;
  padding: 12px 20px;
  padding-bottom: 16px;
  margin-bottom: 8px;
  background: #040634;
  border-radius: 2px;
  border: none;
}
.platform-item:last-of-type {
  border-bottom: none;
}
.platform-item-overlay {
  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  padding: 35px 0 0 0;
  padding-left: 44%;
  box-sizing: border-box;
  /* background-color: rgba(0,0,0,0.65); */
  background-color: rgba(24, 28, 99, 0.5);
  z-index: 99;
}
.platform-icon {
  display: inline-block;
  font-size: 24px;
  /* padding-top: 7px; */
  margin-right: 10px;
  width: 95px;
  text-align: center;
}
.platform-icon img {
  max-width: 80%;
  max-height: 26px;
  filter: grayscale(1);
}
.platform-name {
  display: inline-block;
  font-size: 14.5px;
  text-transform: capitalize;
  font-weight: 600;
  vertical-align: top;
}
.platform-connect-status {
  font-size: 12px;
  font-weight: 400;
  color: gray;
}
.platform-connect-status.online {
  color: #1dd240;
}
.platform-name .name {
  border: 1px solid;
  padding: 3px 5px;
  background-color: transparent;
  color: #ffffff;
  border: none;
}
.platform-name .name:hover {
  background-color: #17193e;
}
.platform-name .name:focus {
  background-color: #17193e;
  outline-color: #ffffff;
}
.channel-link-btn {
  font-size: 11.5px;
  font-weight: 400;
  color: rgb(193, 209, 245);
  text-transform: lowercase;
}
.platform-meta-container {
  font-size: 13px;
  font-weight: 400;
  margin-top: 6px;
  /* margin-left: 110px; */
}
.platform-meta-container .head-toggle {
  font-size: 13.5px;
  padding: 5px 0;
  text-transform: capitalize;
  letter-spacing: 0;
}
.platform-meta-container .head-toggle > * {
  cursor: pointer;
}
.platform-meta-container .meta-row {
  margin-top: 10px;
}
.platform-meta-container .meta-key {
  margin-top: 10px;
  margin-bottom: 5px;
  /* margin-left: 10px; */
  color: gray;
  font-size: 12.5px;
  text-transform: lowercase;
}

.platform-meta-container input.platform-meta {
  /* background-color: #17193e; */
  background-color: transparent;
  color: #ffffff;
  border: none;
  font-size: 13px;
  width: 320px;
  border: 1px solid transparent;
  border-bottom-color: rgba(255, 0, 0, 0.4);
  padding: 8px 2px;
}
.platform-meta-container input.platform-meta:hover {
  background-color: #17193e;
}
.platform-meta-container input.platform-meta:focus {
  background-color: #17193e;
  outline-color: #0075ff;
  border-bottom-color: transparent;
}

.platform-server {
  font-size: 13px;
  color: #74769f;
  font-weight: 400;
  text-transform: none;
}
.platform-verified-badge {
  font-size: 12px;
  border-radius: 50px;
  color: #199d19;
  display: inline-block;
  text-transform: lowercase;
}
.platform-button {
  float: right;
  color: #ffffff;
  font-size: 18px;
  margin-top: 10px;
  transition: all 0.2s linear;
  cursor: pointer;
}
.platform-button:hover {
  opacity: 0.65;
}
.toggle-control-master {
  font-size: 24px;
  margin: 0 18px 0 0;
  display: inline-block;
  vertical-align: middle;
}
.toggle-control {
  /* margin: 15px 0 0 5px; */
  margin-left: 15px;
}
.toggle-control:hover {
  opacity: 1;
}
.toggle-control.enabled {
  /* color: #3d9bff; */
  color: greenyellow;
}
.status-processing {
  cursor: not-allowed;
  opacity: 0.65;
  color: #ffffff;
}
.video-thumb {
  width: inherit;
  height: 100%;
  background-size: 100% auto;
  background-position: center center;
}
.video-thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  position: absolute;
}
.field-container .toggle-control {
  color: #ffffff;
  font-size: 16.5px;
  margin: 0 0 0 5px;
}
.toggle-control.enabled {
  color: #02ffa2;
}
.feature-item {
  padding: 24px 20px;
  background-color: #040634;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
}
.feature-item > div {
  display: inline-block;
}
.feature-item .feature-control {
  font-size: 15px;
  margin-right: 20px;
  width: 14px;
  vertical-align: top;
}
.feature-control .toggle-control {
  margin: 0;
  cursor: pointer;
}
.feature-item .feature-desc {
  font-size: 13.5px;
}
.feature-desc .pane {
  padding: 15px 0 10px 0;
  font-size: 13px;
  color: #c5c5c5;
}
.feature-item .input {
  margin:0;
  margin-left: 8px;
  display: inline-block;
  width: unset;
  padding: 8px 12px;
}
.feature-item .btn {
  padding: 4px 10px;
  margin-left: 8px;
  text-transform: capitalize;
}
.toggle-control.enabled {
  color: #02ffa2;
}
.poster-thumb-wrapper {
  margin-bottom: 20px;
}
.poster-thumb {
  display: inline-block;
  width: 196px;
  border: 1px solid #010329; 
}
</style>
