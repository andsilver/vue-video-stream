<template>
  <div>
    <div v-if="flashDisabled" id="jsFlash">
      <a href="http://get.adobe.com/flashplayer">
        <img src="https://restream.io/img/install_flash.png" 
             alt="Install flash player" 
             width="100%" />
      </a>
    </div>
    <div v-show="!flashDisabled" id="preview-player"></div>
  </div>
</template>

<script>
import StreamService from "../services/StreamService";

const playerContainerId = "#preview-player";

let thumbsTempContainer;
export default {
  name: "StreamPlayer",
  props: ["stream"],
  mounted() {
    window.document.querySelector(playerContainerId).innerHTML = "";
    flowplayer(playerContainerId, {
      clip: {
        title: this.stream.name,
        ratio: 3 / 3,
        sources: [{ type: "video/flash", src: `mp4:${this.stream.key}` }]
      },
      rtmp: this.getRTMPServerURL(),
      // swf: "http://sg.origincdn.com:3000/static/flowplayer/flowplayer.swf",
      bgcolor: "#000000",
      volume: 1
    });

    setTimeout(() => {
      const messageNode = window.document.querySelector(".fp-message");
      if (!messageNode) return;

      const html = messageNode.innerHTML;
      this.flashDisabled = /installing\s*adobe\s*flash./gi.test(html);
      console.log(this.flashDisabled);
    }, 200);

    console.log(this.getRTMPServerURL());
  },
  destroyed() {
    this.scopeAlive = false;
  },
  data() {
    return {
      scopeAlive: true,
      flashDisabled: false,
      videoPlayer: null
    };
  },
  methods: {
    getRTMPServerURL() {
      const { region } = this.stream;
      const url = `rtmp://${region.hostname}/static/`;
      return url;
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
  /* margin: 10px 0; */
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
#player {
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
  font-size: 11.5px;
}
.player-loading-indicator .fa-spin {
  font-size: 16px;
  margin-bottom: 6px;
}
</style>
