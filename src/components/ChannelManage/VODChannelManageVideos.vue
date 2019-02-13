<template>
    <div class="container view-wrapper" style="padding:0">
      <div v-if="processing">
        <div class="page-placeholder" style="height:200px">
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
      <div v-else>
        <input id="video-input" type="file" style="visibility:hidden;"/>

        <div v-if="!videoFiles.length" class="text-center">
          <div style="font-size: 15.5px;">
            <p>No Videos files uploaded yet</p>
          </div>
          <button class="btn btn-primary btn-lg"
                      @click="triggerFileUpload">
                      <i class="fas fa-plus"></i>
                      Upload Video</button>
        </div>
        <div v-else>
          
          <b-row>
            
            <b-col>
              <button class="btn btn-primary"
                      @click="triggerFileUpload">
                      <i class="fas fa-plus"></i>
                      Upload Video</button>              
              <!-- <button class="btn btn-link">Clear All</button> -->
            </b-col>

          </b-row>

          <br>

          <div class="video-list">
            <div class="video-item-header">
              <b-row>
                <b-col cols="4">
                  <b-row>
                    <!-- <b-col cols="1"></b-col> -->
                    <b-col col>Media Clip</b-col>
                  </b-row>

                </b-col>
                <b-col cols="1" style="padding-left:0;">Duration</b-col>
                <b-col cols="2">Size</b-col>
                <b-col cols="2">Creation</b-col>
                <b-col></b-col>
              </b-row>
            </div>
            <!-- <div v-for="(video, index) in videoFiles" -->
            <div v-for="(video, index) in sortedVideoFiles"
                 :key="video.id"
                 class="video-item"
                 :class="{ uploadable: video.uploadable, expanded: video.expanded }">
              <b-row>
                <b-col cols="4" style="padding-top:3px;font-size:14.5px;">
                  <b-row>
                    <!-- <b-col cols="4">
                      <img class="video-thumb" />
                    </b-col> -->
                    <!-- <b-col cols="1">
                      <span class="fas toggle-control"
                            :class="{ 'fa-toggle-on enabled': video.enabled, 
                                      'fa-toggle-off': !video.enabled,
                                      'status-processing': video.file || video.statusProcessing }"
                             @click="toggleVideoStatus(video.id) "></span>

                    </b-col> -->
                    <b-col>
                      <!-- <input class="input"
                          :value="getHlsUrl(video)"
                          placeholder="media hls url"
                          readonly/> -->
                      <!-- <div style="font-size:13px;word-break:break-word;">{{video.fileName}}</div> -->
                      <code class="video-name" style="font-size:14px;">&nbsp;{{video.fileName}}</code>
                    </b-col>
                  </b-row>
                </b-col>
                
                <b-col  cols="1" style="padding-left:0;">
                  <div v-if="video.mediaInfo">
                    <span v-if="video.mediaInfo.duration<60">{{video.mediaInfo.duration}} <small>SECS</small> </span>
                    <span v-else-if="video.mediaInfo.duration">{{video.mediaInfo.duration/60|number}} <small>MINS</small> </span>
                    <span v-else>n/a</span>
                  </div>
                </b-col>
                
                <b-col cols="2">

                  <span v-if="video.bytes">
                    {{ video.bytes | bytes }}
                    &nbsp;
                  </span>

                  <div v-else class="inline-block">
                    <!-- <span v-if="video.mediaInfo">{{video.mediaInfo.width}} x {{video.mediaInfo.height}}</span>
                    &nbsp; -->
                    
                    <!-- <code v-if="video.mediaInfo" style="font-size:13px;">{{video.mediaInfo.fps}} FPS</code>
                    &nbsp; -->

                    <!-- media codecs -->
                    <!-- <span v-if="video.mediaInfo && video.mediaInfo.codecs">
                      <span v-for="(codec, index) in video.mediaInfo.codecs" 
                            :key="index" 
                            v-if="codec.type !== 'general'"
                            class="media-codec"
                            :class="codec.type">{{codec.codec}}</span>
                    </span> -->
                  </div>

                </b-col>
                <b-col cols="2">

                  <div v-if="video.uploadable" 
                       class="upload-wrapper">

                    <div v-if="video.uploading">
                      <b-progress :value="video.uploadProgress || 0"
                                  :max="100" 
                                  show-progress 
                                  animated></b-progress>
                      <!-- <button class="badge">UPLOADING ..</button> -->
                    </div>
                    <button v-else class="video-action-btn">awaiting upload</button>

                  </div>
                  <div v-else>{{ video.creationTime | date }}</div>

                </b-col>
                
                <b-col>

                  <div v-if="video.uploadable">
                    <button v-if="!video.uploading" 
                            class="btn btn-primary btn-sm" 
                            @click="uploadVideoFile(video.id)">Upload</button>
                    <button v-show="video.uploading"
                            class="btn btn-link btn-sm" 
                            @click="cancelVideoUpload(video.id)">Cancel</button>
                    <button v-show="!video.uploading"
                            class="btn btn-link btn-sm" 
                            @click="removeVideoFile(video.id)">Remove</button>
                  </div>
                  <div v-else>
                    <div v-if="video.removing">
                      <code>removing ..</code>
                    </div>
                    <div v-else>
                      <!-- &nbsp;<button class="video-action-btn"  -->
                      <button class="btn btn-link btn-sm"
                              style="border:1px solid;" 
                              @click="toggleExpand(index)">
                              {{ video.expanded ? 'Less' : 'More' }}
                              <!-- <i class="fa fa-angle-down"></i> -->
                      </button>
                              
                      &nbsp;<button class="btn btn-danger btn-sm" 
                              @click="playVideo(video)">
                              <!-- <i class="fa fa-play"></i> -->
                              Play
                              </button>

                      &nbsp;<button class="btn btn-primary btn-sm" 
                              @click="clipboardCopy(getHlsUrl(video))">HLS</button>

                      
                      
                      &nbsp;<button class="btn btn-danger btn-sm" 
                              @click="requestVideoRemoval(video.id)">Delete</button>

                    </div>
                  </div>

                </b-col>

              </b-row>

              <div style="margin-top:15px;">
                <b-row>
                  <!-- <b-col cols="4">
                    <div class="field-container" style="margin-bottom:10px;">
                      <div class="label">&nbsp;Video Id</div>
                      <code>&nbsp;{{video.id}}</code>
                    </div>
                  </b-col> -->
                  <b-col>
                    <div class="field-container" style="margin-bottom:10px;">
                      <div class="label">&nbsp;Media</div>
                      <!-- <code>&nbsp;{{video.creationTime | date}}</code> -->
                      &nbsp;<span v-if="video.mediaInfo">{{video.mediaInfo.width}} x {{video.mediaInfo.height}}</span>
                      &nbsp;
                      
                      <code v-if="video.mediaInfo" style="font-size:13px;">{{video.mediaInfo.fps}} FPS</code>
                      &nbsp;

                      <!-- media codecs -->
                      <span v-if="video.mediaInfo && video.mediaInfo.codecs">
                        <span v-for="(codec, index) in video.mediaInfo.codecs" 
                              :key="index" 
                              v-if="codec.type !== 'general'"
                              class="media-codec"
                              :class="codec.type">{{codec.codec}}</span>
                      </span>
                    </div>
                  </b-col>
                </b-row>
                <div class="field-container">
                    <button class="modal-button modal-button-sm highlight badge-button"
                            @click="clipboardCopy(getHlsUrl(video))">Copy</button>
                    <div class="label">&nbsp;HLS Url</div>
                    <code class="input">{{getHlsUrl(video)}}</code>
                </div>
                <br>
                <div class="field-container">
                    <button class="modal-button modal-button-sm highlight badge-button"
                            @click="clipboardCopy(getPlayerUrl(video))">Copy</button>
                    <div class="label">&nbsp;Embed Url</div>
                    <code class="input">{{getPlayerUrl(video)}}</code>
                </div>
                <br>
                <div class="field-container">
                    <button class="modal-button modal-button-sm highlight badge-button"
                            @click="clipboardCopy(getEpisodeIframeSnippet(video))">Copy</button>
                    <div class="label">&nbsp;Iframe Snippet</div>
                    <code class="input" style="padding-right:60px;">{{getEpisodeIframeSnippet(video)}}</code>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <vod-video-modal :stream="stream" :video="selectedVideo"></vod-video-modal>
      
      <alert-modal modal-id="alert-video-encoding" 
                     message="Only MP4 Videos are allowed. Please upload video with appropriate encoding/format"
                     okText="Got it, thanks"></alert-modal>
      
      <alert-modal modal-id="alert-video-size" 
                   message="You can upload media with size upto of 50MB only"
                   okText="Fine"></alert-modal>

      <alert-modal modal-id="alert-leaving-active-uploads"
                   message="Video(s) are being uploaded. Please cancel active uploads before leaving"
                   okText="Fine"></alert-modal>
      
      <confirm-modal modal-id="confirm-video-removal" 
                     :message="'You are about to delete video named `' + (focusedVideo && focusedVideo.fileName || '') + '`'"
                     okText="Delete"
                     cancelText="Keep"
                     @modal-confirm="removeVideoFile()"></confirm-modal>

  </div>
