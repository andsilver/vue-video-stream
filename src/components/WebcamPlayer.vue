<template>
  <div>
    <div class="player-container">
      <div v-if="!permissionHappened" 
           class="player-loading-indicator">waiting for camera access</div>

      <div v-else-if="!webrtcEnabled" 
           class="player-loading-indicator">
        <div>
          <div class="icon"><i class="fas fa-video"></i></div>
          <div>Camera access was forbidden</div>
          <div style="font-size: 12px;">Kindly allow media access to proceed</div>
        </div>
      </div>

      <video v-show="webrtcEnabled" id="webcam-player" controls autoplay></video>
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
  props: ["stream", "pushReady"],
  mounted() {
    const video = document.getElementById("webcam-player");

    this.videoPlayer = video
    this.createConnection()

  },
  destroyed() {
    this.scopeAlive = false;
    this.stopMediaAccess ()
    
    this.$emit('stream-stopped')
  },
  data() {
    return {
      scopeAlive: true,
      webrtcEnabled: false,
      permissionHappened: false,
      playback: false,
      websocket: null,
      peerConn: null,
      videoPlayer: null
    };
  },
  methods: {
    requestMediaAccess(){
      navigator
        .mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then(this.onMediaAccess, this.onForbidMediaAccess)
    },
    stopMediaAccess () {
      if (!this.videoPlayer || !this.videoPlayer.srcObject) return
      const mediaStream = this.videoPlayer.srcObject
      _.each(mediaStream.getTracks(), (streamTrack) => {
        streamTrack.stop()
      })

      this.videoPlayer.srcObject = null
    },
    createConnection (){
      // let url = this.stream.region
      const webRTCPublishUrl = this.getStreamUrl()

      const websocket = new WebSocket(webRTCPublishUrl);
      websocket.onopen = () => {
        const peerConn = new window.RTCPeerConnection(null);
        peerConn.stream_id = "local1";
        peerConn.onicecandidate = this.onIceCandidate;
        
        this.peerConn = peerConn
        this.requestMediaAccess()
      }

      websocket.onmessage = this.onWebSocketMessage;
      this.websocket = websocket
    },
    onMediaAccess (stream) {
      this.webrtcEnabled = true
      this.permissionHappened = true
      
      this.videoPlayer.srcObject = stream;

      if (!this.pushReady) return
      this.startStreaming()

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
  background-color: rgba(1, 3, 41, 0.55);
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
  border: none;
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
  border: 1px solid black;
  height: inherit;
  position: relative;
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
</style>
