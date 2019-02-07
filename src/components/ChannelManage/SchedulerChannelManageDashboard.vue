<template>
  <div>
    <div class="content-container">
        <b-row>
          <b-col cols="7">

            <div>
            
              <div v-if="!streamPlatforms.length" 
                  class="placeholder">
                No Platforms yet
                <p style="font-size:14px;">Lets add a platform to get started</p>
                <b-button variant="danger"
                          v-b-modal.modal-add-platform>Add Publish Platform</b-button>
              </div>
              <b-row v-else>
                <b-col>
                  <div class="subtitle">Published Platforms</div>
                </b-col>
                <b-col class="text-right">
                  <b-button variant="danger"
                            v-b-modal.modal-add-platform>Add Platform</b-button>
                  <!-- master toggle control -->
                  <span class="toggle-control toggle-control-master"
                        :class="{ 
                          enabled: groupToggleState,
                          'status-processing': groupToggleProcessing
                        }"
                        @click="toggleGroupStatus">
                        <!-- 'status-processing': !isAlive() || groupToggleProcessing -->
                    <i class="fa"
                      :class="{
                        'fa-toggle-on': groupToggleState,
                        'fa-toggle-off': !groupToggleState
                      }"></i>
                  </span>
                </b-col>
              </b-row>

            </div>
            
            <div class="platform-list">
              <!-- <b-col> -->
                <!-- <div v-for="(platform) in stream.platforms" -->
                <div v-for="(platform) in streamPlatforms"
                       :key="platform._id"
                       class="platform-item">
                  <div v-if="platform.removing" class="platform-item-overlay">
                    <b-progress :value="100" 
                                :max="100" 
                                animated
                                class="w-25 h-25"></b-progress>
                  </div>
                  <b-row>
                    <b-col cols="8">
                      <div class="platform-icon">
                        <a target="_blank" :href="platform.serviceChannelUrl">
                          <i v-if="isCustomPlatform(platform)" :class="getPlatformIcon(platform)"></i>
                          <img v-else :src="getPlatformIcon(platform)" />
                        </a>
                      </div>
                      <div class="platform-name">
                        <!-- <input v-if="platform.template == 'custom'" -->
                        <input v-model="platform.editorName"
                               @change="onPlatformNameChange(platform)"
                               class="name" />

                        <div class="platform-server">{{getPlatformPushDestination(platform)}}</div>
                        <div v-if="platform.linkedServiceCreds" 
                             class="platform-verified-badge"
                             style="margin-top:4px;">
                             <i class="fa fa-check-circle"></i> linked
                        </div>
                        <br>
                        <a v-if="platform.serviceChannelUrl"
                          :href="platform.serviceChannelUrl"
                          target="_blank"
                          class="channel-link-btn">
                          <span>video link</span>
                        </a>
                        
                      </div>
                    </b-col>
                    <b-col class="text-right">

                      <!-- <div v-if="isAlive() && platform.enabled" class="inline-block" style="margin:8px 16px 0 0"> -->
                      <div v-if="streamAlive && platform.enabled" class="inline-block" style="margin:8px 16px 0 0">
                        <!-- <code v-if="isPlatformConnected(platform)"
                              class="platform-connect-status online">connected</code>
                        <code v-else class="platform-connect-status">connecting..</code> -->
                        <code v-if="platform.connected"
                              class="platform-connect-status online">connected</code>
                        <code v-else class="platform-connect-status">connecting..</code>
                      </div>

                      <span class="platform-button toggle-control fas"
                            v-bind:class="{ 'fa-toggle-on enabled': platform.enabled, 
                                            'fa-toggle-off': !platform.enabled,
                                            'status-processing': platform.statusProcessing }"
                            @click="togglePlatformStatus(platform)"></span>
                      
                      <span class="platform-button fa fa-cog"
                            @click="togglePlatformConfiguration(platform)"></span>
                      
                      <span class="platform-button fa fa-trash-alt" 
                            style="margin-right:15px;font-size:16px;"
                            @click="requestPlatformDelete(platform)"></span>
                     </b-col>
                   </b-row>
                   <div v-if="platform.serviceMeta && platform.serviceMetaEditor" class="platform-meta-container">

                     <div class="head-toggle">
                       
                       <code @click="toggleMetaEditor(platform)">
                         {{ platform.metaContianerVisible ? 'Hide' : 'Show' }} Metadata
                       </code>

                     </div>
                     <b-collapse v-model="platform.metaContianerVisible" :id="platform._id">
                       
                       <div v-if="hasMetaProp('title', platform)" class="meta-row">
                         <div class="meta-key">stream title</div>
                         <div>
                          <input v-model="platform.serviceMetaEditor.form.title" 
                                 :disabled="platform.serviceMetaEditor.formProcessing.title"
                                 @change="onMetaPropChange('title', platform)"
                                 class="platform-meta title" />
                          <!-- <button v-show="canSaveMetadataProp('title', platform)" -->
                          <button v-if="platform.serviceMetaEditor.changes.title"
                                  @click="saveMetaProp('title', platform)"
                                  :disabled="platform.serviceMetaEditor.formProcessing.title"
                                  type="submit"
                                  class="modal-button modal-button-sm bordered"
                                  style="margin-left:5px;">
                                  {{ platform.serviceMetaEditor.formProcessing.title ? 'Saving ..' : 'Save' }}
                          </button>
                         </div>
                       </div>

                        <div v-if="hasMetaProp('description', platform)" class="meta-row">
                          <div class="meta-key">description</div>
                          <div>
                            <input v-model="platform.serviceMetaEditor.form.description" 
                                   @change="onMetaPropChange('description', platform)"
                                   class="platform-meta desc" />
                            <!-- <button v-show="canSaveMetadataProp('description', platform)" -->
                            <button v-if="platform.serviceMetaEditor.changes.description"
                                    @click="saveMetaProp('description', platform)"
                                    :disabled="platform.serviceMetaEditor.formProcessing.description"
                                    type="submit"
                                    class="modal-button modal-button-sm bordered"
                                    style="margin-left:5px;">
                             {{ platform.serviceMetaEditor.formProcessing.description ? 'Saving ..' : 'Save' }}
                            </button>
                          </div>
                        </div>

                        <div v-if="hasMetaProp('game', platform)" class="meta-row">
                          <div class="meta-key">game</div>
                          <div>
                            <input v-model="platform.serviceMetaEditor.form.game"
                                   @change="onMetaPropChange('game', platform)"
                                   class="platform-meta game" />
                            <!-- <button v-show="canSaveMetadataProp('game', platform)" -->
                            <button v-if="platform.serviceMetaEditor.changes.game"
                                    @click="saveMetaProp('game', platform)"
                                    :disabled="platform.serviceMetaEditor.formProcessing.game"
                                    type="submit"
                                    class="modal-button modal-button-sm bordered"
                                    style="margin-left:5px;">
                             {{ platform.serviceMetaEditor.formProcessing.game ? 'Saving ..' : 'Save' }}
                            </button>
                          </div>
                        </div>

                     </b-collapse>

                   </div>
                 </div>
            </div>

          </b-col>
          <b-col class="preveiw-container">
            <div class="video-wrapper">
              <div v-if="!stream.enabled" class="video-thumb placeholder">
                <p class="text-center">
                  Disabled Stream<br>
                  <span style="font-size:13px;opacity:0.7;">( Please enable )</span>
                </p>
              </div>
              <div v-else-if="!streamAlive" class="video-thumb placeholder">
                <p>No stream</p>
              </div>

              <stream-player v-else :stream="stream" class="video-thumb" />

            </div>
          </b-col>
        </b-row>
    </div>

    <add-platform-modal :stream="stream" 
                         @platform-saved="onNewPlatform"></add-platform-modal>

    <configure-platform-modal :stream="stream"
                              :platform="configurablePlatform" 
                              @platform-updated="onPlatformUpdated"></configure-platform-modal>

    <confirm-modal modal-id="platform-delete-confirm"
                   message="Would you like to remove selected publish platform"
                   @modal-confirm="onPlatformDeleteConfirm(configurablePlatform)"></confirm-modal>

    <confirm-modal modal-id="modal-sub-upgrade"
                   message="This feature is only available in our paid subscriptions"
                   okText="Upgrade now"
                   cancelText="No thanks"
                   @modal-confirm="navigatePaymentsPage"></confirm-modal>

  </div>
