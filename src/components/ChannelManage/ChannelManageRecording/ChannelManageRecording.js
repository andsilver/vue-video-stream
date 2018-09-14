import _ from 'lodash'
import moment from 'moment'
import d3Extent from 'd3-array/src/extent'
import StreamService from '@/services/StreamService'
import StreamDvrService from '@/services/StreamDvrService'
import ConfirmModal from '@/components/ConfirmModal.vue'
import Utils from '@/utils'

export default {
  name: 'Channel',
  props: ['stream'],
  async mounted() {
    this.streamId = this.stream._id

    // initiate dom
    this.setupDOM()
    initTimeline.call(this)
    initPlayerControls.call(this)
    initSeekbarControls.call(this)
    initSegmentExtractionControls.call(this)
  },
  destroyed() {},
  watch: {
    dvrCalendarDate() {
      this.onDvrCalendarDateChanged()
    },
    timelineRangeSeekTime() {
      playToSeekBarTime.call(this)
    }
  },
  computed: {
    timelineRangeSeekTime() {
      return this.timelineRange.seekTime
    }
  },
  data() {
    return {
      firstRun: true,
      streamId: null,
      processing: true,
      showCalendar: false,
      dvrCalendarDate: null,
      player: {
        time: null,
        playback: false,
        fullscreen: false,
        mute: false
      },
      playerInstance: null,
      playbackRate: 1,
      timelineRange: {
        start: 0,
        end: 0,
        origin: Date.now(),
        ticks: 14,
        frame: 6 * 3600 * 1000,
        frameMoveFactor: function() { return this.frame * 0.1 },
        chunkFactor: 3600 * 1000,
        seekTime: 0,
        chunks: [],
        hits: [],
        thumbnails: [],
        extract: {
          start: null,
          end: null
        }
      },
      timeline: [],
      validDVRHits: false,
      fullscreen: false,
      masterServerAddr: null,
      userSubscription: null,
      processingMessage: null,
      seekBarControlLock: false,
      seekbarFrameSnapshot: null,
      seekbarFrameTime: null,

      // DOM
      seekBarSnapshotControl: null,
      seekBarControl: null,
      segmentExtractControls: null,
      playerContainer: null
    }
  },
  methods: {
    setupDOM() {
      this.seekBarSnapshotControl = $('.seekbar-frame-snapshot')
      this.seekBarControl = $('.timeline-seekbar-control')
      this.segmentExtractControls = $('.timeline-segment-controls > div')
      this.playerContainer = $('#dvr-player')
    },
    toggleCalendarVisibility() {
      const nstate = !this.showCalendar
      this.showCalendar = nstate
    },
    onDvrCalendarDateChanged() {
      const { dvrCalendarDate } = this
      if (!dvrCalendarDate) return
      resetTimelineRange.call(this, new Date(dvrCalendarDate))
    },
    moveTimeline(direction) {
      direction = direction || 0

      const trange = this.timelineRange

      if (direction === 1) {
        let dt = new Date()
        let newEnd = new Date(trange.end.getTime() + (trange.chunkSize * direction))
        let nextDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1)

        if (newEnd.getTime() > nextDay.getTime()) return
      }

      _.each(['start', 'end'], (key) => {
        // this.timelineRange[key].setTime(trange[key].getTime() + (trange.chunkSize * direction))
        const time = trange[key].getTime()
        const newTime = new Date(time + (trange.chunkSize * direction))
        this.timelineRange[key] = newTime
      })

      setTimeline.call(this)
    },
    incTicks(dir) {
      if (!dir) return
      if (dir < 0 && this.timelineRange.ticks < 3) return

      this.timelineRange.ticks += dir
      setTimeline.call(this)
    },
    zoomTimeline(direction) {
      if (!direction) return

      let trange = this.timelineRange
      let inc = trange.chunkSize * direction

      let start = trange.start.getTime()
      let end = trange.end.getTime()

      // this.timelineRange = _.assign({
      //   start: Date(start - inc),
      //   end: Date(start + inc)
      // }, this.timelineRange)
      this.timelineRange = _.assign({}, this.timelineRange, {
        start: new Date(start - inc),
        end: new Date(end + inc)
      })

      console.log(
        this.timelineRange.start.toString(),
        this.timelineRange.end.toString()
      )

      setTimeline.call(this)
    },
    toggleMute() {
      const isMuted = (this.player.mute = !this.player.mute)

      if (!this.playerInstance) return

      if (isMuted) this.playerInstance.mute()
      else this.playerInstance.unmute()
    },
    togglePlayback() {
      if (!this.playerInstance) return

      let { playback } = this.player
      if (this.player.playback) this.playerInstance.pause()
      else this.playerInstance.play()

      this.player.playback = !playback
    },
    getDownloadHref() {
      let href = ''
      if (!this.validDVRHits.length) return

      let streamURL = getStreamUrl.call(this, true)
      if (!streamURL) return

      href = streamURL.replace(/index-/gi, 'archive-').replace(/\.m3u8/gi, '.mp4')
      return href
    }
  },
  components: { ConfirmModal }
}

