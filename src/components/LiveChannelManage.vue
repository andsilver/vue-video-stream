<template>
  <div class="container view-wrapper">
    <div v-if="!processing">
      <div class="row">
        <div class="col-md-3">
          <div class="title">
            <!-- <a class="title-change-placeholder">change</a> -->
            <input v-model="streamName"
                   @change="onStreamNameChange"
                   type="text" 
                   autocomplete="off" 
                   autocorrect="off" 
                   autocapitalize="off" 
                   spellcheck="false"
                   title="Edit stream name">
          </div>
          <router-link to="/dashboard" style="color:inherit;opacity:0.75;">
            <i class="fa fa-caret-left"></i>&nbsp; Go back
          </router-link>
        </div>
        <div class="col-md-9">
          <b-row>
            <b-col cols="3">
              <div class="stat-container">
                <div>
                  <span class="value" :style="{color: streamAlive ? '#2ad640' : 'inherit' }">{{getStreamStatus()}}</span>
                </div>
                <div class="label">status</div>
              </div>
            </b-col>
            <b-col cols="2">
              <div class="stat-container">
                <div v-if="streamAlive">
                  <span class="value">
                    <!-- {{mediaPulse.clients | number}} -->
                    {{clientsCount | number}}
                  </span>
                </div>
                <div v-else><span class="value">..</span></div>
                <div class="label">viewers</div>
              </div>
            </b-col>
            <b-col cols="3">
              <div class="stat-container">
                <div v-if="streamAlive">
                  <span class="value">
                    {{mediaPulse.bitrate | number}}
                    <span style="font-size:16px;">kbps</span>
                  </span>
                </div>
                <div v-else><span class="value">..</span></div>

                <div class="label">bitrate</div>
              </div>
            </b-col>
            <b-col>
              <div class="stat-container">
                <div v-if="streamAlive">
                  <div v-if="streamFps" class="value" style="margin-right:10px;">
                    {{streamFps}}
                    <span style="font-size:16px;">fps</span>
                  </div>
                  <div class="label">codecs</div>
                  <!-- <span class="value">
                    <span v-for="(track, index) in mediaPulse.tracks" 
                          :key="index" 
                          class="media-codec"
                          :class="getTrackType(track)">{{track.codec}}</span>
                  </span> -->
                  
                </div>
                <div v-else><span class="value">..</span></div>

              </div>
            </b-col>
            <b-col cols="1" class="text-right" style="padding-left:0;">
              
              <!-- <button class="head-button"
                      @click="requestStreamDelete">
                <span class="icon far fa-trash-alt"></span>
              </button> -->

              <div>
                <div v-if="statusProcessing"><i class="fas fa-spinner fa-spin"></i></div>
                <div v-else>
                  <button v-if="stream.enabled" 
                    class="btn-status outlined"
                    @click="toggleStatus($event)">disable</button>
                  <button v-else 
                        class="btn-status no-dimm"
                        @click="toggleStatus($event)">enable</button>
                  </div>
                </div>

              <div style="margin-top:8px;">
                <button class="btn-status danger outlined"
                        @click="requestStreamDelete">delete</button>
              </div>
              
              
            </b-col>
          </b-row>

          <b-row v-if="streamAlive">
              <b-col cols="5" class="stat-container xs">
                <div v-if="mediaPulse.alive" class="value">
                  <strong class="text-uppercase">{{getStreamQuality()}}</strong>
                  <span style="margin-left:5px;font-size:14px;">{{mediaPulse.width}} x {{mediaPulse.height}}</span>
                </div>
                <div v-else class="value">..</div>
              </b-col>
              <b-col cols="3" class="stat-container xs">
                <!-- <div class="label">in</div>
                <div class="value">{{ mediaPulse.bytesInTotal | bytes }}</div>
                &nbsp;
                <div class="label">out</div>
                <div class="value">{{ countPushedBytes() | bytes }}</div> -->
              </b-col>
              <b-col class="stat-container xs" style="padding-left:15px;">
                <div class="value">
                    <span v-for="(track, index) in mediaPulse.tracks" 
                          :key="index" 
                          class="media-codec"
                          :class="getTrackType(track)">{{track.codec}}</span>
                </div>
                <!-- <div class="label">uptime</div>
                <div class="value">{{ mediaPulse.lifetime | elapsed }}</div> -->
              </b-col>
            </b-row>
        </div>
      </div>
      <div class="content-container">
        <ul class="nav-menu-inline page-menu">
          <router-link tag="li" 
                       :to="{name: 'LiveChannelManageDashboard'}"
                       active-class="active">dashboard</router-link>
          <!-- <router-link v-if="stream.dvrHours" -->
          <router-link v-if="stream.enabled && stream.dvrReady"
                       tag="li" 
                       :to="{name: 'LiveChannelManageDVR'}"
                       active-class="active">recording</router-link>
          <li v-else-if="!stream.enabled && stream.dvrReady"
              v-b-tooltip.hover
              title="please enable stream to access recording"
              class="li-disabled">recording</li>
          <!-- <router-link v-if="stream.dvrHours" -->
          <router-link v-if="stream.enabled && stream.dvrReady"
                       tag="li" 
                       :to="{name: 'LiveChannelManageVodEpisodes'}"
                       active-class="active">vod episodes</router-link>
          <li v-else-if="!stream.enabled && stream.dvrReady"
              v-b-tooltip.hover
              title="please enable stream to access recorded episodes"
              class="li-disabled">vod episodes</li>
          <!-- <router-link v-if="stream.dvrHours" -->
          <router-link tag="li" 
                       :to="{name: 'LiveChannelManageSettings'}"
                       active-class="active">video settings</router-link>
        </ul>

        <div v-if="trialSubscription && !isRecording()" 
             class="text-danger" 
             style="font-size:14px;">
          You are using a Trial plan with max 4 viewers at a time. 
          Please <router-link to="/subscribe?category=live&action=upgrade">upgrade</router-link> to remove this cap.
        </div>

        <router-view :stream="stream" 
                     :streamAlive="streamAlive"
                     :mediaPulse="mediaPulse"
                     @stream-updated="onStreamUpdates"></router-view>

      </div>
    </div>
    <div v-else 
         class="page-placeholder" 
         :style="{height: (windowHeight) + 'px'}">
      <div class="page-placeholder-content">
        {{ processingMessage || 'Retreiving details' }} ..
        <br>
        <b-progress :value="100" 
                    :max="100" 
                    animated
                    class="w-100 mt-2"
                    style="height: 7px;"></b-progress>
      </div>
    </div>

    <confirm-modal message="Would you like to delete this stream and all of its content?"
                   @modal-confirm="onStreamDeleteConfirm"></confirm-modal>
  </div>
