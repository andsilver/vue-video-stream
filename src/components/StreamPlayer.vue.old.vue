<template>
  <div id="preview-player"></div>
</template>

<script>
import StreamService from "../services/StreamService";


const playerContainerId = '#preview-player'
const ClapprConfig = {
  hls: {}
}

let thumbsTempContainer
export default {
  name: "StreamPlayer",
  props: ["stream"],
  mounted() {
    
    window.document.querySelector(playerContainerId).innerHTML = ''
    flowplayer(playerContainerId, {
      clip: {
        title: "Flowplayer RTMP Playback",
        ratio: 3/4,
        sources: [
          { type: "video/flash", src:  "mp4:b35b96c062ca11e8a0d5bf502ce17b76" }
        ]
      },
      rtmp: "rtmp://sg.origincdn.com:1977/static/",
      swf: "http://localhost:8080/static/flowplayer/flowplayer.swf",
      bgcolor: '#000000',
      volume: 0
    });

    return

    // setup player, begin playback
    const playbackConfig = _.assign({
      source: this.getStreamUrl(),
      width: "",
      height: "100%",
      mute: true,
      autoPlay: true,
      // chromeless: true,
      parentId: playerContainerId,
    }, ClapprConfig)

    this.videoPlayer = new Clappr.Player(playbackConfig)
  },
  // mounted() {

  //   window.document.querySelector(playerContainerId).innerHTML = ''
  //   // setup player, begin playback
  //   const playbackConfig = _.assign({
  //     source: this.getStreamUrl(),
  //     width: "",
  //     height: "100%",
  //     mute: true,
  //     autoPlay: true,
  //     // chromeless: true,
  //     parentId: playerContainerId,
  //   }, ClapprConfig)

  //   this.videoPlayer = new Clappr.Player(playbackConfig)
  // },
  destroyed () {
    this.scopeAlive = false
  },
  data() {
    return {
      scopeAlive: true,
      videoPlayer: null
    };
  },
  methods: {
    getStreamUrl () {
      const {key, region} = this.stream
      const url = `http://${region.hostname}/${key}/index.m3u8`
      return url
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