</template>
<script>
import Vue from 'vue'
import ConfirmModal from "@/components/ConfirmModal.vue";
import AlertModal from "@/components/AlertModal.vue";
import VodVideoModal from "@/components/VODVideoModal.vue";
import StreamService from '@/services/StreamService'
import utils from '@/utils'

const MaxVideoUploadSize = 50 * 1024 * 1024

export default {
  name: "VODChannelManageVideos",
  props: ['stream'],
  beforeRouteLeave (to, from, next) {

    let videosUploading = _.filter(this.videoFiles, { uploading: true })
    if (_.size(videosUploading)) {
      this.$root.$emit('bv::show::modal', 'alert-leaving-active-uploads')
      return
    }

    next()

    next()
  },
  async mounted () {
    
    try {
      this.videoFiles = await StreamService.getStreamPlaylist(this.stream._id)
    } catch (e) {
      this.$notify({ group: 'error', text: 'could not retreive playlist videos' })
    }

    this.videoFiles = _.compact(this.videoFiles).map((videoFile) => {
      videoFile.expanded = false
      videoFile.removing = false
      videoFile.statusProcessing = false
      videoFile.uploadTime = new Date(videoFile.uploadTime)
      
      return videoFile
    })


    this.$emit('video-files', this.videoFiles)

    this.processing = false
    
    setTimeout(() => this.initVideoUpload(), 1000)
  },
  data () {
    return {
      processing: true,
      focusedVideo: {},
      videoFiles: [],
      selectedVideo: null
    }
  },
  computed: {
    sortedVideoFiles () {
      const list = []
      _.each(this.videoFiles, (video) => {
        let item = _.assign({}, video, {
          precedence: video.precedence + (video.file ? -999 : 0)
        })

        list.push(item)
      })

      return _.sortBy(list, vid => vid.precedence)
    }
  },
  methods: {
    playVideo (video) {
      if (!video) return
      this.selectedVideo = video
      this.$root.$emit("bv::show::modal", "modal-vod-video")
      console.log('video', video)
    },
    clipboardCopy (text) {
      try {
        if (text instanceof Function) 
          text = text()

        this.$copyText(text);
        this.$notify({ group: "info", text: "Copied to clipboard" });
      } catch (e) {}
    },
    toggleExpand (index) {
      const video = this.videoFiles[index]
      let nstate = !video.expanded
      this.videoFiles = utils.updateArrayItem(this.videoFiles, _.assign({}, video, { expanded: nstate }), index)
      // this.videoFiles[index] = 
      // console.log(this.videoFiles[index])
    },
    getHlsUrl (video) {
      if (!this.stream) return
      let hostname = this.stream.region.hostnameCDN || this.stream.region.hostname
      let hls = `https://${hostname}/${this.stream.key}/${video.id}/index.m3u8`
      return hls
    },
    getPlayerUrl (video) {
      // let playerUri = 'https://player.castr.io/embed?src='+this.getHlsUrl(video)
      let playerUri = `https://player.castr.io/vod/${this.stream.key}/${video.id}`
      return playerUri
    },
    getEpisodeIframeSnippet (video) {
      let iframeSrc = this.getPlayerUrl(video)
      return `<iframe src="${iframeSrc}" frameborder="0" width="590" height="430" allow="autoplay"  scrolling="no"  allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>`
    },
    initVideoUpload () {
      const el = document.getElementById('video-input')
      if (!el) {
        setTimeout(() => this.initVideoUpload(), 1000)
        return
      }

      const vm = this
      el.onchange = function (e) {
        // console.log('this.files', this.files)

        let file = _.head(this.files)

        if (!file) return
        
        if (file.type !== 'video/mp4') {
          vm.$root.$emit("bv::show::modal", "alert-video-encoding")
          el.value = null
          return
        }
        
        if (file.size > MaxVideoUploadSize) {
          vm.$root.$emit("bv::show::modal", "alert-video-size")
          el.value = null
          return
        }
        

        let newVideo = {
          id: 'unnamed_' + Date.now(),
          fileName: file.name,
          bytes: file.size,
          mediaInfo: {},
          precedence: 0,
          enabled: true,
          removing: false,
          statusProcessing: false,

          file,
          uploadable: true,
          uploading: false,
          uploadProgress: 0
          // precedence: -1
        }

        vm.videoFiles = [newVideo, ...vm.videoFiles]
        el.value = null
      }
    },
    triggerFileUpload () {
      document.getElementById('video-input').click()
    },
    uploadVideoFile (videoId) {
      const video = _.find(this.videoFiles, { id: videoId })
      if (!video.file || video.uploading) return

      video.uploading = true
      // video.precedence = this.computeVideoPrecedence(video)
      const onBytes = (uploaded) => {
        // console.log('blob uploaded', uploaded)
        video.uploadProgress = uploaded
      }

      const cancelSource = Vue.axios.CancelToken.source();
      video.cancelSource = cancelSource

      const uploadHandle = StreamService.uploadStreamPlaylistVideo(
        // this.stream._id, 
        this.stream.key, 
        video.file, 
        onBytes, 
        cancelSource.token)

      uploadHandle
        .then((res) => void this.onVideoUploaded(video, res))
        .catch((e) => {
          video.uploadProgress = 0
          video.uploadError = true
          console.log('upload error', e)
        })
        .finally(() => {
          video.uploading = false
        })
    },
    async onVideoUploaded (video, uploadResult) {
      if (!uploadResult || !uploadResult.fileId) return

      video.id = uploadResult.fileId
      video.mediaInfo = _.assign({}, uploadResult.mediaInfo)
      video.creationTime = new Date()

      this.$emit('video-files', this.videoFiles)
      // video.precedence = this.computeVideoPrecedence(video)

      const videoMeta = await this.saveVideoMeta(video)
      if (!videoMeta) {
        // place error
        return
      }

      video.uploadable = false
      video.file = null
      // console.log('video', video)

      const videoIndex = this.videoFiles.indexOf(video)
      let newVideoArray = utils.removeArrayItem(this.videoFiles, videoIndex)

      this.videoFiles = [...newVideoArray, video]

    },
    async saveVideoMeta (video) {
      const videoMeta = _.pick(video, ['id', 'fileName', 'bytes', 'mediaInfo', 'precedence'])

      try {
        await StreamService.saveStreamPlaylistVideo(this.stream._id, videoMeta)
      } catch(e) {
        console.log('error', e)
      }

      return videoMeta
    },
    async requestVideoRemoval (videoId) {
      const video = _.find(this.videoFiles, { id: videoId })
      this.focusedVideo = video
      this.$root.$emit("bv::show::modal", "confirm-video-removal");
    },
    cancelVideoUpload (videoId) {
      videoId = videoId || this.focusedVideo.id
      const video = _.find(this.videoFiles, { id: videoId })

      if (!video || !video.cancelSource) return

      video.cancelSource.cancel()
      video.uploading = false
    },
    async removeVideoFile (videoId) {
      videoId = videoId || this.focusedVideo.id
      const video = _.find(this.videoFiles, { id: videoId })
      video.removing = true

      if (!video.uploadable) {
        // removal api request
        await StreamService.removeStreamPlaylistVideo(this.stream._id, videoId)
        
        StreamService
          .deleteStreamPlaylistVideoFile(this.stream.key, videoId)
          .catch((e) => {
            console.log('playlist video removal error', e)
          })
      }

      if (video.file || video.uploading) {
        video.cancelSource.cancel()
        console.log('uploading cancelled with success')
      }

      let index = this.videoFiles.indexOf(video)
      this.videoFiles.splice(index, 1)

      this.$emit('video-files', this.videoFiles)
    }
  },
  components: {
    AlertModal,
    ConfirmModal,
    VodVideoModal
  }
};

