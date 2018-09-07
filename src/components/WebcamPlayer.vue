<template>
  <div>
    <div class="player-container">
      <div v-if="!permissionHappened" 
           class="player-loading-indicator">waiting for camera access</div>

      <div v-else-if="!webrtcEnabled" 
           class="player-loading-indicator">
        <div>
          <div class="icon"><i class="fas fa-video-slash"></i></div>
          <div>Camera access was forbidden</div>
          <div style="font-size: 12px;">Kindly allow media access to proceed</div>
        </div>
      </div>
      
      <div v-show="webrtcEnabled"
           class="video-controls"
           :class="{'stream-ready': pushReady}">
        <div class="head text-center">
          <code v-if="pushReady" class="rec-icon">Live</code>
        </div>
        <div class="main">
          <div class="actions-container">
            <button v-if="!pushReady"
                    class="modal-button highlight"
                    @click="togglePushReady(true)">Stream Now</button>
          </div>
        </div>
        <div class="bottom text-center">
          <div v-show="pushReady">
            <!-- <b-row>
              <b-col> -->
                <button class="btn btn-sm btn-danger"
                        @click="togglePushReady(false)">stop</button>

                <!-- <button class="btn btn-sm btn-danger"
                        style="margin-left:4px;"
                        @click="toggleMute()">{{this.muted? 'unmute' : 'mute'}}</button> -->
                <button class="btn btn-sm btn-danger"
                        style="margin-left:0;"
                        @click="toggleMute()">
                        <!-- <i class="fa" 
                           :class="{ 
                             'fa-volume-down': !muted, 
                             'fa-volume-off': muted }"></i> -->
                        {{this.muted? 'unmute' : 'mute'}}
                </button>
              <!-- </b-col>
              <b-col> -->
                <!-- <div class="actions-container">
                  <span style="color:red;">o</span>
                  <code>Live</code>
                </div> -->
              <!-- </b-col>
            </b-row> -->
          </div>
        </div>
      </div>
      <video v-show="webrtcEnabled" 
            id="webcam-player" 
            :class="{blurred: !pushReady}" 
            autoplay></video>
    </div>
    <div v-if="error" class="text-danger text-center">
      <code style="color:inherit;">Error, coundn't publish to server</code>
    </div>
  </div>
</template>

<script>
import StreamService from "../services/StreamService";
import FlussonicMsePlayer from "@flussonic/flussonic-mse-player";

const playerContainerId = "#webcam-player";

let thumbsTempContainer;
export default {
  name: "WebcamPlayer",
  props: ["stream"],
  mounted() {
    const video = document.getElementById("webcam-player");

    this.videoPlayer = video
    // this.createConnection()
    this.requestMediaAccess()

  },
  destroyed() {
    this.scopeAlive = false;
    this.stopStreaming()
    this.stopMediaAccess()
  },
  data() {
    return {
      error: null,
      scopeAlive: true,
      webrtcEnabled: false,
      permissionHappened: false,
      playback: false,
      pushReady: false,
      websocket: null,
      peerConn: null,
      videoPlayer: null,
      muted: true
    };
  },
  methods: {
    togglePushReady (state) {
      this.pushReady = state
      if (state === true) {
        this.createConnection(() => {
          this.startStreaming()
        })
        // this.startStreaming()
      } else 
        this.stopStreaming()
    },
    toggleMute (forceState) {
      const newState = forceState !== undefined ? forceState : !this.muted
      this.muted=newState
      this.videoPlayer.muted = newState
    },
    requestMediaAccess(){
      navigator
        .mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then(this.onMediaAccess, this.onForbidMediaAccess)
    },
    createConnection (cb){
      // let url = this.stream.region
      this.error = null
      const webRTCPublishUrl = this.getStreamUrl()

      const websocket = new WebSocket(webRTCPublishUrl);

      websocket.onopen = () => {
        const peerConn = new window.RTCPeerConnection(null);
        peerConn.stream_id = "local1";
        peerConn.onicecandidate = this.onIceCandidate;
        
        this.peerConn = peerConn
        
        // const mediaStream = this.videoPlayer.srcObject
        // if (!mediaStream)
        //   this.requestMediaAccess()
        // else 
        //   this.onMediaAccess(mediaStream)
        cb()
      }

      websocket.onerror = (err,e) => {
        console.log('error', err,e)
        console.log(websocket)
        this.error=true
        this.pushReady=false
      }

      websocket.onmessage = this.onWebSocketMessage;
      this.websocket = websocket
    },
    onMediaAccess (stream) {
      this.webrtcEnabled = true
      this.permissionHappened = true
      
      this.videoPlayer.srcObject = stream;
      this.toggleMute(this.muted)

      if (!this.pushReady) return
      this.startStreaming()
    },
    stopMediaAccess () {
      if (!this.videoPlayer || !this.videoPlayer.srcObject) return
      const mediaStream = this.videoPlayer.srcObject
      _.each(mediaStream.getTracks(), (streamTrack) => {
        streamTrack.stop()
      })

      this.videoPlayer.srcObject = null
    },
    startStreaming () {
      const stream = this.videoPlayer.srcObject
      const peerConn = this.peerConn
      peerConn.addStream(stream);

      const peerOffer = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      }

      peerConn
        .createOffer(peerOffer)
        .then((description) => {
          peerConn.setLocalDescription(description);
          this.sendWebSocketMessage(peerConn.localDescription)
        })

      this.$emit('stream-started')
    },
    stopStreaming () {
      if (!this.websocket) return

      this.websocket.close()
      this.$emit('stream-stopped')
      this.websocket = null
    },
    onForbidMediaAccess () {
      console.log('action forbid by user')
      this.permissionHappened = true
    },
    sendWebSocketMessage (payload) {
      this.websocket.send(JSON.stringify(payload));
    },
    onIceCandidate () {
      var candidate = event.candidate;
      if (candidate)
        this.sendWebSocketMessage({
          type: 'candidate',
          stream_id : "local1",
          label: candidate.sdpMLineIndex,
          id: candidate.sdpMid,
          candidate: candidate
        });

    },
    onWebSocketMessage(event) {
      const peerConn = this.peerConn
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case "answer":
          let description = new window.RTCSessionDescription(message);
          peerConn.setRemoteDescription(description);
          break;
        case "candidate":
          let candidate = new window.RTCIceCandidate(message.candidate);
          peerConn.addIceCandidate(candidate);
          break;
      }
    },
    getStreamUrl () {
      // const hostname = _.get(this.stream, 'region.hostname')
      // return `ws://${hostname}:80/${this.stream.key}/webrtc/publish`
      let subhost = _.get(this.stream, 'region.identifierHaxr')
      let hostname = `${subhost}.origincdn.com`
      return `wss://${hostname}:443/${this.stream.key}/webrtc/publish`
    }
  }
};
</script>

