<template>
    <div v-if="!stream.dvrHours" class="container" style="padding:0">
      <p class="text-danger" style="font-size:14px;">
        Video Recording is not included in your current subscription. Kindly upgrade your subscription plan to access this feature.
      </p>
      <router-link to="/subscribe?category=live&action=upgrade">
        <button class="btn btn-danger">Upgrade Now</button>
      </router-link>
    </div>
    <div v-else class="container view-wrapper dvr-widget-wrapper" style="padding:0">
      <div v-if="processing">
        <div class="page-placeholder" style="height:400px">
          <div class="page-placeholder-content" style="font-size:16px;">
            &nbsp; Please wait .. &nbsp; 
            <br>
            <b-progress :value="100"
                        :max="100" 
                        animated
                        class="w-100 mt-2"
                        style="height: 10px;"></b-progress>
          </div>
        </div>
      </div>
      <iframe v-if="dvrIframeUrl"
              width="650" 
              height="0" 
              :src="dvrIframeUrl"
              class="dvr-widget"
              allowfullscreen
              border="0"
              :style="{ opacity: processing?0:1 }"></iframe>
              <!-- :style="{ height: (processing?0:560)+'px'  }"></iframe> -->
  </div>
</template>
// <script src="./ChannelManageRecording/ChannelManageRecording.js"></script>
<script>
export default {
  name: "ChannelManageDVR",
  props: ['stream'],
  mounted () {
    setTimeout(() => {
    this.processing = false
    }, 5000)
  },
  data () {
    return {
      processing: true
    }
  },
  computed: {
    dvrIframeUrl () {
      const {stream} = this
      if (!stream) return ''
      // return `https://${stream.region.identifierHaxr}.origincdn.com/${stream.key}/embed.html?dvr=true`
      return `http://dvr.castr.io/${stream.key}/embed.html?dvr=true&region=${stream.region.identifierHaxr}`
    }
  }
};
</script>
<style scoped>
.pane-label {
  text-transform: uppercase;
  font-size: 13px;
}
.dvr-widget-wrapper {
  text-align: center;
  padding:0;
}
.dvr-widget {
  width: 100%;
  height: 560px;
  /* border: 1px solid #363640; */
  border: none;
}
.timeline-header {
  font-size: 1.15em;
  margin-bottom: 10px;
}

.timeline-header > div {
  padding: 10px;
}

.timeline-chunks {
  text-align: center;
}

.timeline-chunks > div {
  padding: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-right-width: 0;
}

.timeline-chunks > div:last-of-type {
  border-right-width: 1px;
}

.dvr-overlay > div:first-of-type {
  background-color: #f7f7f7;
}

.dvr-tools-overlay {
  padding: 10px;
  user-select: none;
}

.dvr-timeline-overlay {
  user-select: none;
  margin-top: 10px;
  padding: 8px 16px;
  box-sizing: border-box;
  background: #27253c;
  border-radius: 3px;
  padding-top: 10px;
}

.dvr-timeline-overlay .dvr-timeline-container {
  overflow: hidden;
  margin-bottom: 10px;
  /* margin-left: -16px;
  margin-right: -16px; */
  background-color: #201e33;
  /* padding: 4px 16px; */
}

.dvr-timeline-overlay .dvr-timeline {
  width: 150%;
}

.dvr-timeline-overlay .timeline-chunk {
  /*text-align: right;*/
  /*paddi:left: 8px;*/
  display: inline-block;
  background: transparent;
  /* margin-left: -1px; */
}

/* .dvr-timeline-overlay .timeline-chunk::before {
  content:'..';
  display: inline-block;
  border-left: 1px solid;
  vertical-align: text-bottom;
} */

.dvr-timeline-overlay .timeline-chunk .chunk-scale {
  display: inline-block;
  border-left: 1px solid;
  height: 10px;
  color: rgba(232, 62, 140, 0.6);
}

.dvr-timeline-overlay .dvr-timeline-seekbar-overlay {
  /*border: 1px solid;*/
  margin: 15px 0 0 0;
  position: relative;
}