function imageReader(file, cb) {
  if (!file) {
    return;
  }

  var reader = new FileReader();
  reader.onload = function() {
    if (cb) {
      cb(reader.result);
    }
  };

  reader.readAsDataURL(file);
}

</script>
<style scoped>
.view-wrapper {
  margin-top: 25px;
}
.pane-label {
  text-transform: uppercase;
  font-size: 13px;
}
.video-list {

}
.video-item-header {
  padding: 11px;
  /* margin-bottom: 3px; */
  /* border-bottom: 1px solid rgb(44, 46, 82); */
  font-size: 12.5px;
}
.video-item {
  padding: 11px;
  height: 45px;
  overflow: hidden;
  margin-bottom: 3px;
  border-radius: 4px;
  background-color: #202940;
  border-bottom: 1px solid rgb(44, 46, 82);
  font-size: 14px;
}
.video-item.expanded {
  height: auto;
  margin-bottom:10px;
}
.video-item:last-of-type {
  border-bottom: none;
}
.video-item.uploadable {
  background-color: rgba(33,42,71,0.2515);
}
.video-item > * > * {
  vertical-align: middle;
}
.video-item .video-name {
  word-break: break-word;
  height: 18px;
  display: inline-block;
  overflow: hidden;
}
.video-item .button {
    display: inline-block;
    /* background: #3096ff; */
    background: #282c83;
    border: none;
    padding: 2px 9px;
    color: white;
    border-radius: 2px;
    font-size: 13px;
    cursor: pointer;;
}
.video-item .button:hover {
  background-color: #2c76c1 !important;
}
.video-item .video-thumb {
  width: 120px;
  height: 74px;
  background-color: #000;
  border-radius: 2px;
  border: none;
}
.input {
  width: 400px;
  /* min-height: 120px; */
  font-size: 12px;
      background: #37384e;
    border: 1px solid rgba(0,123,255,0.58);
    color: white;
    padding: 2px 10px;
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
.video-action-btn {
  font-size: 12px;
  border: none;
  border-radius: 2px;
  padding: 3px 6px 2px 6px;
  background-color: rgb(40, 44, 131);
  color: #ffffff;
  cursor: pointer;
}
.video-action-btn:hover{
  opacity: 0.8;
}
.video-action-btn:active{
  opacity: 0.95;
}
.video-action-btn.delete {
  background-color: #be3a47;
}
</style>
<style>
.embed-dropdown-wrapper .dropdown-menu {
  background-color: rgb(55, 56, 78);
}
.embed-dropdown-wrapper .btn-group > button {
  margin: 0;
    padding: 0;
    border: none;
    background: transparent;
}
.toggle-control {
  font-size: 18px;
  /* float: right; */
  color: #ffffff;
  margin: 0 0 0 0;
  transition: all 0.2s linear;
  cursor: pointer;
}
.toggle-control.enabled {
  color: #02ffa2;
  /* color: greenyellow; */
}
.toggle-control.status-processing {
  cursor: not-allowed;
  opacity: 0.65;
  color: #ffffff;
}
.upload-wrapper {
  width: 100%;
}
.progress {
  height: 18px;
}

.field-container {
  /* width: 235px; */
  width: 100%;
  padding: 0;
  position:relative;
}
.field-container-sm {
  padding:0;
}
.field-container:last-of-type {
  border-bottom: none;
}
.field-container .label {
  font-size: 12px;
  opacity: 0.65;
  margin-bottom:3px;
  text-transform: capitalize;
}
.field-container .input {
  display: block;
  width: 100%;
  height: auto !important;
  /* margin: 10px 0 10px 0; */
  margin: 0;
  padding: 7px 12px;
  color: #ffffff;
  /* background-color: #010329; */
  background-color: #27375d;
  border: none;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);
  outline-color: #0074fc;
}
.field-container .input:focus {
  background-color: rgba(18, 23, 37, 0.67);
}
.field-container .input:read-only:focus {
  background-color: rgb(42, 49, 68);
}
.field-container .badge-button {
  opacity: 0;
  font-size:11px;
  padding: 4px 9px;
  position: absolute;
  right: 6px;
  top: 25px;
  pointer-events: none;
  transition: all 0.15s linear;
}
.field-container:hover .badge-button {
  opacity:1;
  pointer-events: inherit;
}
.field-container-sm .badge-button {
  top: 8px;
}
</style>