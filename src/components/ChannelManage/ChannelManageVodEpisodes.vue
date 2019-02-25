<template>
    <div v-if="!stream.dvrUnits" class="container" style="padding:0;">
      <p class="text-danger" style="font-size:14px;">
        Video Recording is not included in your current subscription. Kindly upgrade your subscription plan to access this feature.
      </p>
      <router-link to="/subscribe?category=live&action=upgrade">
        <button class="btn btn-danger">Upgrade Now</button>
      </router-link>
    </div>
    <div v-else class="container view-wrapper" style="padding:0">
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
        <div v-if="!vodEpisodes.length">
          <div style="font-size: 15.5px;">Nothing recorded yet</div>
          <p style="opacity:0.75;">Whatever you stream will saved here</p>
        </div>
        <div v-else>
          <!-- <div style="padding:10px 0;font-size:14.5px;">
            <strong>{{vodEpisodes.length}}</strong> Vod Episode(s)
          </div> -->
          <div class="episode-list">
            <div class="episode-item-header">
              <b-row>
                <b-col cols="5">Clip</b-col>
                <b-col>Duration</b-col>
                <b-col></b-col>
                <b-col></b-col>
              </b-row>
            </div>
            <div v-for="episode in vodEpisodes"
                 :key="episode.starTime"
                 class="episode-item">
              <b-row>
                <b-col cols="2" >
                  <img v-if="episode.thumb" :src="episode.thumb" class="thumb"/>
                  <div v-else class="thumb"/>
                </b-col>
                <b-col cols="5" style="padding-top:3px;font-size:14.5px;">
                  <div style="font-size:13px;">Streamed {{ episode.startTimeDate | ago }}</div>
                  <code>{{ episode.startTimeDate | date('hh:mma') }}</code>
                  -
                  <code>{{ episode.endTimeDate | date('hh:mma DD MMM') }}</code>
                  <!-- <code>{{ episode.startTimeDate | date('hh:mm DD MMM') }}</code>
                  -
                  <code>{{ episode.endTimeDate | date('hh:mm DD MMM') }}</code> -->
                </b-col>
                <b-col style="padding-top:3px;font-size:14.5px;">
                  <span v-if="episode.duration<60">{{episode.duration}} secs</span>
                  <span v-else>{{episode.duration/60|number}} mins</span>
                </b-col>
                <b-col>
                  <!-- <a target="_blank" :href="episode.downloadUrl" class="button">Download</a> -->
                  <a target="_blank" :href="episode.downloadUrl" class="btn btn-outline-primary">Download</a>
                </b-col>
                <b-col>
                  <!-- <button class="button">Embed Snippet</button> -->
                  <div class="embed-dropdown-wrapper">
                  <b-dropdown id="ddown-embed-snippet" no-caret right >
                     <template slot="button-content">
                       <!-- <button class="button">Embed code</button> -->
                       <button class="btn btn-outline-primary">Embed code</button>
                        <!-- &#x1f50d;<span class="sr-only">Search</span> -->
                    </template>
                    <div style="padding:10px;">
                      <textarea class="input" readonly>{{getEpisodeIframeSnippet(episode)}}</textarea>
                      <button class="btn btn-primary btn-sm"
                             @click="copyIframeCode(episode)">Copy</button>
                    </div>
                  </b-dropdown>
                </div>
                </b-col>
              </b-row>
            </div>
          </div>

        </div>
      </div>
  </div>
</template>
<script>
import StreamService from '@/services/StreamService'

export default {
  name: "ChannelManageVodEpisodes",
  props: ['stream'],
  async mounted () {
    try {
      this.vodEpisodes = await StreamService.getStreamDvrEpisodes(this.stream._id)
    } catch (e) {
      this.$notify({ group: 'error', text: 'could not retreive saved vod(s)' })
    }

    this.vodEpisodes = _.map(this.vodEpisodes, (vodEpisode) => {
      return _.assign({}, vodEpisode, {
        startTimeDate: new Date(vodEpisode.startTime),
        endTimeDate: new Date(vodEpisode.endTime)
      })
    })

    this.processing = false
  },
  data () {
    return {
      processing: true,
      vodEpisodes: []
    }
  },
  methods: {
    getEpisodeThumb (episode) {
      return episode.thumb || ''
    },
    copyIframeCode (episode) {
      let text = this.getEpisodeIframeSnippet(episode)
      try {
        this.$copyText(text);
        this.$notify({ group: "info", text: "Copied to clipboard" });
      } catch (e) {}
    },
    getEpisodeIframeSnippet (episode) {
      // let iframeSrc = 'https://player.castr.io/embed?src='+episode.playbackUrl
      let iframeSrc = `https://player.castr.io/${this.stream.key}?playlist=1&watchId=${episode.watchId}`
      return `<iframe src="${iframeSrc}" width="590" height="430" frameborder="0" scrolling="no" allow="autoplay" allowfullscreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen></iframe>`
    }
  }
};
</script>
<style scoped>
.view-wrapper {
  margin-top: 25px;
}
.pane-label {
  text-transform: uppercase;
  font-size: 13px;
}
.episode-list {

}
.episode-item-header {
  padding: 11px;
  margin-bottom: 3px;
  border-bottom: 1px solid rgb(44, 46, 82);
  font-size: 12.5px;
}
.episode-item {
  padding: 11px;
  /* background-color: #04063f; */
  margin-bottom: 3px;
  /* border-radius: 6px; */
  border-bottom: 1px solid rgb(44, 46, 82);
  font-size: 14px;
}
.episode-item:last-of-type {
  border-bottom: none;
}
.episode-item > * > * {
  vertical-align: middle;
}
.episode-item .thumb {
  width: 160px;
  height: 100px;
  background-color: #37383a;
  border:1px solid #17192f;
}
.episode-item .button {
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
.episode-item .button:hover {
  background-color: #2c76c1 !important;
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
</style>