.dvr-timeline-overlay .dvr-timeline-seekbar-overlay .seekbar-frame-snapshot {
  background: #fff;
  box-shadow: 0px 0px 4px 1px rgba(0, 0, 0, 0.2);
  position: absolute;
  border-radius: 2px;
  z-index: 99;
  bottom: 15px;
  overflow: hidden;
  display: none;
  text-align: center;
  padding: 0px 2px;
  border-radius: 2px;
  color: #000221;
  font-size: 12px;
}
.seekbar-frame-snapshot .snapshot-seektime {
  margin-top: 2px;
}

.dvr-timeline-overlay
  .dvr-timeline-seekbar-overlay
  .seekbar-frame-snapshot
  img {
  /*max-height: 80px;*/
  max-width: 250px;
  padding: 1px;
}

.dvr-timeline-overlay .dvr-timeline-seekbar-overlay .timeline-seekbar {
  height: 5px;
  background-color: #f7f7f7;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.dvr-timeline-overlay .dvr-timeline-seekbar-overlay .timeline-seekbar-guide {
  position: absolute;
  /* position: relative; */
  height: 5px;
  background-color: rgba(0, 0, 0, 0.12);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  cursor: pointer;
  width: 100%;
  z-index: 10;
}

.dvr-timeline-overlay
  .dvr-timeline-seekbar-overlay
  .timeline-seekbar-guide
  .hit {
  background-color: rgba(255, 0, 0, 0.75);
  height: 6px;
  position: absolute;
  display: inline-block;
  pointer-events: none;
}

.dvr-timeline-overlay .dvr-timeline-seekbar-overlay .timeline-seekbar-control {
  position: absolute;
  width: 15px;
  height: 15px;
  background-color: #e8e8e8;
  /* background-color: #3380f8; */
  /* background-color: #e83e8c; */
  /* background-color: #6c757d; */
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgb(0, 2, 33);
  border-radius: 10px;
  top: -5px;
  left: 0;
  cursor: pointer;
  z-index: 100;
  user-select: none;
}

.dvr-timeline-seekbar-overlay .timeline-segment-controls {
  /*display: none;*/
}

.timeline-segment-controls > div {
  position: absolute;
  height: 30px;
  width: 7px;
  border: 1px solid rgb(51, 3, 3);
  background-color: #e60101;
  top: -8px;
  z-index: 11;
  cursor: pointer;
  /* border-radius: 4px 0 0 4px; */
}

.segment-extract-control.ctrl1 {
  border-radius: 4px 0 0 4px !important;
}
.segment-extract-control.ctrl2 {
  border-radius: 0 4px 4px 0 !important;
}

.dvr-timeline-overlay
  .dvr-timeline-seekbar-overlay
  .timeline-segment-controls
  > div:last-of-type {
  right: 0;
}

.dvr-player-overlay {
  /*padding: 10px;*/
  position: relative;
}

.dvr-player-overlay .dvr-player {
  min-height: 378px;
  background-color: #000221;
  border-radius: 8px;
  overflow: hidden;
}

.dvr-player-overlay .dvr-invalid-hit {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000221;
  text-align: center;
  padding-top: 20%;
  color: #fff;
  border-radius: 10px;
}

.dvr-player-controls {
  min-height: 35px;
  padding: 0 10px;
  box-sizing: border-box;
  margin-top: 15px;
  margin-bottom: 10px;
  /*border: 1px solid rgba(0,0,0,0.1);*/
}

.dvr-player-controls .clip-time {
  height: 18px;
}

.dvr-player-controls .btn {
  outline: none;
  width: 40px;
  height: 35px;
  color: #3380f8;
  padding: 5px 0;
}
.dvr-player-controls .btn .fa {
  font-size: 12.5px;
}
.dvr-player-controls .btn.text {
  outline: none;
  width: auto !important;
  padding-left: 12px;
  padding-right: 12px;
  font-family: comfortaa;
  font-weight: 600;
  font-size: 13.5px;
}
.dvr-player-controls .btn.text a {
  color: inherit;
}

.dvr-tools-overlay .dvr-toolbar {
}

.dvr-tools-overlay .dvr-toolbar .md-button {
  margin: 0;
  text-transform: none;
  box-shadow: none;
}

