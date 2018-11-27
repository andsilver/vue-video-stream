<template>
  <div>
    <div class="content-container">
        <b-row>
          <b-col class="preveiw-container">
            <div class="video-wrapper">
              <!-- <div v-if="!isAlive()" class="video-thumb placeholder"> -->
              <div v-if="!stream.enabled" class="video-thumb placeholder">
                <p class="text-center">
                  Disabled Camera<br>
                  <span style="font-size:13px;opacity:0.7;">( Please enable )</span>
                </p>
              </div>
              <div v-else-if="!streamAlive" class="video-thumb placeholder">
                <p>No Camera Source</p>
              </div>
              <stream-player v-else :stream="stream" class="video-thumb" />

            </div>
            <br>
            <div>
              <div class="field-container">

                <button class="modal-button modal-button-sm highlight badge-button"
                        @click="clipboardCopy(getStreamIframeCode)">Copy</button>
                <b-row>
                  <b-col><div class="label">Iframe Snippet</div></b-col>
                  <b-col class="text-right">
                    <span class="label">Enable DVR Timeline</span>
                    <span class="fas toggle-control"
                          :class="{ 'fa-toggle-on enabled': dvrEmbedEnabled, 
                                  'fa-toggle-off': !dvrEmbedEnabled }"
                          @click="toggleDvrEmbedStatus"></span>
                  </b-col>
                </b-row>
                <!-- <div class="label">Iframe Snippet</div> -->
                <input class="input"
                       :value="getStreamIframeCode()"
                       readonly/>
              </div>
              <div class="field-container">
                <button class="modal-button modal-button-sm highlight badge-button"
                        @click="clipboardCopy(getStreamEmbedUrl)">Copy</button>
                <div class="label">Embed Url</div>
                <input class="input"
                       :value="getStreamEmbedUrl()"
                       readonly/>
              </div>
              <!-- <div class="field-container">
                <button class="modal-button modal-button-sm highlight badge-button"
                        @click="clipboardCopy(getStreamHlsUrl)">Copy</button>
                <div class="label">HLS Url</div>
                <input class="input"
                       :value="getStreamHlsUrl()"
                       readonly/>
              </div> -->
            </div>
          </b-col>
          <b-col cols="7">

            <div class="ingest-wrapper">
              <div class="field-container" style="padding:0;">
                <div class="label">Deployment Region</div>

                <div class="input">
                  <div style="font-size:15.5px;">
                    <img :src="getRegionFlag()" 
                         :alt="stream.region.name"
                         style="width:20px;" />
                    &nbsp;<span>{{stream.region.name}}</span>
                  </div>
                  <!-- <div style="font-size:13px;margin-top:6px;opacity:0.65;">{{getStreamPushUrl()}}</div> -->
                </div>
                <!-- <div class="input">
                  <div style="">{{getStreamPushUrl()}}</div>
                </div> -->
              </div>
              <div class="field-container field-container-sm">
                <button class="modal-button modal-button-sm highlight badge-button"
                        @click="clipboardCopy(getStreamPushUrl)">Copy</button>
                <div class="input">
                  <div style="">{{getStreamPushUrl()}}</div>
                </div>
              </div>
              <div class="field-container">
                <b-row>
                  <b-col>
                    <div class="label">
                      Camera Source
                    </div>
                  </b-col>
                  <b-col>
                    <div v-if="stream.enabled && stream.pullUrl" class="text-right">
                      <code v-if="streamAlive"
                            class="platform-connect-status"
                            style="color:#1d87d2;">connected</code>
                      <code v-else class="platform-connect-status">connecting..</code>
                    </div>
                  </b-col>
                </b-row>
                <div>
                  <input v-model="streamPullUrl"
                         @keypress="onPullUrlChange()"
                         class="input" 
                         placeholder="rtsp://cams.example.com:554/cam-q953k7"/>
                </div>
              </div>
              <div class="field-container" style="padding-top:0;">
                <div style="margin-right:5px;">
                    <b-button style="margin-right:10px;"
                              variant="primary"
                              @click="setStreamPullUrl"
                              :disabled="!canSavePullUrl() || streamSourceTypeProcessing">
                      <span v-if="streamSourceTypeProcessing">
                        <i class="fas fa-spinner fa-spin"></i>
                      </span>
                      <span v-else>Save</span>
                    </b-button>

                  <div v-if="streamPullError"
                       class="text-danger"
                       style="margin-top:10px;">
                       Invalid camera source url
                       <div v-show="rtspError">Source must get served over <code>rtsp://</code> protocol</div>
                    </div>
                </div>
              </div>
            </div>

            <hr style="border-color:#ffffff24;"/>

            <div style="margin-bottom:25px;"></div>

            <div v-if="!streamPlatforms.length" 
                 class="placeholder">
                 <!-- Ready, Set ... &nbsp;Go! -->
              <p style="font-size:14px;opacity:1;">Add a platform to get started</p>
              <b-button variant="danger"
                        v-b-modal.modal-add-platform>Add Platform</b-button>
            </div>
            <b-row v-else>
              <b-col>
                <div class="subtitle">Published Platforms</div>
              </b-col>
              <b-col class="text-right">
                <b-button variant="danger"
                          v-b-modal.modal-add-platform>Add Platform</b-button>
              </b-col>
            </b-row>
            
            <div class="platform-list">
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
                        <div v-if="platform.serviceChannelUrl">
                          <a :href="platform.serviceChannelUrl"
                             target="_blank"
                             class="channel-link-btn">
                            <span>video link</span>
                          </a>
                        </div>
                        
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

    <confirm-modal modal-id="modal-set-publish-mode"
                    message="Switching to Publish mode will disable your pulled stream"
                    okText="Enable Publish Mode"
                    cancelText="Cancel"
                    @modal-confirm="unsetStreamPullUrl"></confirm-modal>

                   <!-- message="This Feature is not included in current subscription. Please upgrade your subscription " -->
                   <!-- message="Feature is not included in your current subscription. Please upgrade your subscription plan to continue." -->
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
import StreamThumb from "@/components/StreamThumb.vue";
import StreamPlayer from "@/components/StreamPlayer.vue";

