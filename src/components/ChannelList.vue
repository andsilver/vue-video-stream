<template>
  <div class="container view-wrapper">
    <div class="row">
      <div class="col-6">
        <div class="title">Dashboard</div>
      </div>
      <div v-if="streams.length" class="col-6 text-right">
        <!-- <button class="addChannel"
                v-b-modal.modal-add-channel>
          <i class="fa fa-video"></i>&nbsp; Create New
        </button> -->
        <b-dropdown id="stream-deploy-dropdown" 
                    class="m-md-2"
                    size="lg" 
                    variant="danger"
                    right
                    no-caret
                    @show="onStreamCreateToggle(true)"
                    @hide="onStreamCreateToggle(false)">
          <template slot="button-content">
            <div style="font-size:14px;">
              <i class="fa fa-video"></i>&nbsp; Create New
              <i class="fa" 
                     :class="{
                       'fa-chevron-down': !streamCreateDropdownActive, 
                       'fa-chevron-up': streamCreateDropdownActive}"
                     style="font-size: 12px;"></i>
            </div>
          </template>
          <b-dropdown-item v-b-modal.modal-add-channel>
            <div class="dropdown-icon">
              <img src="../assets/restreaming.svg" />
            </div>
            <div class="dropdown-text">
              <div class="main">New Restream</div>
              <div class="desc">Restream To Multiple Sites</div>
            </div>
          </b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item v-b-modal.modal-add-live-channel>
            <div class="dropdown-icon">
              <img src="../assets/live-streaming.svg" />
            </div>
            <div class="dropdown-text">
              <div class="main">New Live Stream</div>
              <div class="desc">Live Stream Using Your Own Player</div>
            </div>
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.modal-add-vod-channel>
            <div class="dropdown-icon ico">
              <i class="far fa-play-circle" style="color:#4949fd;"></i>
            </div>
            <div class="dropdown-text">
              <div class="main">New VOD Bucket</div>
              <div class="desc">HLS Videos With Our CDN</div>
            </div>
          </b-dropdown-item>
        </b-dropdown>
      </div>
    </div>
    <div v-if="loading" 
         class="text-center"
         style="font-size:1.45em;color:#f7f7f7;margin-top:30px;">
         <div style="width:300px;display:inline-block;">
           <div>Retreiving data ..</div>
           <b-progress :value="100" 
                    :max="100" 
                    animated
                    class="w-100 mt-2"
                    style="height: 10px;"></b-progress>
         </div>
    </div>

    <div v-else>
      <ul class="row cards-list">
        <div v-if="!streams.length"
             class="placeholder">
          Get Started Now!
          <p style="font-size:13.5px;opacity:0.75;">Lets add a stream and begin publishing</p>
          <!-- <b-button variant="danger"
                    size="lg"
                    v-b-modal.modal-add-channel>Add Stream</b-button> -->
          <b-dropdown id="stream-deploy-dropdown" 
                    class="m-md-2 stream-deploy-dropdown-promo"
                    size="lg" 
                    variant="danger"
                    no-caret
                    @show="onStreamCreateToggle(true)"
                    @hide="onStreamCreateToggle(false)">
            <template slot="button-content">
                <div style="font-size:14px;">
                  <i class="fa fa-video"></i>&nbsp; Add Stream
                  <i class="fa" 
                     :class="{
                       'fa-chevron-down': !streamCreateDropdownActive, 
                       'fa-chevron-up': streamCreateDropdownActive}"
                     style="font-size: 12px;"></i>
                </div>
              </template>
              <b-dropdown-item v-b-modal.modal-add-channel>
                <div class="dropdown-icon">
                  <img src="../assets/restreaming.svg" />
                </div>
                <div class="dropdown-text">
                  <div class="main">New Restream</div>
                  <div class="desc">Restream To Multiple Sites</div>
                </div>
              </b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item v-b-modal.modal-add-live-channel>
                <div class="dropdown-icon">
                  <img src="../assets/live-streaming.svg" />
                </div>
                <div class="dropdown-text">
                  <div class="main">New Live Stream</div>
                  <div class="desc">Live Stream Using Your Own Player</div>
                </div>
              </b-dropdown-item>
              <b-dropdown-item v-b-modal.modal-add-vod-channel>
                <div class="dropdown-icon ico">
                  <i class="far fa-play-circle" style="color:#4949fd;"></i>
                </div>
                <div class="dropdown-text">
                  <div class="main">New VOD Bucket</div>
                  <div class="desc">HLS Videos With Our CDN</div>
                </div>
              </b-dropdown-item>
          </b-dropdown>
        </div>

        <li v-for="stream in streams"
            v-bind:key="stream._id"
            class="col-md-4"
            style="padding-left:0;">
          <div class="card-wrapper">
            <stream-card-view :stream="stream"
                              @delete-stream="onStreamDeleteRequest" />
          </div>
        </li>
      </ul>
    </div>
    
    <add-channel-modal @new-channel="onNewStream"></add-channel-modal>
    <add-live-channel-modal @new-channel="onNewStream"></add-live-channel-modal>
    <add-cam-channel-modal @new-channel="onNewStream"></add-cam-channel-modal>
    <add-scheduled-channel-modal @new-channel="onNewStream"></add-scheduled-channel-modal>
    <add-vod-channel-modal @new-channel="onNewStream"></add-vod-channel-modal>
    <confirm-modal message="Would you like to delete this stream and all of its content?"
                   @modal-confirm="onStreamDeleteConfirm"></confirm-modal>
  </div>