</template>

<script>
import Vue from 'vue'
import StreamService from "@/services/StreamService";
import UserService from "@/services/UserService";
import SubscriptionService from "@/services/SubscriptionService";
import IntegrationService from "@/services/IntegrationService";
import StreamThumb from "@/components/StreamThumb.vue";
import StreamPlayer from "@/components/StreamPlayer.vue";

import PromptModal from "@/components/PromptModal.vue";
import AlertModal  from "@/components/AlertModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import AddPlatformModal from "./AddPlatformModal.vue";
import ConfigurePlatformModal from "./ConfigurePlatformModal.vue";
import platformConfigurations from "./platformConfigurations";
import utils from "@/utils";

const SourceTypes = {
  Pull: "pull",
  Publish: "publish",
  Webcam: "webcam",
};

export default {
  name: "ScheduledChannelManage",
  props: ['stream', 'streamAlive', 'mediaPulse'],
  beforeRouteLeave (to, from, next) {
    next()
  },
  async mounted() {
    // event tracking
    window.trackEvent(this.stream.name + " - Stream Dashboard Page", this.stream);

    // get stream details
    await this.setupStream();
  },
  watch: {
    mediaPulse () {
      this.onMediaPulseChanged()
    }
  },
  data() {
    return {
      SourceTypes,
      userSubscription: null,
      processing: true,
      processingMessage: null,
      streamId: null,
      streamPlatforms: [],
      groupToggleProcessing: false,
      groupToggleState: false,
      windowHeight: 0,
      configurablePlatform: {},
      isCustomPlatform(platform) {
        return platform.template === "custom";
      },
      isPlatformConnected(platform) {
        const { mediaPulse } = this;
        if (!mediaPulse || !mediaPulse.pushStreams) return;

        const platformPushUrl = this.getPlatformPushUrl(platform);
        const pushStats = _.find(mediaPulse.pushStreams, {
          stream: platformPushUrl
        });
        const hasBytes = pushStats && pushStats.bytes > 0;

        return hasBytes;
      },
      getPlatformIcon(platform) {
        return this.isCustomPlatform(platform)
          ? "fa fa-cog"
          : platformConfigurations.getPlatformIcon(platform.template);
      },
      getPlatformPushDestination(platform) {
        if (!platform.server) return;

        const maxLen = 40;
        let dest = platform.server;
        if (dest.length > maxLen) dest = dest.substr(0, maxLen) + " ..";

        return dest;
      }
    }
  },
  methods: {
    async saveSchedulerConfig () {
      this.schedulerConfigProcessing = true
      try {
        await StreamService.saveStreamScheduleSettings(this.stream._id, this.scheduleMode, new Date(this.scheduledDateTime))

        let updatedConfig = { mode: this.scheduleMode }
        if (this.scheduleMode === 'datetime')
          updatedConfig.datetime = this.scheduledDateTime

        this.savedSchedulerConfig = updatedConfig

      } catch(e) { 
        this.$notify({ group: 'error', text: 'Could not update scheduler settings' })
        console.log(e) 
      }

      this.schedulerConfigProcessing = false
    },
    clipboardCopy (text) {
      try {
        if (text instanceof Function) 
          text = text()

        this.$copyText(text);
        this.$notify({ group: "info", text: "Copied to clipboard" });
      } catch (e) {}
    },
    onMediaPulseChanged () {
      const platforms = []
      _.each(this.streamPlatforms, (platform, index) => {
        const platformPushUrl = this.getPlatformPushUrl(platform)
        const connectStatus = computePlatformStatus(platformPushUrl, this.mediaPulse)
        if (platform.connected === connectStatus) return

        // platform.connected = connectStatus
        const pchanges = _.assign({}, platform, { connected: connectStatus })
        this.$set(this.streamPlatforms, index, pchanges)
        // this.streamPlatforms.$set(index, pchanges)
        // platforms.push(pchanges)
        // this.streamPlatforms[index] = platform
      })

      // this.streamPlatforms = platforms
      this.$emit('stream-updated', { platforms: this.streamPlatforms })
    },
    navigatePaymentsPage() {
      this.$router.push({ path: "/subscribe?action=upgrade" });
    },
    async setupStream() {
      // get stream details
      try {
        const {stream} = this
        this.stream = stream;
        this.streamId = this.stream._id;
        this.streamPlatforms = _.map(this.stream.platforms, _.cloneDeep)

        // normalize data
        _.each(this.streamPlatforms, this.setupStreamPlatform);

        this.computeGroupToggleState();
      
      } catch (err) {
        // redirect to stream list
        this.$router.push({ name: "ChannelList" });
        this.$notify({ group: "error", title: err.error, text: err.message });
      }
    },
    setupStreamPlatform (platform) {
      platform.editorName = platform.name;
      if (platform.serviceMeta)
        platform.serviceMetaEditor = {
          formProcessing: _.mapValues(platform.serviceMeta, () => false),
          form: _.assign({}, platform.serviceMeta),
          changes: {}
        }
    },
    async onPlatformNameChange(platform) {
      const newName = platform.editorName;
      if (platform.name === newName) return;

      // try changing stream name
      try {
        await StreamService.setStreamPlatformName(
          this.streamId,
          platform._id,
          newName
        );
      } catch (err) {
        platform.editorName = platform.name;
        
        // let platforms = _.cloneDeep(this.stream.platforms);
        // this.stream.platforms = platforms;
        let platforms = _.cloneDeep(this.streamPlatforms);
        this.streamPlatforms = platforms;

        this.$notify({
          group: "error",
          title: "Couldn't change platform name",
          text: err.message
        });
      }
    },
    toggleMetaEditor (platform) {
      platform.metaContianerVisible = !platform.metaContianerVisible
    },
    canSaveMetadataProp (propname, platform) {
      if (!propname || !platform) return
      return platform.serviceMetaEditor.form[propname] !== platform.serviceMeta[propname]
    },
    onMetaPropChange (propname, platform) {
      if (!propname || !platform) return
      const hasChanged = platform.serviceMetaEditor.form[propname] !== platform.serviceMeta[propname]
      platform.serviceMetaEditor.changes[propname] = hasChanged

      const pindex = _.findIndex(this.streamPlatforms, { _id: platform._id })
      this.streamPlatforms = utils.updateArrayItem(this.streamPlatforms, platform, pindex)
      // this.streamPlatforms = _.concat(
      //   this.streamPlatforms.slice(0,pindex),
      //   [platform],
      //   this.streamPlatforms.slice(pindex+1),
      // )
      
    },
    hasMetaProp (propname, platform) {
      if (!propname || !platform) return
      return propname in platform.serviceMetaEditor.form
    },
    async saveMetaProp (propname, platform) {
      if (!propname || !platform) return
      const pindex = this.streamPlatforms.indexOf(platform)
      
      const newValue = platform.serviceMetaEditor.form[propname]
      platform.serviceMetaEditor.formProcessing[propname] = true

      this.streamPlatforms = utils.updateArrayItem(this.streamPlatforms, platform, pindex)

      try {
        await IntegrationService.updateIntegrationMetadata(
          platform.linkedServiceCreds, 
          platform.serviceMetaEditor.form)

          // update parent model
        this.$emit('stream-updated', { platforms: this.streamPlatforms })

      } catch (e) {
        this.$notify({ group: "error", text: "could not update stream metadata" });
      }

      platform.serviceMetaEditor.formProcessing[propname] = false
      platform.serviceMetaEditor.form
      // save changes
      platform.serviceMeta = _.assign({}, platform.serviceMeta, {[propname]: newValue})
      platform.serviceMetaEditor.changes[propname] = false

      this.streamPlatforms = utils.updateArrayItem(this.streamPlatforms, platform, pindex)
    },
    computeGroupToggleState() {
      // const { platforms } = this.stream;
      const platforms = this.streamPlatforms;
      const platformCount = _.size(platforms);
      const enabledPlatformCount = _.size(_.filter(platforms, p => p.enabled));

      this.groupToggleState = enabledPlatformCount > platformCount / 2;
    },
    getTrackType(track) {
      if (!track) return;

      let type;
      if (/^a/gi.test(track.id)) type = "audio";
      else if (/^v/gi.test(track.id)) type = "video";

      return type;
    },
    onNewPlatform(platform) {
      platform.editorName = platform.name;
      this.setupStreamPlatform(platform)
      // this.stream.platforms = [...this.stream.platforms, platform];
      this.streamPlatforms = [...this.streamPlatforms, platform];

      // update parent model
      this.$emit('stream-updated', { platforms: this.streamPlatforms })

      // track event
      window.trackEvent(
        `Added ${platform.name} platform in stream ${this.stream.name}`,
        platform
      );

      this.computeGroupToggleState();
    },
    onPlatformUpdated(platform, updates) {
      platform.server = updates.server;
      platform.streamKey = updates.streamKey;

      // update parent model
      this.$emit('stream-updated', { platforms: this.streamPlatforms })
    },
    toggleGroupStatus() {
      // if (!this.isAlive()) return

      const ostate = this.groupToggleState;
      const nstate = !ostate;

      this.groupToggleProcessing = true;

      _toggle.call(this, 0, () => {
        // compute group toggle state
        this.computeGroupToggleState();
        this.groupToggleProcessing = false;
      });

      async function _toggle(index, cb) {
        // const { platforms } = this.stream;
        const platforms = this.streamPlatforms;

        const platform = platforms[index];
        if (!platform) {
          return cb();
        }

        await this.togglePlatformStatus(platform, nstate, true);
        _toggle.call(this, ++index, cb);
      }
    },
    async togglePlatformStatus(platform, forceState, groupToggleReq) {
      // if (!this.isAlive() && !platform.enabled) return

      const oldStatus = platform.enabled;
      const newStatus = forceState !== undefined ? forceState : !oldStatus;

      if (oldStatus === newStatus) return;

      platform.statusProcessing = true;

      try {
        await StreamService.toggleStreamPlatform(
          this.streamId,
          platform._id,
          forceState
        );
        
        platform.enabled = newStatus;

        // update parent model
        this.$emit('stream-updated', { platforms: this.streamPlatforms })

        // track event
        window.trackEvent(
          `${newStatus ? "Enabled" : "Disabled"} ${_.capitalize(
            platform.name
          )} platform in stream ${this.stream.name}`,
          platform
        );

        if (!groupToggleReq) {
          this.computeGroupToggleState();
        }
      } catch (err) {
        platform.enabled = oldStatus;
        this.$notify({
          group: "error",
          title: "Couldn't toggle platform status",
          text: err.message
        });
      }

      platform.statusProcessing = false;
    },
    togglePlatformConfiguration(platform) {
      if (platform.linkedServiceCreds) {
        window.alert(
          `Platform is connected to ${
            platform.template
          } account and can not be edited but can be toggled or deleted`
        );
        return;
      }

      this.configurablePlatform = platform;
      this.$root.$emit("bv::show::modal", "modal-configure-platform");
    },
    getPlatformPushUrl(platform) {
      if (!platform) return;
      return `${platform.server}/${platform.key}`;
    },
    requestPlatformDelete(platform) {
      this.configurablePlatform = platform;
      this.$root.$emit("bv::show::modal", "platform-delete-confirm");
    },
    async onPlatformDeleteConfirm() {
      const platform = this.configurablePlatform;
      platform.removing = true;

      // try deleting stream platform
      try {
        await StreamService.deleteStreamPlatform(this.streamId, platform._id);

        // popout platform object
        const platforms = this.streamPlatforms;
        const index = platforms.indexOf(this.configurablePlatform);
        // this.stream.platforms = _.concat(
        //   platforms.slice(0, index),
        //   platforms.slice(index + 1)
        // );
        this.streamPlatforms = _.concat(
          platforms.slice(0, index),
          platforms.slice(index + 1)
        );

        // update parent model
        this.$emit('stream-updated', { platforms: this.streamPlatforms })

        this.computeGroupToggleState();

        // track event
        window.trackEvent(
          `Deleted ${platform.name} platform in stream ${this.stream.name}`,
          platform
        );
      } catch (err) {
        this.$notify({
          group: "error",
          title: "Couldn't delete publish platform",
          text: err.message
        });
        platform.removing = false;
      }
    }
  },
  components: {
    AddPlatformModal,
    ConfigurePlatformModal,
    ConfirmModal,
    AlertModal,
    StreamThumb,
    StreamPlayer,
    PromptModal
  }
};

