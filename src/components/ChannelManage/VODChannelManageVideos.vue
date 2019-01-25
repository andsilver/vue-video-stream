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
                      @click="triggerFileUpload">Upload Video</button>
        </div>
        <div v-else>
          
          <b-row>
            
            <b-col>
              <button class="btn btn-primary"
                      @click="triggerFileUpload">Upload Video</button>              
              <!-- <button class="btn btn-link">Clear All</button> -->
            </b-col>

          </b-row>

          <br>

          <div class="video-list">
            <div class="video-item-header">
              <b-row>
                <b-col cols="5">
                  <b-row>
                    <b-col cols="1"></b-col>
                    <b-col col>Clip</b-col>
                  </b-row>

                </b-col>
                <b-col cols="1">Duration</b-col>
                <b-col cols="4">Media</b-col>
                <b-col></b-col>
              </b-row>
            </div>
            <!-- <div v-for="(video, index) in videoFiles" -->
            <div v-for="video in sortedVideoFiles"
                 :key="video.id"
                 class="video-item"
                 :class="{ uploadable: video.uploadable }">
              <b-row>
                <b-col cols="5" style="padding-top:3px;font-size:14.5px;">
                  <b-row>
                    <!-- <b-col cols="4">
                      <img class="video-thumb" />
                    </b-col> -->
                    <b-col cols="1">
                      <span class="fas toggle-control"
                            :class="{ 'fa-toggle-on enabled': video.enabled, 
                                      'fa-toggle-off': !video.enabled,
                                      'status-processing': video.file || video.statusProcessing }"
                             @click="toggleVideoStatus(video.id) "></span>

                    </b-col>
                    <b-col>
                      <div style="font-size:13px;word-break:break-word;">{{video.fileName}}</div>
                      <code>{{video.id}}</code>
                    </b-col>
                  </b-row>
                </b-col>
                
                <b-col  cols="1">
                  <div v-if="video.mediaInfo">
                    <span v-if="video.mediaInfo.duration<60">{{video.mediaInfo.duration}} secs</span>
                    <span v-else-if="video.mediaInfo.duration">{{video.mediaInfo.duration/60|number}} mins</span>
                    <span v-else>n/a</span>
                  </div>
                </b-col>
                
                <b-col cols="4">

                  <span v-if="video.bytes">
                    {{ video.bytes | bytes }}
                    &nbsp;
                  </span>

                  <div v-if="video.uploadable" 
                       class="inline-block upload-wrapper">

                    <div v-if="video.uploading">
                      <b-progress :value="video.uploadProgress || 0"
                                  :max="100" 
                                  show-progress 
                                  animated></b-progress>
                      <!-- <button class="badge">UPLOADING ..</button> -->
                    </div>
                    <button v-else class="video-action-btn">awaiting upload</button>

                  </div>

                  <div v-else class="inline-block">
                    <span v-if="video.mediaInfo">{{video.mediaInfo.width}} x {{video.mediaInfo.height}}</span>
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
                      <button v-if="canMoveVideo(video.id, -1)"
                              class="video-action-btn"
                              @click="moveVideoFile(video.id, -1)">Up</button>
                      
                      <button v-if="canMoveVideo(video.id, 1)"
                              class="video-action-btn"
                              @click="moveVideoFile(video.id, 1)">Down</button>
                      
                      <button class="video-action-btn delete" 
                              @click="requestVideoRemoval(video.id)">Delete</button>
                    </div>
                  </div>

                </b-col>

              </b-row>
            </div>
          </div>

        </div>
      </div>

      <alert-modal modal-id="alert-video-encoding" 
                     message="Only MP4 Videos are allowed. Please upload video with appropriate encoding/format"
                     okText="Got it, thanks"></alert-modal>
      
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
import StreamService from '@/services/StreamService'
import utils from '@/utils'

