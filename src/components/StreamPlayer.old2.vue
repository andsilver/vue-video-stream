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
import FlussonicMsePlayer from '@flussonic/flussonic-mse-player'

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
        ratio: 3 / 4,
        sources: [{ type: "video/flash", src: `mp4:${this.stream.key}` }]
      },
      rtmp: this.getRtmpServerAddr(),
      swf: "http://sg.origincdn.com:3000/static/flowplayer/flowplayer.swf",
      bgcolor: "#000000",
      volume: 0
    });

    setTimeout(() => {
    const messageNode = window.document.querySelector('.fp-message')
    if (!messageNode) return
    
    const html = messageNode.innerHTML;
      this.flashDisabled = /installing\s*adobe\s*flash./gi.test(html)
      console.log(this.flashDisabled)
    }, 200)

    console.log(this.getRtmpServerAddr());
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
    getRtmpServerAddr() {
      const { region } = this.stream;
      const url = `rtmp://${region.hostname}:1977/static/`;
      return url;
    }
  }
};
</script>

<style>
#preview-player {
  margin: 10px 0;
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
</style>
