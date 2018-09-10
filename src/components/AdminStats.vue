<template>
  <div class="container view-wrapper">
    <div class="row">
      <div class="col-md-6">
        <div class="title">
          Overwatch
          &nbsp;<button v-if="!processing"
                  class="btn btn-primary btn-sm" 
                  @click="getPulse">Refresh</button>
        </div>
      </div>
    </div>
    <div v-if="processing" class="placeholder">Please wait ..</div>
    <div v-else class="stats-container">
      <b-row>
        <b-col>
          <div class='stat'>
            <div class="label">Streams</div>
            <div class="value">{{stats.streams}}</div>
          </div>
        </b-col>
        <b-col>
          <div class='stat'>
            <div class="label">Online</div>
            <div class="value">{{stats.alive}}</div>
          </div>
        </b-col>
        <b-col>
          <div class='stat'>
            <div class="label">offline</div>
            <div class="value">{{inactiveStreams}}</div>
          </div>
        </b-col>
      </b-row>

      <br>
      <br>

      <b-row>
        <b-col>
          <div class='stat'>
            <div class="label">data in</div>
            <div class="value">{{stats.bytesInTotal|bytes}}</div>
          </div>
        </b-col>
        <b-col>
          <div class='stat'>
            <div class="label">pushed bytes</div>
            <div class="value">{{stats.pushStatsTotal|bytes}}</div>
          </div>
        </b-col>
        <b-col>
          <div class='stat'>
            <div class="label">connections</div>
            <div class="value">{{stats.clients}}</div>
          </div>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import UserService from '@/services/UserService'

export default {
  name: "AdminStats",
  async mounted() {

    this.$socket.on("user.summary", summary => {
      this.stats = summary
      this.processing = false
    });

    setTimeout(() => void this.getPulse(), 2000)

  },
  data() {
    return {
      processing: true,
      stats: {}
    };
  },
  computed: {
    inactiveStreams () {
      const total = this.stats.streams || 0
      const alive = this.stats.alive || 0
      return Math.max(1, total-alive)
    }
  },
  methods: {
    getPulse () {
      this.processing = true
      // wsPulse.emit('user.summary', userId, { match: { tags: 'restream' }, subscribe: true, timeout: 30*1000 });
      this.$socket.emit(
        "user.summary", 
        '5afd38a77ca5280f79d1dba5',
        { match: { tags: 'restream' } }
      )
    }
  },
  components: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.view-wrapper {
  margin-top: 40px;
}
.title {
  padding: 5px 7px;
  font-size: 20px;
  color: #f7f7f7;
}
.stats-container {
  text-align: center;
  margin-top: 50px;
}
.stat {
  padding: 10px;
}
.stat .label {
  font-size: 13px;
  color: #f7f7f7;
  text-transform: uppercase;
}
.stat .value {
  font-size: 48px;
  color: #ffffff;
}
.placeholder {
  font-size: 22px;
  color: #e7e7e7;
  text-align: center;
  opacity: 0.75;
  margin-top: 50px;
}
</style>
