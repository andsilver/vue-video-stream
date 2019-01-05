<template>
  <div class="card"
       :class="{ disabled: !streamStatus,
                 'opacity-75 no-pointer': stream.removing,
                 [stream.type]: true
              }"
       @click="navigateManage">
    
    <div v-if="stream.type==='live'" class="type-badge"><code>LIVESTREAM</code></div>
    <div v-else-if="stream.type==='ipcam'" class="type-badge ipcam"><code>IPCAM</code></div>
    <div v-else-if="stream.type==='scheduled'" class="type-badge scheduled"><code>SCHEDULER STREAM</code></div>

    <div class="thumb">
      <stream-thumb :stream="stream" :mediaPulse="mediaPulse" class="video-thumb" />
    </div>
    <div class="row">
      <div class="col-12">
        <div class="caption">
          <div class="title">
            <div>
              <div class="set-padding-l-xs">
                <span class="word-wrap">{{stream.name}}</span>
                <span class="status"
                      :class="{ 'none': !mediaPulse,
                                'online blink': isStreamAlive(),
                                'offline': mediaPulse && !mediaPulse.alive }"></span>
                <span v-if="isStreamAlive() && mediaPulse.bitrate" 
                      class="bitrate">
                      <code>{{mediaPulse.bitrate | number}}</code> kbps
                </span>
              </div>
            </div>
          </div>

          <div class="description">
            <div>
              <img class="media-flag"  :src="getCountryFlag(stream)" />
              <div class="media-region">{{stream.region.name}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>    
    <div class="row card-controls">
      <div class="col-6">
        <button class="btn-status danger outlined"
                @click="requestDelete($event)">delete</button>
        <!-- <span class="control" 
              @click="requestDelete($event)" 
              style="margin-left: 15px;">
          <i class="far fa-trash-alt"></i>
        </span> -->
      </div>
      <div class="col-6 p-0 text-right">
        <!-- <span class="fas toggle-control"
              :class="{ 'fa-toggle-on enabled': streamStatus, 
                              'fa-toggle-off': !streamStatus,
                              'status-processing': statusProcessing }"
              @click="toggleStatus($event)"></span> -->
        <div v-if="statusProcessing"><i class="fas fa-spinner fa-spin"></i></div>
        <div v-else>
          <!-- <button v-if="stream.enabled"  -->
          <button v-if="streamStatus" 
                  class="btn-status outlined"
                  style="color:#f7f7f7 !important;"
                  @click="toggleStatus($event)"
                  v-b-tooltip.hover
                  title="Stop streaming, publishing">disable</button>
          <button v-else 
                  class="btn-status no-dimm"
                  @click="toggleStatus($event)">enable</button>
          
          <!-- <span class="tooltip-control">?</span> -->
        </div>

        <!-- <span class="fas toggle-control"
              :class="{ 'fa-toggle-on enabled': streamStatus, 
                              'fa-toggle-off': !streamStatus,
                              'status-processing': statusProcessing }"
              @click="toggleStatus($event)"></span> -->
      </div>
    </div>

    <confirm-modal modal-id="billing-prompt"
                   message="Please settle pending subscription invoices before continue."
                   okText="See Billing"
                   cancelText="Close"
                   @modal-confirm="navigateToBilling()"></confirm-modal>
  </div>
</template>

<script>
import StreamThumb from "./StreamThumb.vue";
import StreamService from "../services/StreamService";
import ConfirmModal from "@/components/ConfirmModal";

