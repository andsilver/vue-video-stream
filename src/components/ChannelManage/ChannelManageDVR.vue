<template>
  <div class="container view-wrapper" style="padding:0">

    <b-row>
      <b-col offset="2" cols="8">
        <div class="dvr-player-overlay">
          <div v-show="!timelineRange.validHit"
               class="dvr-invalid-hit">
            <p class="message">
              <i class="fa fa-video-slash"></i>&nbsp;&nbsp;
              Recording not available
            </p>
          </div>
          <div id="dvr-player"
              class="dvr-player"></div>
        </div>
      </b-col>
    </b-row>

    <div class="dvr-timeline-overlay font-num">
      <div class="dvr-timeline-container">
        <div class="dvr-timeline">
          <code v-for="(node, index) in timeline"
                :key="index"
                :style="{ width: (timelineRange.chunkPx + (4 + (index))) + 'px' }"
                class="timeline-chunk">
            <span v-show="node.isHead" 
                  style="color:white;">{{ node.time | date('DD-MM-YYYY') }}</span>
            <br>
            <span class="chunk-scale"></span>
            <span>{{node.time|date('HH:mm')}}</span>
          </code>
        </div>
      </div>

      <div class="dvr-timeline-seekbar-overlay">
        <div class="seekbar-frame-snapshot">
          <img v-show="seekbarFrameSnapshot" :src="seekbarFrameSnapshot">
          <div class="snapshot-seektime">{{ seekbarFrameTime|date('HH:mm:ss DD-MM') }}</div>
        </div>
        <div class="timeline-segment-controls">
          <div class="segment-extract-control ctrl1"></div>
          <div class="segment-extract-control ctrl2"></div>
        </div>
        <div class="timeline-seekbar-guide">
          <div v-for="(hit, index) in timelineRange.hits"
              :key="index"
              :style="hit.css"
              class="hit"></div>
        </div>
        <div class="timeline-seekbar"></div>
        <div class="timeline-seekbar-control"></div>
      </div>

      <div class="dvr-player-controls">
        <!-- <div class="text-center"> -->
        <div>
          <div class="clip-time font-num">
            <span v-show="timelineRange.validHit">
              {{ player.time|date('HH:mm:ss DD-MM') }}
            </span>
          </div>

          <b-row>
            <b-col>
              
              <div class="btn-group">
                <button class="btn btn-primary"
                        @click="zoomTimeline(1)"><i class="fa fa-minus"></i></button>
                <button class="btn btn-primary" 
                        @click="zoomTimeline(-1)"><i class="fa fa-plus"></i></button>
              </div>
              &nbsp;
              &nbsp;
              <div class="btn-group">
                <button class="btn btn-primary" 
                        @click="moveTimeline(-1)"><i class="fa fa-chevron-left"></i></button>
                <button class="btn btn-primary" 
                        @click="moveTimeline(1)"><i class="fa fa-chevron-right"></i></button>
              </div>
              &nbsp;
              &nbsp;
              <div class="btn-group">
                <button class="btn btn-primary"
                      @click="togglePlayback"
                      :disabled="!timelineRange.validHit">
                  <span class="fa"
                        :class="{
                        'fa-stop': player.playback, 
                        'fa-play': !player.playback }"></span>
                </button>
                <button class="btn btn-primary"
                      @click="toggleMute()">
                  <span :class="{ 
                        'fa-volume-off': player.mute, 
                        'fa-volume-up': !player.mute }"
                        class="fa heading-sm"></span>
                </button>
              </div>
            </b-col>

            <b-col class="text-right">

              <button class="btn btn-success text" 
                      :disabled="!validDVRHits.length">
                <a :href="getDownloadHref()"
                   target="_blank">Export MP4</a></button>

              &nbsp;
              &nbsp;

              <span>
                <span>{{timelineRange.extract.start|date('HH:mm:ss')}}</span> 
                <span class="text-muted">-</span>
                <span>{{timelineRange.extract.end|date('HH:mm:ss')}}</span>
              </span>
            </b-col>
          </b-row>

        </div>
      </div>
    </div>

    <br>

    <div class="dvr-tools-overlay">
      <div class="dvr-toolbar"></div>
      <b-row>
        <b-col >
          
          <div class="config-pane">
            <div class="config">
              <div class="tool-label">Recording Settings</div>
              <div class="config-value">
                <code class="text-uppercase">BASIC- 2 hours</code>
                <div style="margin-top:5px;">
                  <router-link to="/manage/billing">Change</router-link>
                </div>
              </div>
            </div>
          </div>

        </b-col>
      </b-row>
    </div>

  </div>
</template>
<script src="./ChannelManageRecording/ChannelManageRecording.js"></script>
<style scoped>
.pane-label {
  text-transform: uppercase;
  font-size: 13px;
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
  padding-top:10px;
}

.dvr-timeline-overlay .dvr-timeline-container {
  overflow: hidden;
  margin-bottom: 10px;
  margin-left: -16px;
  margin-right: -16px;
  background-color: #201e33;
  padding: 4px 16px;
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
  bottom: 12px;
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
.dvr-player-controls .btn .fa{
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