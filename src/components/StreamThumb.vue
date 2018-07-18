<template>
  <div class="thumb" 
         :style="{'background-image': streamThumb && `url(${streamThumb})` || ''}">
       <div v-show="!streamThumb"
            class="placeholder">
         <span v-if="stream.enabled" class="message">Waiting for frames</span>
         <span v-else class="message">Disabled stream</span>
       </div>
  </div>
</template>

<script>
import StreamService from "../services/StreamService";

let thumbsTempContainer
export default {
  name: "StreamThumb",
  props: ["stream"],
  mounted() {
    const slug = this.stream.key;
    const blockId = this.stream._id;
    const regionId = this.stream.haxrBlockRegion;

    if (regionId) 
      this.$socket.emit("stream.thumb", slug, regionId);

    this.$socket.on("stream.thumb", (res) => {
      if (res.id !== slug || 
      !this.scopeAlive) return;

      this.onThumb(res.data, () => {
        this.$socket.emit("stream.thumb", slug, regionId);
      });
    });

    thumbsTempContainer = window.document.getElementById('thumb-temp-loader')
  },
  destroyed () {
    this.scopeAlive = false
  },
  data() {
    return {
      scopeAlive: true,
      streamThumb: null
    };
  },
  methods: {
    onThumb(arrayBuffer, cb) {
      const oldBlobUrl = this.streamThumb;

      let blobSrc
      try {
        
        if (arrayBuffer) {
          let blob = new Blob([new Uint8Array(arrayBuffer)], {
            type: "image/jpeg"
          });
          let blobSrc = window.URL.createObjectURL(blob);

          // setup stream
          const IMG = window.document.createElement('img')
          IMG.onload = () => {
            this.streamThumb = blobSrc
            setTimeout(cb, 3000)
            cb = null
          }

          IMG.setAttribute('src', blobSrc)

          thumbsTempContainer.appendChild(IMG)
          thumbsTempContainer.removeChild(IMG)
        }

      } catch (e) {console.log('err', e)}

      if (oldBlobUrl) 
        window.URL.revokeObjectURL(oldBlobUrl);

      setTimeout(() => {
        if (cb) cb()
      }, 5000)
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.thumb {
  width: inherit;
  height: 100%;
  background-size: 100% auto;
  background-position: center center;
}
.thumb .placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: inherit;
}
.thumb .placeholder .message{
  display: inline-block;
  font-size: 16px;
  /* text-transform: capitalize; */
  color: #959595;
}
</style>
