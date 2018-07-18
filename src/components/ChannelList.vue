<template>
  <div class="container view-wrapper">
    <div class="row">
      <div class="col-md-6">
        <div class="title">My Streams</div>
      </div>
      <div v-if="streams.length" class="col-md-6 text-right">
        <button class="addChannel"
                v-b-modal.modal-add-channel>
          <i class="fa fa-video"></i>&nbsp; Create New
        </button>
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
          <b-button variant="danger"
                    size="lg"
                    v-b-modal.modal-add-channel>Add Stream</b-button>
        </div>

        <li v-for="stream in streams"
            v-bind:key="stream._id"
            class="col-md-6"
            style="padding-left:0;">
          <div class="card-wrapper">
            <stream-card-view :stream="stream"
                              @delete-stream="onStreamDeleteRequest" />
          </div>
        </li>
      </ul>
    </div>
    
    <add-channel-modal @new-channel="onNewStream"></add-channel-modal>
    <confirm-modal message="Would you like to delete this stream and all of its content?"
                   @modal-confirm="onStreamDeleteConfirm"></confirm-modal>
  </div>
</template>

<script>
import StreamCardView from "./StreamCardView.vue";
import AddChannelModal from "./AddChannelModal.vue";
import ConfirmModal from "./ConfirmModal.vue";
import StreamService from "../services/StreamService";

export default {
  name: "ChannelList",
  async mounted() {
    try {
      this.streams = await StreamService.getUserStreams();
    } catch (err) {
      this.$notify({ group: "error", title: err.error, text: err.message });
    }

    this.loading = false;

    // event tracking
    window.trackEvent("Dashboard", {
      totalStreams: _.size(this.streams),
      enabledStreams: _.size(_.filter(this.streams, { enabled: true }))
    });

  },
  data() {
    return {
      deleteModalConfiguredStream: null,
      loading: true,
      streams: []
    };
  },
  methods: {
    onNewStream(stream, regionDetails) {
      this.streams = [...this.streams, stream];
      this.$notify({ group: "success", text: "Stream deployed successfully" });
      this.$router.push({ path: `/streams/${stream._id}` });

      // track event 
      window.trackEvent(`Deployed new stream ${stream.name} in ${regionDetails.name}`, stream);
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
        const removedStream = this.deleteModalConfiguredStream
        window.trackEvent(`Deleted stream ${removedStream.name}`, removedStream);
        
      } catch (err) {
        this.$notify({ group: "error", title: err.error, text: err.message });
        // push stream back to list
        this.onNewStream(this.deleteModalConfiguredStream);
      }

      this.deleteModalConfiguredStream = null;
    }
  },
  components: { StreamCardView, AddChannelModal, ConfirmModal }
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
  padding: 0 5px;
  margin-bottom: 15px;
  margin-right: 5px;
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