function getTicks(start, end) {
  if (!start || !end) return
  let trange = this.timelineRange
  let ticks = trange.ticks
  let Ticks = []

  ticks -= 1
  let dif = Math.ceil((end.getTime() - start.getTime()) / ticks)
  trange.chunkSize = dif

  let dt = new Date()
  dt.setTime(start.getTime())

  let dtValue = () => dt.getTime()

  let tmp = {}

  for (let i = 0; dtValue() < end.getTime(); i++) {
    dt.setTime(start.getTime() + (dif * i))
    let timestamp = dt.getTime()
    let node = {
      time: new Date(timestamp)
    }

    let tmpkey = dt.getFullYear() + '-' + dt.getMonth() + '-' + dt.getDate()

    tmp[tmpkey] = _.isArray(tmp[tmpkey]) ? tmp[tmpkey] : [tmp[tmpkey]]
    tmp[tmpkey].push(node)
    Ticks.push(node)
  }

  _.each(tmp, (val, key) => {
    let arr = tmp[key] = _.compact(val)
    let minNode

    _.each(arr, (node) => {
      if (!minNode || minNode.time.getTime() > node.time.getTime()) {
        minNode = node
      }
    })

    minNode.isHead = true
  })

  return Ticks
}

async function calcTimelinePixels() {
  let tcontrolWrapper = $('.timeline-seekbar-control').parent()
  tcontrolWrapper = _.get(tcontrolWrapper, 0)

  let width
  try {
    width = tcontrolWrapper.getBoundingClientRect().width
  } catch (e) { return }

  let trange = this.timelineRange
  trange.pixelTime = (trange.end - trange.start) / width
  trange.chunkPx = width / trange.ticks

  let seektime = getSeekBarTime.call(this, true)

  await resolveTimelineHits.call(this)

  if (this.firstRun) {
    seektime = new Date()
    trange.extract.start = trange.start
    trange.extract.end = trange.end
  }

  setSeekBarByTime.call(this, seektime)
  this.firstRun = false
}

function setSeekBarByTime(time, preventUpdate) {
  if (!_.isDate(time)) return

  const trange = this.timelineRange
  const { start, end } = trange
  if (!_.inRange(time.getTime(), start.getTime(), end.getTime())) return

  if (preventUpdate !== true) {
    trange.seekTime = time
  }

  let timeOffset = time.getTime() - trange.start.getTime()
  let px = timeOffset / trange.pixelTime

  if (this.seekBarControlLock !== true) {
    let controlEl = _.get(this.seekBarControl, 0)
    controlEl.style.left = px + 'px'
  }
}

function setSeekBarByPixels(px) {
  if (_.isNil(px)) return

  let trange = this.timelineRange
  const wrapperWidth = this.seekBarControl.parent()[0].getBoundingClientRect().width
  if (!_.inRange(px, 0, wrapperWidth)) return

  trange.seekTime = new Date(trange.start.getTime() + (px * trange.pixelTime))
  _.get(this.seekBarControl, 0).style.left = px + 'px'
}

function getSeekBarTime(forceUpdate, getRelativeTime) {
  let trange = this.timelineRange
  let st = trange.seekTime

  if (!forceUpdate) {
    return getRelativeTime === true ? st.getTime() - trange.start.getTime() : st
  }

  let offset = this.seekBarControl.offset().left
  if (_.isNil(offset)) return

  let val = offset * trange.pixelTime
  return getRelativeTime === true ? val : new Date(trange.start.getTime() + val)
}

function resetPlayer() {
  if (!this.playerInstance) return

  this.playerInstance.destroy()
  _.each(['mute', 'playback', 'fullscreen'], (key) => {
    this.player[key] = false
  })
}

function getValidDVRHits() {
  let trange = this.timelineRange
  let validHits = []

  const extract = trange.extract
  const rangeStart = trange.start
  const rangeEnd = trange.end

  let start = (extract.start || rangeStart).getTime()
  let end = (extract.end || rangeEnd).getTime()

  if (start > end) {
    let tmp = start
    start = end
    end = tmp
  }

  start -= rangeStart.getTime()
  end -= rangeStart.getTime()

  for (let i = 0; i < trange.hits.length; i++) {
    let hit = trange.hits[i]
    if (
      _.inRange(hit.start, start, end) ||
      _.inRange(hit.end, start, end) ||
      _.inRange(start, hit.start, hit.end) ||
      _.inRange(end, hit.start, hit.end)
    ) validHits.push(hit)
  }

  return validHits
}