.dvr-tools-overlay .dvr-toolbar .md-button * {
  text-transform: none;
}

.dvr-tools-overlay .dvr-toolbar .playback-control {
}

.dvr-tools-overlay .dvr-toolbar .playback-control .control {
  display: inline-block;
  padding: 7px;
  line-height: 1;
  font-size: 1.25em;
  box-sizing: border-box;
  margin-right: 5px;
}

.dvr-tools-overlay .dvr-toolbar .playback-control .control:last-of-type {
  margin-right: 0;
}

.dvr-tools-overlay .dvr-toolbar .playback-control .control.static {
  border: 1px solid rgba(0, 0, 0, 0.07);
}

.dvr-tools-overlay .dvr-toolbar .playback-control .control:before {
  vertical-align: middle;
}

.dvr-tools-overlay .dvr-toolbar .playback-control .control:not(.static) {
  height: 35px;
  width: 35px;
  text-align: center;
  line-height: 15px;
  border-radius: 50px;
  font-size: 1.35em;
  /*opacity: 0.85;*/
}

.dvr-tools-overlay .dvr-toolbar .playback-control .control:hover:not(.static) {
  background-color: #e7e7e7;
  cursor: pointer;
}

.dvr-tools-overlay .dvr-toolbar .playback-control .control:active:not(.static) {
  background-color: #1188ef;
  color: #ffffff;
}

.dvr-tools-overlay .dvr-toolbar .zoom-control {
}

.dvr-tools-overlay .dvr-toolbar .zoom-control .control {
  display: inline-block;
  padding: 4px 10px;
  line-height: 1;
  font-size: 1.6em;
  /*border: 1px solid rgba(0,0,0,0.07);*/
  text-align: center;
  width: 35px;
  height: 33px;
  cursor: pointer;
}

.dvr-tools-overlay .dvr-toolbar .zoom-control .control:hover {
  background-color: #e7e7e7;
  cursor: pointer;
}

.dvr-tools-overlay .dvr-toolbar .zoom-control .control:active {
  background-color: #1188ef;
  color: #ffffff;
}

.dvr-tools-overlay .dvr-toolbar .zoom-control .control:first-of-type span {
  vertical-align: -webkit-baseline-middle;
}

.dvr-tools-overlay .dvr-calendar {
}

.dvr-tools-overlay .dvr-calendar .dvr-calendar-input {
  position: absolute !important;
  top: none;
  left: none;
  opacity: 0;
  pointer-events: none;
}

.datepicker .btn {
  border: none;
  border-radius: 0;
  outline: none;
  box-shadow: none;
}

.datepicker table tr:first-of-type th:nth-of-type(2) button {
  font-size: 1.1em;
}

.datepicker table tr:first-of-type th:nth-of-type(2) button:hover {
  background-color: transparent;
}

.datepicker table tr:first-of-type th:nth-of-type(2) button strong {
  font-weight: 500;
}

.datepicker table tr:nth-of-type(2) th {
  font-weight: 500;
  padding: 10px 0;
  font-size: 0.95em;
}

.datepicker {
  position: static !important;
  float: none;
  box-shadow: none;
  /*border: none;*/
  top: 0;
  left: 0;
}

.dvr-timeline-overlay {
}

.tool-label {
  margin-bottom: 7px;
  opacity: 0.85;
}

.player-control {
  font-size: 18px;
}

.input {
  display: inline-block;
  width: 150px;
  height: auto !important;
  margin: 10px 0 10px 0;
  padding: 7px 14px;
  color: #ffffff;
  /* background-color: #010329; */
  background-color: #17193e;
  border: none;
  border-radius: 2px;
}
.input:focus {
  background-color: rgba(1, 3, 41, 0.47);
}

.font-num {
  font-family: arial;
}

/*.dvr-timeline-overlay .dvr-timeline {
    padding: 4px 0;
}*/

button {
  color: #d6d6d6 !important;
}
</style>

<style>
.fullscreen [data-player] {
  position: fixed;
  width: 100% !important;
  height: 100% !important;
  top: 0;
  left: 0;
  z-index: 999;
  background: #000;
  text-align: center;
}
</style>