export default {
  name: "ScheduledChannelManageVideos",
  props: ['stream'],
  async mounted () {
    
    try {
      this.videoFiles = await StreamService.getStreamPlaylist(this.stream._id)
    } catch (e) {
      this.$notify({ group: 'error', text: 'could not retreive playlist videos' })
    }

    this.videoFiles = _.compact(this.videoFiles).map((videoFile) => {
      videoFile.removing = false
      videoFile.statusProcessing = false
      videoFile.uploadTime = new Date(videoFile.uploadTime)
      
      return videoFile
    })

    this.processing = false
    
    setTimeout(() => this.initVideoUpload(), 1000)
  },
  data () {
    return {
      processing: true,
      focusedVideo: {},
      videoFiles: []
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

        let newVideo = {
          id: 'unnamed_' + Date.now(),
          fileName: file.name,
          bytes: file.size,
          mediaInfo: {},
          precedence: vm.computeVideoPrecedence(),
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
        this.stream._id, 
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
    async moveVideoFile (videoId, moveDir) {
      if (!moveDir) return 

      const videoIndex = _.findIndex(this.videoFiles, { id: videoId })
      const videoIndex2 = videoIndex + moveDir

      const vid1 = this.videoFiles[videoIndex]
      const vid2 = this.videoFiles[videoIndex2]
      if (!vid2) return

      this.swapVideos(videoIndex, videoIndex2)
      
      try {
        await StreamService.moveStreamPlaylistVideo(this.stream._id, videoId, vid2.id)
      } catch(e) {
        this.$notify({ group: 'error', text: 'Could not change playlist order' })
        this.swapVideos(videoIndex, videoIndex2)
        console.log('video-move-error', e)
      }

    },
    swapVideos (videoIndex, videoIndex2) {
      let oprecedence = this.videoFiles[videoIndex].precedence
      let nprecedence = this.videoFiles[videoIndex2].precedence

      this.videoFiles[videoIndex].precedence = nprecedence
      this.videoFiles[videoIndex2].precedence = oprecedence

      this.videoFiles = utils.swapArray(this.videoFiles, videoIndex, videoIndex2)
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
          .deleteStreamPlaylistVideoFile(this.stream._id, videoId)
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
    },
    async toggleVideoStatus (videoId) {
      const video = _.find(this.videoFiles, { id: videoId })
      if (!video || video.file) return

      video.statusProcessing = true

      let nstate = !video.enabled

      try {
        await StreamService.togleStreamPlaylistVideoStatus(this.stream._id, videoId, nstate)
        video.enabled = nstate
      } catch (e) {
        console.log('e', e)
      }

      video.statusProcessing = false
    },
    computeVideoPrecedence (video) {
      let precedence = 0
      // let siblingVids = _.filter(this.videoFiles, v => !v.hasOwnProperty('file'))
      let siblingVids = this.videoFiles
      if (video) {
        siblingVids = _.filter(this.videoFiles, v => v.id !== video.id)
      }
      
      precedence = _.size(siblingVids)

      // if (_.size(siblingVids)) {
      //   let sortedVids = _.sortBy(siblingVids, vid => -vid.precedence)
      //   let prevPrecedense = sortedVids[0] && sortedVids[0].precedence
      //   prevPrecedense = prevPrecedense || 0
      //   precedence = prevPrecedense +1
      // }

      return precedence
    },
    copyIframeCode (video) {
      let text = this.getVideoIframeSnippet(video)
      try {
        this.$copyText(text);
        this.$notify({ group: "info", text: "Copied to clipboard" });
      } catch (e) {}
    },
    getVideoIframeSnippet (video) {
      let iframeSrc = 'https://player.castr.io/embed?src='+video.playbackUrl
      return `<iframe src="${iframeSrc}" width="590" height="430" frameborder="0" scrolling="no" allow="autoplay" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>`
    },
    canMoveVideo (videoId, moveDir) {
      if (!moveDir) return 

      const videoIndex = _.findIndex(this.videoFiles, { id: videoId })
      if (videoIndex === -1) return

      let siblingVideoIndex = videoIndex + moveDir
      if (siblingVideoIndex === videoIndex) return

      // console.log(
      //   moveDir == 1 ? 'down': 'up', 
      //   this.videoFiles[videoIndex].fileName,
      //   videoIndex, 
      //   siblingVideoIndex)

      let siblingVideo = this.videoFiles[siblingVideoIndex]

      return !!siblingVideo
    }
  },
  components: {
    AlertModal,
    ConfirmModal
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
  border-bottom: 1px solid rgb(44, 46, 82);
  font-size: 12.5px;
}
.video-item {
  padding: 11px;
  margin-bottom: 3px;
  /* border-radius: 6px; */
  border-bottom: 1px solid rgb(44, 46, 82);
  font-size: 14px;
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
  min-height: 120px;
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
  padding-left: 15px;
  width: 220px;
}
.progress {
  height: 18px;
}
</style>