function computePlatformStatus(platformPushUrl, mediaPulse) {
  let connected = false
  if (!mediaPulse || !mediaPulse.pushStreams) return connected

  const pushStats = _.find(mediaPulse.pushStreams, { stream: platformPushUrl });
  connected = pushStats && pushStats.bytes > 0;

  return connected || false
}

function promisify (func) {
  return new Promise((resolve) => {
    func.call(0, resolve)
  })
}

function isValidUrl (url) {
  return /^(http|https|ftp|ftps|hls|rtsp|rtmp|mpegts)\:\/\//gi.test(url)
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
  font-size: 16px;
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
  /* padding: 0 10px 0 20px; */
  padding: 0 10px 0 10px;
}
.video-wrapper {
  width: 100%;
  height: 275px;
  background-color: #000000;
  position: relative;
}
.video-wrapper.webcam-wrapper {
  background-color: transparent;
}
.placeholder {
  font-size: 21px;
  opacity: 0.75;
  margin: 15px 0;
}
.source-switch-container {
  /* margin-top: 20px; */
  /* display: inline-block; */
  /* margin-bottom: 20px; */
  float: right;
  clear: both
}

.field-container {
  /* width: 235px; */
  width: 100%;
  padding: 10px 0;
  position: relative;
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
  background-color: #202940;
  border: none;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);
  outline-color: #0074fc;
  line-height: 17px;
}
.input:focus {
  background-color: rgba(18, 23, 37, 0.67);
}
.platform-list {
  margin: 15px 0;
}
.platform-item {
  position: relative;
  padding: 18px 6px;
  /* border-bottom: 1px solid rgb(17, 19, 64); */
  margin-bottom: 8px;
  /* background: #040634; */
  background: #202940;
  border-radius: 2px;
  border: none;
  padding-left: 20px;
  padding-right: 20px;
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
   margin-left: 110px;
}
.platform-meta-container .head-toggle {
  font-size: 13.5px;
  padding: 5px 0;
  text-transform: capitalize;
  letter-spacing: 0;
}
.platform-meta-container .head-toggle > *{
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
  border-bottom-color: rgba(255,0,0,0.40);
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
.toggle-control.status-processing {
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

.field-container .badge-button {
  opacity: 0;
  font-size:11px;
  padding: 4px 9px;
  position: absolute;
  right: 10px;
  top: 46px;
  pointer-events: none;
  transition: all 0.15s linear;
}
.field-container:hover .badge-button {
  opacity:1;
  pointer-events: inherit;
}
.field-container-sm .badge-button {
  top: 8px;
}

</style>
<style>
.datetime-input{
  display: block;
  width: 100%;
  height: auto !important;
  margin: 10px 0 10px 0;
  padding: 10px 14px;
  color: #ffffff;
  /* background-color: #010329; */
  background-color: #202940;
  border: none;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);
  outline-color: #0074fc;
  cursor: pointer;
  line-height: 17px;
}
.datetime-input:focus {
  background-color: rgba(18, 23, 37, 0.67);
}
</style>