import PromptModal from "@/components/PromptModal.vue";
import AlertModal from "@/components/AlertModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import AddPlatformModal from "./AddPlatformModal.vue";
import ConfigurePlatformModal from "./ConfigurePlatformModal.vue";
import platformConfigurations from "./platformConfigurations";
import utils from "@/utils";

const SourceTypes = { Pull: "pull" };

export default {
  name: "ChannelManage",
  props: ["stream", "streamAlive", "mediaPulse"],
  async mounted() {
    // get stream details
    await this.setupStream();
    // event tracking
    window.trackEvent(
      this.stream.name + " - Stream Dashboard Page",
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
      SourceTypes,
      userSubscription: null,
      processing: true,
      processingMessage: null,
      rmptPullUrlProcessing: false,
      streamSourceType: null,
      streamSourceTypeModel: SourceTypes.Pull,
      streamPullUrl: null,
      rtspError: false,
      streamPullError: false,
      streamPullSourceChunksCount: 0,
      pullSourceWorking: true,
      pullSourceStatusTimeoutCtrl: -1,
      streamSourceTypeProcessing: null,
      streamId: null,
      streamFps: null,
      streamPlatforms: [],
      groupToggleProcessing: false,
      groupToggleState: false,
      streamKeyVisible: false,
      streamKeyVisibleTimeout: 0,
      streamKeyVisibleTimeoutCtrl: null,
      windowHeight: 0,
      configurablePlatform: {},
      dvrEmbedEnabled: false,
      hasPullSource() {
        return this.streamSourceType === SourceTypes.Pull;
      },
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
      },
      isSuspiciousPullSource() {
        var suspicious = false;

        if (this.stream.pullUrl) {
        }

        return suspicious;
      }
    };
  },
  computed: {
    streamKey () {
      let streamingKey = ''
      const stream = this.stream
      if (stream) {
        streamingKey = stream.key
      }

      const streamPassword = stream.config && stream.config.password
      if (streamPassword)
        streamingKey += '?password='+streamPassword

      return streamingKey
    }
  },
  methods: {
    navigateToBilling () {
      // /manage/billing?category=live
      this.$router.push({ name: 'Payments', query: { category: 'ipcam', action: 'upgrade' } })
      // this.$root.$emit('bv::show::modal', 'feature-upgrade')
    },
    toggleDvrEmbedStatus () {
      const ostate = this.dvrEmbedEnabled
      const nstate = !ostate

      if (!this.stream.dvrHours) {
        // window.alertt('not available in trial pack')
        this.$root.$emit('bv::show::modal', 'feature-upgrade')
        return
      }

      this.dvrEmbedEnabled = nstate
    },
    clipboardCopy (text) {
      try {
        if (text instanceof Function) 
          text = text()

        this.$copyText(text);
        this.$notify({ group: "info", text: "Copied to clipboard" });
      } catch (e) {}
    },
    onMediaPulseChanged() {
      const platforms = [];
      _.each(this.streamPlatforms, (platform, index) => {
        const platformPushUrl = this.getPlatformPushUrl(platform);
        const connectStatus = computePlatformStatus(
          platformPushUrl,
          this.mediaPulse
        );
        if (platform.connected === connectStatus) return;

        // platform.connected = connectStatus
        const pchanges = _.assign({}, platform, { connected: connectStatus });
        this.$set(this.streamPlatforms, index, pchanges);
        // this.streamPlatforms.$set(index, pchanges)
        // platforms.push(pchanges)
        // this.streamPlatforms[index] = platform
      });

      // this.streamPlatforms = platforms
      this.$emit("stream-updated", { platforms: this.streamPlatforms });
    },
    navigatePaymentsPage() {
      this.$router.push({ path: "/subscribe?action=upgrade" });
    },
    onPullUrlChange() {
      this.streamPullError = false;
    },
    canSavePullUrl() {
      let canSave = false;
      // check for valid input
      const { streamPullUrl } = this;

      if (streamPullUrl) {
        // check if pull remained same
        if (streamPullUrl !== this.stream.pullUrl) canSave = true;
      }

      return canSave;
    },
    async onSourceTypeChange() {
      this.streamSourceType = this.streamSourceTypeModel;

      // check if new mode is `publish`
      if (this.streamSourceType === SourceTypes.Publish) {
        // check if operational mode is `pull`
        const hadPullUrl = this.stream.pullUrl;
        // if (hadPullUrl) this.unsetStreamPullUrl();
        if (hadPullUrl) this.requestPublishPrompt();
      }
    },
    requestPublishPrompt(preventSourceRestore) {
      this.$root.$emit("bv::show::modal", "modal-set-publish-mode");

      if (preventSourceRestore) return;
      setTimeout(() => {
        this.streamSourceType = SourceTypes.Pull;
      });
    },
    setPullSourceStatus() {
      let status = this.streamAlive;
      this.pullSourceWorking = status;

      if (status) {
        const t = setTimeout(this.setPullSourceStatus, 5000);
        this.pullSourceStatusTimeoutCtrl = t;
      }
    },
    async setStreamPullUrl() {
      this.streamPullError = false;

      // setTimeout(() => {
      //   this.streamSourceType = SourceTypes.Publish
      // })

      const pullSource = this.streamPullUrl;

      let validurl = isValidUrl(pullSource)
      let validrtsp = isRTSPSource(pullSource)
      this.rtspError = !validrtsp

      // check if url is valid
      if (!validurl || !validrtsp) {
        this.streamPullError = true;
        return;
      }

      // swtich source mode to specified pull url
      this.streamSourceTypeProcessing = true;

      try {
        await StreamService.setStreamPullUrl(this.streamId, pullSource);
        this.stream.pullUrl = pullSource;
        this.$notify({ group: "success", text: "stream pull url saved" });

        // clearTimeout(this.pullSourceStatusTimeoutCtrl)
        // this.pullSourceWorking = true
        // this.pullSourceStatusTimeoutCtrl = setTimeout(this.setPullSourceStatus, 15000)
      } catch (e) {
        this.$notify({
          group: "error",
          text: "could not save stream pull url"
        });
      }

      this.streamSourceTypeProcessing = false;
    },
    async unsetStreamPullUrl(preventSourceRestore) {
      this.streamSourceTypeProcessing = true;

      try {
        await StreamService.unsetStreamPullUrl(this.streamId);
        this.stream.pullUrl = null;
        this.$notify({ group: "success", text: "Publish mode activated" });

        if (!preventSourceRestore) {
          // change tab to publish
          this.streamSourceType = SourceTypes.Publish;
        }
      } catch (e) {
        if (!preventSourceRestore) {
          this.streamSourceType = SourceTypes.Pull;
        }

        this.$notify({
          group: "error",
          text: "could not switch to Publish mode"
        });
      }

      this.streamSourceTypeProcessing = false;
    },
    async setupStream() {
      // get stream details
      try {
        const { stream } = this;
        this.stream = stream;
        this.streamId = this.stream._id;
        this.streamPlatforms = _.map(this.stream.platforms, _.cloneDeep);

        const hasPullUrl = stream.pullUrl;
        // this.streamSourceType = hasPullUrl ? SourceTypes.Pull : SourceTypes.Publish;
        this.streamSourceTypeModel = hasPullUrl
          ? SourceTypes.Pull
          : SourceTypes.Publish;
        this.onSourceTypeChange();
        if (hasPullUrl) this.streamPullUrl = stream.pullUrl;

        // normalize data
        _.each(this.streamPlatforms, this.setupStreamPlatform);

        this.computeGroupToggleState();
      } catch (err) {
        // redirect to stream list
        this.$router.push({ name: "ChannelList" });
        this.$notify({ group: "error", title: err.error, text: err.message });
      }
    },
    setupStreamPlatform(platform) {
      platform.editorName = platform.name;
      if (platform.serviceMeta)
        platform.serviceMetaEditor = {
          formProcessing: _.mapValues(platform.serviceMeta, () => false),
          form: _.assign({}, platform.serviceMeta),
          changes: {}
        };
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
    toggleMetaEditor(platform) {
      platform.metaContianerVisible = !platform.metaContianerVisible;
    },
    canSaveMetadataProp(propname, platform) {
      if (!propname || !platform) return;
      return (
        platform.serviceMetaEditor.form[propname] !==
        platform.serviceMeta[propname]
      );
    },
    onMetaPropChange(propname, platform) {
      if (!propname || !platform) return;
      const hasChanged =
        platform.serviceMetaEditor.form[propname] !==
        platform.serviceMeta[propname];
      platform.serviceMetaEditor.changes[propname] = hasChanged;

      const pindex = _.findIndex(this.streamPlatforms, { _id: platform._id });
      this.streamPlatforms = utils.updateArrayItem(
        this.streamPlatforms,
        platform,
        pindex
      );
      // this.streamPlatforms = _.concat(
      //   this.streamPlatforms.slice(0,pindex),
      //   [platform],
      //   this.streamPlatforms.slice(pindex+1),
      // )
    },
    hasMetaProp(propname, platform) {
      if (!propname || !platform) return;
      return propname in platform.serviceMetaEditor.form;
    },
    async saveMetaProp(propname, platform) {
      if (!propname || !platform) return;
      const pindex = this.streamPlatforms.indexOf(platform);

      const newValue = platform.serviceMetaEditor.form[propname];
      platform.serviceMetaEditor.formProcessing[propname] = true;

      this.streamPlatforms = utils.updateArrayItem(
        this.streamPlatforms,
        platform,
        pindex
      );

      try {
        await IntegrationService.updateIntegrationMetadata(
          platform.linkedServiceCreds,
          platform.serviceMetaEditor.form
        );

        // update parent model
        this.$emit("stream-updated", { platforms: this.streamPlatforms });
      } catch (e) {
        this.$notify({
          group: "error",
          text: "could not update stream metadata"
        });
      }

      platform.serviceMetaEditor.formProcessing[propname] = false;
      platform.serviceMetaEditor.form;
      // save changes
      platform.serviceMeta = _.assign({}, platform.serviceMeta, {
        [propname]: newValue
      });
      platform.serviceMetaEditor.changes[propname] = false;

      this.streamPlatforms = utils.updateArrayItem(
        this.streamPlatforms,
        platform,
        pindex
      );
    },
    computeGroupToggleState() {
      // const { platforms } = this.stream;
      const platforms = this.streamPlatforms;
      const platformCount = _.size(platforms);
      const enabledPlatformCount = _.size(_.filter(platforms, p => p.enabled));

      this.groupToggleState = enabledPlatformCount > platformCount / 2;
    },
    toggleStreamKeyVisibility() {
      window.clearInterval(this.streamKeyVisibleTimeoutCtrl);
      const newState = !this.streamKeyVisible;
      this.streamKeyVisible = newState;

      if (newState) {
        let timeout = 1000;
        this.streamKeyVisibleTimeout = 19000;
        this.streamKeyVisibleTimeoutCtrl = setInterval(() => {
          this.streamKeyVisibleTimeout -= timeout;
          if (!this.streamKeyVisibleTimeout) this.toggleStreamKeyVisibility();
        }, timeout);

        // track event
        window.trackEvent(`Viewed Stream key in stream ${this.stream.name}`);
      }
    },
    onStreamKeyCopied() {
      this.$notify({ group: "info", text: "Copied to clipboard" });
      // track event
      window.trackEvent(`Copied RTMP pull for stream ${this.stream.name}`);
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
      this.setupStreamPlatform(platform);
      // this.stream.platforms = [...this.stream.platforms, platform];
      this.streamPlatforms = [...this.streamPlatforms, platform];

      // update parent model
      this.$emit("stream-updated", { platforms: this.streamPlatforms });

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
      this.$emit("stream-updated", { platforms: this.streamPlatforms });
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
        this.$emit("stream-updated", { platforms: this.streamPlatforms });

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
    getRegionFlag() {
      return `https://countryflags.io/${
        this.stream.region.identifier
      }/flat/24.png`;
    },
    getStreamPushUrl() {
      const { region } = this.stream;
      // return `rtmp://${this.stream.region.hostname}:1977/static`;
      // return `rtmp://${region.hostname}:${region.rtmpPort}/static`;
      // let pushUrl = `rtmp://${region.hostname}`;
      let pushUrl = `rtmp://${region.hostname}/static`;
      if (region.rtmpPort != 1935) {
        pushUrl += ":" + region.rtmpPort;
      }

      // return pushUrl + '/';
      return pushUrl;
    },
    getStreamHlsUrl() {
      const { region } = this.stream;
      // let hlsUrl = `http://${region.hostname}/${this.stream.key}/index.m3u8`;
      const hostname = region.hostnameCDN || region.hostname
      let hlsUrl = `https://${hostname}/${this.stream.key}/index.m3u8`;
      return hlsUrl;
    },
    getStreamIframeCode() {
      let embedUrl = this.getStreamEmbedUrl();
      let htmlCode = `<iframe src="${embedUrl}" width="590" height="431" frameborder="0" scrolling="no" allow="autoplay" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>`
      return htmlCode;
    },
    getStreamEmbedUrl() {
      // let embedUrl = `https://player.haxr.io/${this.stream.key}`;
      let embedUrl = `https://player.castr.io/${this.stream.key}?`;
      const {hostnameCDN} = this.stream.region || {}
      if (hostnameCDN) {
        let cdnPop = _.replace(hostnameCDN, /\D/g, '')
        embedUrl += `cdnsrc=${cdnPop}&`
      }

      if (this.dvrEmbedEnabled) {
        embedUrl += 'dvr=true'
      }

      return embedUrl;
    },
    getStreamPullUrl(hide) {
      let server = this.getStreamPushUrl();
      if (!/\/$/gi.test(server)) server += "/";

      const pullUrl = server + (hide ? "xxxx" : this.stream.key);

      return pullUrl;
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
        this.$emit("stream-updated", { platforms: this.streamPlatforms });

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
  let connected = false;
  if (!mediaPulse || !mediaPulse.pushStreams) return connected;

  const pushStats = _.find(mediaPulse.pushStreams, { stream: platformPushUrl });
  connected = pushStats && pushStats.bytes > 0;

  return connected || false;
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
  height: 285px;
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
  position:relative;
}
.field-container-sm {
  padding:0;
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
}
.input:focus {
  background-color: rgba(18, 23, 37, 0.67);
}
.input:read-only:focus {
  background-color: rgb(42, 49, 68);
}
.field-container-sm .input {
  margin-top:0;
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
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);
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
  font-size: 16px;
  margin: 0 0 0 5px;
}
.toggle-control.enabled {
  color: #02ffa2;
}
</style>