</template>

<script>
import AlertModal from "./AlertModal.vue";
import ConfirmModal from "./ConfirmModal.vue";
import StreamService from "../services/StreamService";
import UserService from "../services/UserService";
import SubscriptionService from "../services/SubscriptionService";

const SourceTypes = {
  Pull: "pull",
  Publish: "publish"
};

export default {
  name: "LiveChannelManage",
  async mounted() {
    this.windowHeight = window.innerHeight - 200;
    this.streamId = this.$route.params.streamId;

    // get stream details
    await this.setupStream();
    this.processing = false;

    if (!this.stream) return;
    
    const userSub = await SubscriptionService.getUserSubscriptions(true)
    const baseSub = _.find(userSub.addonSubscriptions, { category: 'live' })
    if (baseSub) {
      this.trialSubscription = /trial/gi.test(baseSub.package.name)
    }

    // event tracking
    window.trackEvent(this.stream.name + " - Stream Page", this.stream);

    this.$root.$on('event', () => {

      console.log('root event')
      this.$root.$broadcast('event-from-parent', { message: 'hey' })
    })

  },
  destroyed() {
    if (!this.stream) return;
    this.unsubscribeMediaPulse();
    this.scopeAlive = false
  },
  data() {
    return {
      statusProcessing: false,
      scopeAlive: true,
      SourceTypes,
      nameEdit: false,
      userSubscription: null,
      processing: true,
      processingMessage: null,
      stream: null,
      streamAlive: false,
      trialSubscription: false,
      streamId: null,
      streamName: null,
      streamFps: null,
      mediaPulse: null,
      clientsCount: 0,
      windowHeight: 0,
      countPushedBytes() {
        const { bytesOutTotal = 0, pushStatsTotal = 0 } = this.mediaPulse;
        return _.sum([bytesOutTotal, pushStatsTotal]);
      },
      getStreamStatus() {
        return this.streamAlive ? "active" : "offline";
      },
      getStreamQuality() {
        const sizes = [480, 720, 1080, 1440, 2160];
        const sizesFmt = ["sd", "hd", "fhd", "qhd", "uhd"];

        const { height } = this.mediaPulse;

        let quality = "sd";
        for (let i = 0; i < sizes.length; i++) {
          if (height <= sizes[i]) {
            quality = sizesFmt[i];
            break;
          }
        }

        return quality;
      }
    };
  },
  methods: {
    isRecording () {
      return /(recording|vodepisodes)$/gi.test(this.$router.currentRoute.path)
    },
    requestChatStatus () {
      this.$root.$emit("bv::show::modal", "alert-chat-down");
    },
    onStreamUpdates (updates) {
      this.stream = _.assign({}, this.stream, updates)
    },
    async setupStream() {
      // get stream details
      try {
        const stream = await StreamService.getStream(this.streamId);
        this.stream = stream;
        this.streamName = this.stream.name;
        this.setupMediaPulse();
        this.setupViewershipCounter();
        
      } catch (err) {
        // redirect to stream list
        this.$router.push({ name: "ChannelList" });
        this.$notify({ group: "error", title: err.error, text: err.message });
      }
    },
    async onStreamNameChange() {
      if (!this.streamName) this.streamName = this.stream.name;

      if (this.stream.name === this.streamName) return;

      console.log("change stream name to", this.streamName);
      // try changing stream name
      try {
        await StreamService.setStreamName(this.streamId, this.streamName);
        // track event
        window.trackEvent(
          `Updated stream name ${this.stream.name} -> ${this.streamName}`
        );
      } catch (err) {
        this.streamName = this.stream.name;
        this.$notify({
          group: "error",
          title: "Couldn't change stream name",
          text: err.message
        });
      }
    },
    getTrackType(track) {
      if (!track) return;

      let type;
      if (/^a/gi.test(track.id)) type = "audio";
      else if (/^v/gi.test(track.id)) type = "video";

      return type;
    },
    setupMediaPulse() {
      if (!this.stream) return;

      const { haxrBlockId } = this.stream;
      if (!haxrBlockId) {
        setTimeout(() => this.setupStream(), 2000);
        return;
      }

      let headChunkRecieved = false;

      this.$socket.emit("stream.summary", haxrBlockId, {
        subscribe: true,
        out: "restream-push",
        timeout: 2000
      });

      this.$socket.on("stream.summary", summary => {
        if (summary._id !== haxrBlockId) return;

        headChunkRecieved = true;
        this.mediaPulse = summary;
        this.onMediaPulse();
      });

      // schedule head chunk verify
      setTimeout(() => {
        if (headChunkRecieved) return;

        console.log("refreshing stream pulse request");
        this.unsubscribeMediaPulse();
        setTimeout(() => {
          this.setupMediaPulse();
        }, 1000);
      }, 5000);
    },
    setupViewershipCounter () {

      (async function updateCounter() {
        try {
          let viewers = await StreamService.getStreamViewership(this.streamId)
          this.clientsCount = viewers || 0
        } catch (e) {}

        if (this.scopeAlive)
          setTimeout(updateCounter.bind(this), 3000)

      }.bind(this))()

    },
    onMediaPulse() {
      this.streamAlive = this.stream.enabled && this.mediaPulse && this.mediaPulse.alive

      let codecs = _.get(this, "mediaPulse.tracks");
      if (!_.size(codecs)) return;

      _.each(codecs, codec => {
        if (!/^v/gi.test(codec.id) || _.isNil(codec.fps)) return;
        let fps = Math.round(codec.fps)
        if (fps <= 144)
          this.streamFps = fps;
      });
    },
    unsubscribeMediaPulse() {
      const { haxrBlockId } = this.stream;
      this.$socket.emit("unsubscribe", {
        event: "stream.summary",
        value: haxrBlockId
      });
    },
    async toggleStatus(ev, newStatus) {
      ev.preventDefault();
      ev.stopPropagation();

      const oldStatus = this.stream.enabled;
      newStatus = newStatus === undefined ? !oldStatus : newStatus;

      this.statusProcessing = true;

      try {
        await StreamService.toggleStream(this.stream._id);
        this.stream.enabled = newStatus;

        window.trackEvent(
          `${newStatus ? "Enabled" : "Disabled"} stream: ${this.stream.name}`,
          this.stream
        );
      } catch (err) {
        this.$notify({
          group: "error",
          title: "Couldn't toggle stream status",
          text: err.message
        });

        if (err.message && err.message.indexOf("upgrade") > -1) {
          this.$root.$emit("bv::show::modal", "billing-prompt");
        }
      }

      this.statusProcessing = false;
    },
    requestStreamDelete() {
      this.$root.$emit("bv::show::modal", "modal-confirm");
    },
    async onStreamDeleteConfirm() {
      this.processing = true;
      this.processingMessage = "Deleting stream";

      // try deleting stream
      try {
        await StreamService.deleteStream(this.streamId);
        // track event
        window.trackEvent(`Deleted stream ${this.stream.name}`, this.stream);

        this.$router.push({ name: "ChannelList" });
      } catch (err) {
        // redirect to stream list
        this.$notify({ group: "error", title: err.error, text: err.message });
      }

      this.processing = false;
    }
  },
  components: {
    AlertModal,
    ConfirmModal,
  }
};