export default {
  name: "StreamCardView",
  props: ["stream"],
  mounted() {
    const { haxrBlockId } = this.stream;

    this.$socket.emit("stream.summary", haxrBlockId, {
      subscribe: true,
      out: "restream",
      timeout: 2000
    });

    this.$socket.on("stream.summary", summary => {
      if (summary._id !== haxrBlockId) return;
      this.mediaPulse = summary;
    });
  },
  destroyed() {
    this.$socket.emit("unsubscribe", {
      event: "stream.summary",
      value: this.stream.haxrBlockId
    });
  },
  data() {
    return {
      statusProcessing: false,
      streamStatus: this.stream.enabled,
      mediaPulse: null
    };
  },
  methods: {
    navigateToBilling() {
      this.$router.push({ path: "/manage/billing" });
    },
    requestDelete(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      this.$emit("delete-stream", this.stream);
    },
    navigateManage() {
      let viewName = "ChannelManage";
      if (this.stream.type === "live") 
        viewName = "LiveChannelManage";
      else if (this.stream.type === "ipcam") 
        viewName = "CamChannelManage";
      else if (this.stream.type === "scheduled") 
        viewName = "ScheduledChannelManage";

      this.$router.push({
        name: viewName,
        params: { streamId: this.stream._id }
      });
    },
    getCountryFlag(stream) {
      return `https://countryflags.io/${stream.region.identifier}/flat/24.png`;
    },
    isStreamAlive() {
      return this.streamStatus && this.mediaPulse && this.mediaPulse.alive;
    },
    async toggleStatus(ev, newStatus) {
      ev.preventDefault();
      ev.stopPropagation();

      const oldStatus = this.streamStatus;
      newStatus = newStatus === undefined ? !oldStatus : newStatus;

      this.statusProcessing = true;

      try {
        await StreamService.toggleStream(this.stream._id);
        this.streamStatus = newStatus;
        this.stream.enabled = newStatus;

        window.trackEvent(
          `${newStatus ? "Enabled" : "Disabled"} stream: ${this.stream.name}`,
          this.stream
        );
      } catch (err) {
        this.streamStatus = oldStatus;
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
    getTrackType(track) {
      if (!track) return;

      var type;
      var id = track.id;
      if (/^a/gi.test(id)) type = "audio";
      if (/^v/gi.test(id)) type = "video";

      return type;
    },
    lastEditTitle() {
      return "stream was last edited on " + this.stream.last_edit;
    }
  },
  components: {
    StreamThumb,
    ConfirmModal
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card {
  position: relative;
  margin: 0;
  padding: 0;
  color: #f7f7f7;
  /* background-color: rgb(23, 25, 72); */
  background-color: #202940;
  overflow: visible;
  width: 100%;
  min-height: 360px;
  box-sizing: border-box;
  border-radius: 5px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);
  /* border: 1px solid rgba(255, 255, 255, 0.1); */
  /* transition: all 0.15s linear; */
}

.card:hover {
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* transform: scale(1.025, 1.025); */
  /* box-shadow: 0 0 6px rgba(0, 0, 0, .3); */
}

.card.scheduled {
  background-color: rgba(16,138,166, 0.15);
}

.card .thumb {
  height: 225px;
  background-size: auto 130%;
  background-position: center center;
  background-repeat: no-repeat;
  border-radius: 5px 5px 0 0;
  background-color: #000000;
  position: relative;
}

.card .thumb .paused-label {
  position: absolute;
  bottom: 10px;
  width: auto;
  right: 10px;
  font-size: 13px;
  text-transform: uppercase;
  color: #ffffff;
  display: inline-block;
  font-weight: 500;
  padding: 2px 6px;
  background-color: rgb(51, 103, 214);
  border-radius: 2px;
}

.card .caption {
  /* font-family: "Poppins"; */
  padding: 12px 5px 15px 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  font-weight: 400;
  float: left;
  width: 97%;
}

.card.disabled .caption {
  opacity: 0.5;
}

.card .action {
  float: right;
  padding: 10px;
  text-align: center;
  border: none;
  background: none;
  font-size: 2em;
  line-height: 1;
  display: block;
  outline: none;
}

.card .caption .title {
  font-size: 24px;
  font-weight: 700;
  color: #f7f7f7;
  letter-spacing: -0.5px;
}

.card .caption .title .bitrate {
  font-size: 14px;
  float: right;
  font-weight: 400;
  display: inline-block;
  margin-top: 5px;
}

.card .caption .title .status {
  margin-left: 2px;
  display: inline-block;
  font-size: 13px;
  text-transform: uppercase;
  border: 1px solid gray;
  font-weight: 400;
  border-radius: 29px;
  z-index: 99;
  right: 5px;
  height: 10px;
  width: 10px;
  opacity: 0;
}
.card .caption .title .status.none {
  /* background: #10ba35;
  border-color: #10ba35; */
}
.card .caption .title .status.offline {
  opacity: 1;
  /* background-color: red; */
  border-color: gray;
}
.card .caption .title .status.online {
  opacity: 1;
  background-color: red;
  border-color: red;
  /* background: #0ff140;
  border-color: #0ff140; */
}

.card .caption .title .status.pending {
  opacity: 1;
}
.card .description {
  margin-top: 5px;
}
.card .media-region {
  color: white;
  /* padding: 1px 7px; */
  /* background: #09af90; */
  display: inline-block;
  /* border-radius: 2px; */
  font-size: 14px;
  letter-spacing: -0.5px;
}
.card .media-flag {
  display: inline-block;
  max-width: 20px;
  margin-right: 3px;
}

#card-dd {
  margin: 0 !important;
  margin-top: 10px !important;
  margin-left: 5px !important;
}
.card-icon {
  margin: 0 !important;
  margin-top: 10px !important;
  margin-left: 5px !important;
}
.dd-icon {
  color: #ffffff;
  font-size: 16px;
}
.dd-icon:hover {
  opacity: 0.5;
}
.card-controls {
  width: 98%;
  bottom: 12px;
  position: absolute;
  left: 12px;
}
.card-controls .control {
  display: inline-block;
  padding: 3px 5px;
  /* font-size: 14px; */
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  text-align: center;
  border-radius: 50px;
  cursor: pointer;
}
.card-controls .control:hover {
  background-color: #dc3545;
}
.toggle-control {
  float: right;
  color: #ffffff;
  font-size: 18px;
  margin: 0 0 0 5px;
  transition: all 0.2s linear;
}
.toggle-control.enabled {
  color: #02ffa2;
  /* color: greenyellow; */
}
.toggle-control.status-processing {
  cursor: not-allowed;
  opacity: 0.65;
  color: #ffffff;
}
.type-badge {
  display: inline-block;
  position: absolute;
  top: -1px;
  right: -1px;
  z-index: 1;
  color: #ffffff;
  background-color: #4747f3;
  padding: 3px 12px;
  border-radius: 0 4px 0 10px;
}
.type-badge * {
  color: inherit;
}
.type-badge.ipcam {
  background-color: #ff5b6f;
}
.scheduled .type-badge {
  background-color: #108aa6;
}

.card.disabled .type-badge {
  opacity: 0.5;
}
.card.disabled:hover .type-badge,
.card.disabled:hover .caption,
.card.disabled:hover .btn-status {
  opacity: 1 !important;
}

.btn-status {
  background-color: #4747f3;
  color: white;
  border: none;
  font-size: 12.5px;
  cursor: pointer;
  padding: 1.75px 9px;
  border-radius: 2px;
  transition: all 0.2s linear;
}

.btn-status.outlined {
  color: #4747f3;
  border: 1px solid;
  background-color: transparent !important;
}

.btn-status.outlined:hover {
  color: #ffffff !important;
  background-color: #4747f3 !important;
  border-color: #4747f3;
}

.btn-status.danger {
  color: #ffffff;
  background-color: #ff5b6f;
}
.btn-status.outlined.danger {
  color: #ff5b6f;
}
.btn-status.outlined.danger:hover {
  color: #ffffff;
  background-color: #ff5b6f !important;
  border-color: #ff5b6f !important;
}
.btn-status:hover {
  background-color: #2647a3;
}
.card.card.disabled .btn-status {
  opacity: 0.5;
}
.card.card.disabled .btn-status.no-dimm {
  opacity: 1;
}
.tooltip-control {
  display: inline-block;
  padding: 1px 6px;
  cursor: pointer;
  border-radius: 50px;
  background-color: black;

}
</style>