function isValidDVRHit(curSeek) {
  const trange = this.timelineRange
  let validHit

  for (let i = 0; i < trange.hits.length; i++) {
    let hit = trange.hits[i]
    if (_.inRange(curSeek, hit.start, hit.end)) {
      validHit = hit
      break
    }
  }

  return validHit
}

function playToSeekBarTime() {
  resetPlayer.call(this)

  const streamURL = getStreamUrl.call(this)
  if (!streamURL) return

  const trange = this.timelineRange
  const curSeek = getSeekBarTime.call(this, undefined, true)

  trange.validHit = !!isValidDVRHit.call(this, curSeek)
  if (!trange.validHit) return

  const playbackConfig = _.assign({
    source: streamURL,
    height: 378,
    width: '',
    parentId: '#dvr-player',
    autoPlay: true,
    chromeless: true,
    // disableVideoTagContextMenu: true,
    events: {
      onReady: () => {
        this.player.playback = true
      },
      onTimeUpdate: (progress) => {
        const seektime = trange.seekTime
        const curSeek = new Date(seektime.getTime() + (progress.current * 1000))

        this.player.time = curSeek
        setSeekBarByTime.call(this, curSeek, true)
      }
    }
  }, {})

  const playerInstance = new window.Clappr.Player(playbackConfig)
  playerInstance.unmute()
  playerInstance.setVolume(100)

  this.player.time = trange.seekTime
  this.playerInstance = playerInstance
}

function getStreamUrl(isSegmentExtraction) {
  if (!this.stream) return

  const trange = this.timelineRange
  const extract = trange.extract
  let startTime = trange.seekTime.getTime()
  let playlistRuntime = trange.end.getTime() - startTime

  if (isSegmentExtraction === true && extract.start) {
    let extent = d3Extent([
      extract.start.getTime(),
      extract.end.getTime()
    ])

    startTime = _.head(extent)
    playlistRuntime = _.last(extent) - startTime
  }

  const host = getApiHost(this.stream.region)
  let url = `https://${host}/${this.stream.key}/index`
  // let url = `https://us-fs.origincdn.com/Adithya95/index`
  url += '-' + Math.floor(startTime / 1000) + '-' + Math.round(playlistRuntime / 1000) + '.m3u8'

  return url
}

function getStreamSnapshotUrl(time) {
  let date = new Date(time)
  if (!_.isDate(date)) return

  const host = getApiHost(this.stream.region)
  const utcString = moment(date).utc().format('YYYY/MM/DD/HH/mm/ss')
  const pathname = `${this.stream.key}/${utcString}.jpg`

  return `https://${host}/${pathname}`
}

async function resolveTimelineHits() {
  const trange = this.timelineRange

  const startTime = trange.start.getTime()
  const endTime = trange.end.getTime()

  let dvrRes = await StreamService.getStreamDvrRanges(this.streamId, startTime, endTime)

  dvrRes = Utils.toArray(dvrRes)
  dvrRes = _.head(dvrRes)

  const thumbnails = _.get(dvrRes, 'brief_thumbnails')
  trange.thumbnails = Utils.toArray(thumbnails)

  let ranges = _.get(dvrRes, 'ranges')
  ranges = Utils.toArray(ranges)

  const rangeStart = trange.start
  trange.hits = []
  _.each(ranges, (range) => {
    const offset = range.from * 1000 - rangeStart.getTime()
    const node = {
      start: offset,
      end: offset + (range.duration * 1000)
    }

    const pxStart = offset / trange.pixelTime
    const pxEnd = node.end / trange.pixelTime

    // node.css = {
    //   left: pxStart,
    //   width: pxEnd - pxStart
    // }
    node.css = {
      left: pxStart + 'px',
      width: (pxEnd - pxStart) + 'px'
    }

    trange.hits.push(node)
  })

  this.validDVRHits = getValidDVRHits.call(this)
}

function setTimeline() {
  let tstart = this.timelineRange.start
  let tend = this.timelineRange.end

  this.timeline = []
  const ticks = getTicks.call(this, tstart, tend)

  this.timeline = [...ticks]
  // Array.prototype.push.apply(
  //   this.timeline, getTicks.call(this, tstart, tend, this.timelineRange)
  // )

  calcTimelinePixels.call(this)
}

function resetTimelineRange(startTime) {
  if (!startTime) {
    let t = new Date()
    t = new Date(t.getFullYear(), t.getMonth(), t.getDate())
    startTime = t
  }

  const trange = this.timelineRange
  trange.start = new Date(startTime.getTime())
  trange.end = new Date(startTime.getTime())
  trange.end.setDate(trange.end.getDate() + 1)

  setTimeline.call(this)
}

function initTimeline() {
  // const trange = this.timelineRange
  let today = new Date()
  today = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  resetTimelineRange.call(this)
  setSeekBarByTime.call(this, today)

  window.onresize = calcTimelinePixels.bind(this)
}