</template>

<script>
import StreamCardView from "./StreamCardView.vue";
import AddCamChannelModal from "./AddCamChannelModal.vue";
import AddChannelModal from "./AddChannelModal.vue";
import AddLiveChannelModal from "./AddLiveChannelModal.vue";
import AddScheduledChannelModal from "./AddSchedulerChannelModal.vue";
import AddVodChannelModal from "./AddVODChannelModal.vue";
import ConfirmModal from "./ConfirmModal.vue";
import StreamService from "../services/StreamService";

export default {
  name: "ChannelList",
  async mounted() {
    try {
      const streams = await StreamService.getUserStreams();
      setTimeout(() => {
        this.streams = streams;
        this.loading = false;
      }, 100);
    } catch (err) {
      this.$notify({ group: "error", title: err.error, text: err.message });
      this.loading = false;
      return;
    }

    let streamsCount = _.size(this.streams)
    // event tracking
    window.trackEvent("Dashboard", {
      totalStreams: streamsCount,
      enabledStreams: _.size(_.filter(this.streams, { enabled: true }))
    });

    window.Intercom('update', { 
      totalStreams: streamsCount,
      totalLiveStreams: _.filter(this.streams, { type: 'live' }).length
    });

    // update win title
    this.$emit('updateTitle', 'Dashboard - Castr Streams')

  },
  data() {
    return {
      deleteModalConfiguredStream: null,
      loading: true,
      streams: [],
      streamCreateDropdownActive: false
    };
  },
  methods: {
    openCamModal() {
      this.$root.$emit("bv::show::modal", "modal-add-cam-channel");
    },
    openScheduledStreamModal() {
      this.$root.$emit("bv::show::modal", "modal-add-scheduled-channel");
    },
    onStreamCreateToggle(state) {
      this.streamCreateDropdownActive = state;
    },
    onNewStream(stream, regionDetails) {
      this.streams = [...this.streams, stream];
      this.$notify({ group: "success", text: "Stream deployed successfully" });

      // setTimeout(() => {
      let redirectPath = "/streams/";
      if (stream.type === "live") {
        redirectPath = "/livestreams/";
      } else if (stream.type === "ipcam") {
        redirectPath = "/ipcams/";
      } else if (stream.type === "scheduled") {
        redirectPath = "/scheduled/";
      } else if (stream.type === "vod") {
        redirectPath = "/vods/";
      }

      redirectPath += stream._id;
      this.$router.push({ path: redirectPath });
      // }, 3000)

      // track event
      window.trackEvent(
        `Deployed new stream ${stream.name} in ${regionDetails.name}`,
        stream
      );
    },
    onStreamDeleteRequest(stream) {
      this.deleteModalConfiguredStream = stream;
      this.$root.$emit("bv::show::modal", "modal-confirm");
    },
    async onStreamDeleteConfirm() {
      // pop stream out of the list
      const index = this.streams.indexOf(this.deleteModalConfiguredStream);
      this.streams = _.concat(
        this.streams.slice(0, index),
        this.streams.slice(index + 1)
      );

      try {
        await StreamService.deleteStream(this.deleteModalConfiguredStream._id);

        // track event
        const removedStream = this.deleteModalConfiguredStream;
        window.trackEvent(
          `Deleted stream ${removedStream.name}`,
          removedStream
        );
      } catch (err) {
        this.$notify({ group: "error", title: err.error, text: err.message });
        // push stream back to list
        this.onNewStream(this.deleteModalConfiguredStream);
      }

      this.deleteModalConfiguredStream = null;
    }
  },
  components: {
    StreamCardView,
    AddCamChannelModal,
    AddChannelModal,
    AddLiveChannelModal,
    AddScheduledChannelModal,
    AddVodChannelModal,
    ConfirmModal
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.view-wrapper {
  margin-top: 40px;
}
.title {
  padding: 5px 7px;
  font-size: 20px;
  color: #f7f7f7;
}
.addChannel {
  /* background-color: #0069d9; */
  background-color: #dc3545;
  color: #ffffff;
  padding: 8px 20px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #dc3545;
  outline: none;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}
.addChannel:hover {
  background-color: #c82333;
  border-color: #bd2130;
}
.addChannel:active {
  background-color: #bd2130;
  border-color: #b21f2d;
}
.cards-list {
  list-style-type: none;
  margin: 20px 0 0 0;
  padding: 0;
  clear: both;
}
.card-wrapper {
  padding: 0;
  margin-bottom: 15px;
  /* margin-right: 5px; */
}
.placeholder {
  font-size: 32px;
  opacity: 0.75;
  margin: 35px 0;
  color: #ffffff;
  text-align: center;
  width: 100%;
}
</style>

<style>
#stream-deploy-dropdown button {
  border-radius: 3px !important;
}
#stream-deploy-dropdown button[aria-expanded="true"] {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
#stream-deploy-dropdown .dropdown-menu {
  min-width: 275px;
  /* background-color: rgb(61, 70, 115) !important; */
  background-color: rgb(47, 55, 80) !important;
  color: #ffffff;
  left: 1px !important;
  top: 16px !important;
  padding-top:10px;
  padding-bottom:10px;
}
#stream-deploy-dropdown .dropdown-menu::before {
  content: '.';
  display: inline-block;
  position: absolute;
  /* background: #3f4672; */
  background-color: rgb(47, 55, 80);
  width: 20px;
  height: 20px;
  color: transparent;
  transform: rotate(45deg);
  top: -5.5px;
  right:25px;
  z-index: -1;
}

#stream-deploy-dropdown.stream-deploy-dropdown-promo .dropdown-menu {
  left: 0px !important;
}
#stream-deploy-dropdown.stream-deploy-dropdown-promo .dropdown-menu::before {
  right:unset !important;
  left:25px !important;
}
#stream-deploy-dropdown .dropdown-item {
  color: inherit;
  padding: 12px 20px !important;
  background-color: transparent;
  position:relative;
  z-index: 1;
}
#stream-deploy-dropdown .dropdown-item:hover {
  background-color: #212948;
}
.dropdown-icon {
  display: inline-block;
  width: 32px;
}
.dropdown-icon.ico {
  vertical-align: super;
}
.dropdown-icon img {
  width: 20px;
  vertical-align: super;
}
.dropdown-icon .fa,
.dropdown-icon .far {
  font-size: 24px;
  margin-left: -1px;
}
.dropdown-text {
  display: inline-block;
}
.dropdown-text .main {
  font-size: 15px;
}
.dropdown-text .desc {
  font-size: 12.5px;
  opacity: 0.7;
}
.dropdown-divider {
  border-color: rgba(1, 3, 41, 0.14);
  margin-top: 0;
  margin-bottom: 0;
}
</style>