function flushBlobUrl(blob) {
  if (blob) {
    window.URL.revokeObjectURL(blob);
  }
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
/* .title .title-change-placeholder {
  position: absolute;
  right: 50px;
  display: inline-block;
  color: blue;
  font-size: 12px;
  pointer-events: none;
  back
} */
.title input {
  margin: 0;
  padding: 2px 3px;
  color: inherit;
  background-color: transparent;
  border: none;
  width: auto;
  display: inline-block;
  transition: all 0.2s ease-in-out;
  border-radius: 4px;
  outline-color: #0074fc;
  width: 100%;
  box-sizing: border-box !important;
}
.title input:hover {
  background-color: rgba(18, 23, 37, 0.67);
}
.title input:focus {
  /* background-color: #17193e; */
  background-color: rgba(18, 23, 37, 0.67);
}
.subtitle {
  padding: 5px 0;
  font-size: 16px;
}
.content-container {
  padding: 12px 0 40px 0;
}
.stat-container {
  margin-bottom: 9px;
}
.stat-container .value {
  display: inline-block;
  font-size: 22px;
  font-weight: 600;
  margin-right: 3px;
  height: 34px;
}
.stat-container.lg .value {
  font-size: 28px;
}
.stat-container.sm .value {
  font-size: 20px;
  font-weight: 400;
}
.stat-container.xs .label {
  display: inline-block;
  font-size: 11px;
  margin-right: 3px;
  /* font-weight: 400; */
  text-transform: lowercase;
}
.stat-container.xs .value {
  display: inline-block;
  font-size: 14px;
  font-weight: 400;
}
.stat-container .label {
  font-size: 12px;
  opacity: 0.65;
  text-transform: capitalize;
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
.head-button {
  border: none;
  margin: 0;
  /* margin-left: 20px; */
  /* padding: 10px 12px; */
  padding: 10px;
  color: inherit;
  opacity: 0.8;
  border-radius: 2px;
  background-color: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}
.head-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}
.head-button .icon {
  display: inline-block;
  /* font-size: 16px; */
  /* margin-bottom: 10px; */
  margin-right: 2px;
}
.head-button .label {
  /* display: block; */
  text-transform: capitalize;
}
.head-button:disabled {
  cursor: not-allowed;
}
.head-button:disabled:hover {
  background-color: transparent;
  border-color: transparent;
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
  border: 1px solid #151c31;
  border-radius: 2px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);
}
.input:focus {
  background-color: rgba(1, 3, 41, 0.47);
}

.btn-status {
  background-color: blue;
  color: white;
  border: none;
  font-size: 12.5px;
  cursor: pointer;
  padding: 1.75px 9px;
  border-radius: 2px;
  transition: all 0.2s linear;
}

.btn-status.outlined {
  color: blue;
  border: 1px solid;
  background-color: transparent !important;
}

.btn-status.outlined:hover {
  color: #ffffff !important;
  background-color: blue !important;
  border-color: blue;
}

.btn-status.danger {
  color: #ffffff;
  background-color: #f00;
}
.btn-status.outlined.danger {
  color: #f00;
}
.btn-status.outlined.danger:hover {
  color: #ffffff;
  background-color: #f00 !important;
  border-color: #f00 !important;
}
.btn-status:hover {
  background-color: #2647a3;
}
</style>
