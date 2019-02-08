<template>
  <div class="">
    <!-- Modal Component -->
    <b-modal ref="modalVODVideo" 
             id="modal-vod-video"
             class="modal-platform modal-frameless"
             size="lg"
             centered>
      <template slot="modal-header" style="height:0;"><div></div></template>
      <div>
        <b-row>
          <b-col cols="8">
            <!-- iframe widget -->
            <div class="placeholder-wrapper">
              <code>Processing playback ..</code>
            </div>
            <iframe class="embed" :src="getPlayerUrl()" frameborder="0" width="500" height="380" allow="autoplay"  scrolling="no"  allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>

          </b-col>
          <b-col style="padding:0;" v-if="active">
            <div class="vod-content">

              <div>
                <div class="info-row">
                  <div class="label">Video name</div>
                  <div class="value">
                    <code style="font-size:1em;">{{video.fileName}}</code>
                  </div>
                </div>
                <div class="info-row">
                  <div class="label">Video Id</div>
                  <div class="value">{{video.id}}</div>
                </div>
                <div class="info-row">
                  <div class="label">Size</div>
                  <div class="value">
                    {{video.bytes | bytes}}
                  </div>
                </div>
                <div class="info-row">
                  <div class="label">Mediainfo</div>
                  <div class="value">
                    <div v-if="video.mediaInfo">
                      <div>
                        <span v-if="video.mediaInfo.duration<60">{{video.mediaInfo.duration}} <small>SECS</small> </span>
                        <span v-else-if="video.mediaInfo.duration">{{video.mediaInfo.duration/60|number}} <small>MINS</small> </span>
                      </div>
                      <div>{{video.mediaInfo.width}} x {{video.mediaInfo.height}}</div>
                    <!-- media codecs -->
                      <div v-if="video.mediaInfo.codecs">
                        <span v-for="(codec, index) in video.mediaInfo.codecs" 
                                :key="index" 
                                v-if="codec.type !== 'general'"
                                class="media-codec"
                                :class="codec.type">{{codec.codec}}</span>
                        </div>
                    </div>
                    <div v-else>n/a</div>

                  </div>
                </div>
                <div class="info-row">
                  <div class="label">Creation</div>
                  <div class="value">
                    {{video.creationTime | date}}
                  </div>
                </div>
              </div>

              <div class="action-wrapper">
                        <!-- class="modal-button modal-button-sm">close</button> -->
                <button @click="onConfirm"
                        type="submit"
                        class="btn btn-sm btn-link"
                        style="border:1px solid">Close</button>
              </div>

            </div>
          </b-col>
        </b-row>
      </div>
      <template slot="modal-footer"><div></div></template>
    </b-modal>
  </div>
</template>

<script>
import _ from "lodash";
import HostingRegions from "./hostingRegions";

export default {
  name: "VodVideoModal",
  props: ["stream", "video"],
  mounted () {
    this.$refs.modalVODVideo.$on("shown", this.onInit);
    this.$refs.modalVODVideo.$on("hide", this.onDismiss);
  },
  data() {
    return {
      processing: false,
      okLabel: null,
      active: false
    }
  },
  methods: {
    onInit(){
      this.active = true
    },
    onDismiss(){
      this.active = false
    },
    onConfirm() {
      this.$emit("modal-confirm");
      this.dismiss();
    },
    dismiss() {
      this.$refs.modalVODVideo.hide();
      // lazy clear
      setTimeout(() => { 
        this.processing = false; 
      }, 1000);
    },
    getPlayerUrl () {
      if (!this.active) return
      let video = this.video
      // let playerUri = 'https://player.castr.io/embed?src='+this.getHlsUrl(video)
      let playerUri = `https://player.castr.io/vod/${this.stream.key}/${video.id}`
      return playerUri
    },
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
.vod-content {
  padding: 5px 0;
  width: 90%;
  height:100%;
  position: relative;
}
.info-row {
  /* margin-bottom: 10px; */
  padding: 10px 0;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}
.info-row:last-of-type {
  border-bottom: none;
}
.info-row .label {
  margin-bottom: 3px;
  text-transform: lowercase;
}
.info-row .value {

}
.action-wrapper {
  position:absolute;
  right: 0;
  bottom: 10px;
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
.placeholder-wrapper {
  position: absolute;
  width: 100%;
  text-align: center;
  margin-top: 50px;
  z-index:0;
}
iframe.embed {
  width: 100%;
  height: 420px;
  margin: 0;
  padding: 0;
  margin-bottom: -7px;
  position: relative;
  z-index:1;
}
</style>

<style>
.modal-frameless {}
.modal-frameless .modal.show {
  /* background-color: rgba(0,0,0,0.4) !important; */
}
.modal-frameless .modal-dialog {
  max-width:900px !important;
}
.modal-frameless .modal-content,
.modal-frameless .modal-body {
  padding: 0 !important;
}
.modal-frameless .modal-header,
.modal-frameless .modal-footer {
  display: none !important;
}
</style>