function initPlayerControls() {
  this.playerContainer.on('dblclick', () => {
    if (this.playerInstance) {
      this.player.fullscreen = !this.player.fullscreen
    }
  })

  this.playerContainer.on('click', () => this.togglePlayback())
}

function initSegmentExtractionControls() {
  _.each(this.segmentExtractControls, (uiControl) => {
    uiControl.onmousedown = (devent) => {
      devent.preventDefault()
      devent.stopPropagation()
      devent.stopImmediatePropagation()

      const pBounds = uiControl.parentNode.getBoundingClientRect()
      const pLeft = pBounds.left
      const pWidth = pBounds.width

      let cBounds = uiControl.getBoundingClientRect();
      let offset = cBounds.left

      if (isNaN(offset)) offset = 0

      offset = devent.clientX - offset

      let pixels

      uiControl.onmousemove = document.onmousemove = (mevent) => {
        let pos = mevent.clientX - offset - pLeft
        if (pos < 0) pos = 0
        if (pos > pWidth) pos = pWidth

        uiControl.style.left = (pixels = pos) + 'px';
      }

      document.onmouseup = (upevent) => {
        uiControl.onmousemove = document.onmouseup = document.onmousemove = null

        if (pixels === undefined) return

        const trange = this.timelineRange
        const seekValue = pixels * trange.pixelTime

        let rangekey = 'start'
        const el = devent.target || devent.srcElement

        if (/ctrl2/g.test(el.className)) rangekey = 'end'

        trange.extract[rangekey] = new Date(trange.start.getTime() + Math.floor(seekValue))
        this.validDVRHits = getValidDVRHits.call(this)
      }
    }
  })
}

function initSeekbarControls() {
  const seekbarControl = _.get(this.seekBarControl, 0)

  this.seekbarFrameSnapshot = null
  seekbarControl.onmousedown = (devent) => {
    const pBounds = seekbarControl.parentNode.getBoundingClientRect()
    const pLeft = pBounds.left
    const pWidth = pBounds.width

    let offset = parseInt(seekbarControl.style.left);

    if (isNaN(offset)) offset = 0

    offset = devent.clientX - offset - pLeft

    this.seekBarControlLock = true

    let pixels
    seekbarControl.onmousemove = document.onmousemove = (e) => {
      let pos = e.clientX - pLeft - offset

      if (pos < 0) pos = 0
      if (pos > pWidth) pos = pWidth

      seekbarControl.style.left = (pixels = pos) + 'px'
    }

    document.onmouseup = (e) => {
      seekbarControl.onmousemove = document.onmouseup = document.onmousemove = null

      if (pixels === undefined) return

      let trage = this.timelineRange
      let seekValue = pixels * trage.pixelTime

      trage.seekTime = new Date(trage.start.getTime() + seekValue)
      this.seekBarControlLock = false
    }
  }

  seekbarControl.parentNode.onclick = (ev) => {
    const el = ev.target || ev.srcElement
    if (/control/g.test(el.className)) return

    setSeekBarByPixels.call(this, ev.offsetX)
  }

  let snapshotControl = _.get(this.seekBarSnapshotControl, 0)

  seekbarControl.parentNode.onmouseover = (e) => {
    seekbarControl.parentNode.onmousemove = (e) => {
      let el = e.target || e.srcElement

      if (/control/g.test(el.className)) return

      const trange = this.timelineRange
      let bounds = el.getBoundingClientRect()
      let width = bounds.width
      let pixels = e.clientX - bounds.left

      if (pixels < 0) pixels = 0
      if (pixels > width) pixels = width

      let hoverTime = Math.floor((trange.start.getTime() + (pixels * trange.pixelTime)) / 1000)
      let keyIndex = Utils.binarySearch(trange.thumbnails, hoverTime, (target, val) => {
        if (Math.abs(target - val) < 10) {
          target = val
        }

        return target - val
      })

      this.seekbarFrameTime = new Date(hoverTime * 1000)

      if (keyIndex < 0) {
        // this.seekbarFrameSnapshot = false
        this.seekbarFrameSnapshot = null
        // snapshotControl.style.display = 'none'
        // return
      }

      snapshotControl.style.display = 'block'
      snapshotControl.style.left = pixels + 'px'

      hoverTime = trange.thumbnails[keyIndex]
      if (keyIndex >= 0) {
        const thumbSrc = getStreamSnapshotUrl.call(this, hoverTime * 1000)
        if (thumbSrc) this.seekbarFrameSnapshot = thumbSrc
      }
    }

    seekbarControl.parentNode.onmouseleave = (levent) => {
      this.seekbarFrameSnapshot = null
      snapshotControl.style.display = 'none'
    }
  }
}

function getApiHost(region) {
  return `${region.identifierHaxr}.origincdn.com`
}