<style>
.player-controls-wrapper {
  display: flex;
  align-items: flex-end;
  height: inherit;
  width: 100%;
  position: absolute;
  z-index: 1;
}
.player-controls {
  height: 40px;
  width: 100%;
  /* background-color: rgba(1, 3, 41, 0.55); */
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 3px;
  transition: all 0.2s ease-in-out;
}
.player-controls-wrapper:hover .player-controls {
  background-color: rgba(1, 3, 41, 0.95);
}
.player-control {
  border: none !important;
  color: #ffffff;
  background-color: transparent;
  padding: 3px 14px;
  border-radius: 6px;
  outline: none !important;
  font-size: 18px;
  cursor: pointer;
}
.player-control:hover {
  background-color: #000;
}

#preview-player {
  margin: 10px 0;
  height: 100%;
}

#preview-player [data-player] {
  max-width: 100%;
}

#preview-player [data-no-op-msg] {
  font-size: 1.15em;
  padding: 0 10%;
  text-align: center;
}

#preview-player .player-poster {
  /* background-size: auto 100%; */
  background-size: 105% auto;
  border-radius: 4px;
}
#preview-player .container[data-container] {
  max-width: 100%;
}

.player-container {
  border: none !important;
  height: inherit;
  position: relative;
  overflow: hidden;
}
#webcam-player {
  position: relative;
  width: 100%;
  max-width: 350px;
  max-height: 220px;
}
.mbr-controls {
  display: none;
}

div.player-error-screen__content[data-error-screen] {
  margin-top: 0;
  font-size: 12px;
}
div.player-error-screen__title[data-error-screen] {
  font-weight: 400;
  line-height: auto;
}
div.player-error-screen__message[data-error-screen] {
  text-transform: lowercase;
}
div.player-error-screen__code[data-error-screen] {
  display: none;
}
.player-loading-indicator {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: inherit;
  font-size: 13.5px;
}
.player-loading-indicator .fa-spin {
  font-size: 16px;
  margin-bottom: 6px;
}
.player-loading-indicator .icon {
  font-size: 22px;
  margin-bottom: 8px;
  text-align: center;
}
.video-controls {
  background-color: rgba(1, 3, 41, 0.56);
  color: black;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: inherit;
  width: 100%;
  z-index: 99;
}
.video-controls.stream-ready {
  background-color: transparent !important;
}
.video-controls > div {
  opacity: 1;
  width: 100%;
}
.video-controls:hover > div {
  opacity: 1;
}
.video-controls button {
  background-color: #dc3545 !important;
}
.video-controls button:hover {
  opacity: 0.75;
}
.video-controls .head {
  flex:0.75;
  padding: 10px;
}
.video-controls .main {
  flex:2;
}
.video-controls .main .actions-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
.video-controls .main .actions-container button {
  padding-left: 15px;
  padding-right: 15px;
}
.video-controls .bottom {
  flex:0.7;
  padding: 0 20px;
}
.video-controls .bottom .actions-container {
  text-shadow: 0 0 4px rgba(0,0,0, 0.15)
}
.video-controls .rec-icon {
    display: inline-block;
    background: #e22537;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
     padding-top: 4px;
    line-height: 11px;
    padding-bottom: 5px;
}
.blurred {
  filter: blur(1.5px);
}
</style>
