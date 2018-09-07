import _ from 'lodash'

const youtubeServers = [
  { text: 'Primary', value: 'rtmp://a.rtmp.youtube.com/live2' },
  { text: 'Secondary Backup', value: 'rtmp://b.rtmp.youtube.com/live2?backup=1' }
]
const twitchServers = [
  { 'text': 'US Central: Dallas, TX', 'value': 'rtmp://live-dfw.twitch.tv/app/' }, { 'text': 'Asia: Singapore', 'value': 'rtmp://live-sin.twitch.tv/app/' }, { 'text': 'South America: Argentina', 'value': 'rtmp://live-eze.twitch.tv/app/' }, { 'text': 'NA: Mexico', 'value': 'rtmp://live-qro.twitch.tv/app/' }, { 'text': 'Helsinki', 'value': 'rtmp://live-hel.twitch.tv/app/' }, { 'text': 'Asia: Taipei, Taiwan', 'value': 'rtmp://live-tpe.twitch.tv/app/' }, { 'text': 'US West: San Jose,CA', 'value': 'rtmp://live-sjc.twitch.tv/app/' }, { 'text': 'Salt Lake City, UT', 'value': 'rtmp://live-slc.twitch.tv/app/' }, { 'text': 'South America: Lima, Peru', 'value': 'rtmp://live-lim.twitch.tv/app/' }, { 'text': 'EU: Stockholm, Sweden', 'value': 'rtmp://live-arn.twitch.tv/app/' }, { 'text': 'US West: Seattle,WA', 'value': 'rtmp://live-sea.twitch.tv/app/' }, { 'text': 'NA: Quebec, Canada', 'value': 'rtmp://live-ymq.twitch.tv/app/' }, { 'text': 'US East: Miami, FL', 'value': 'rtmp://live-mia.twitch.tv/app/' }, { 'text': 'South America: Sao Paulo, Brazil', 'value': 'rtmp://live-sao.twitch.tv/app/' }, { 'text': 'EU: Milan, Italy Backup', 'value': 'rtmp://live-mil-backup.twitch.tv/app/' }, { 'text': 'US West: Los Angeles, CA', 'value': 'rtmp://live-lax.twitch.tv/app/' }, { 'text': 'Asia: Hong Kong', 'value': 'rtmp://live-hkg.twitch.tv/app/' }, { 'text': 'Marseille, France', 'value': 'rtmp://live-mrs.twitch.tv/app/' }, { 'text': 'US East: Chicago', 'value': 'rtmp://live-ord.twitch.tv/app/' }, { 'text': 'Asia: Seoul, South Korea', 'value': 'rtmp://live-sel.twitch.tv/app/' }, { 'text': 'US West: Phoenix, AZ', 'value': 'rtmp://live-phx.twitch.tv/app/' }, { 'text': 'US East: Atlanta, GA', 'value': 'rtmp://live-atl.twitch.tv/app/' }, { 'text': 'US West: San Francisco, CA', 'value': 'rtmp://live-sfo.twitch.tv/app/' }, { 'text': 'Asia: Tokyo, Japan', 'value': 'rtmp://live-tyo.twitch.tv/app/' }, { 'text': 'EU: Prague, CZ', 'value': 'rtmp://live-prg.twitch.tv/app/' }, { 'text': 'US East: New York, NY', 'value': 'rtmp://live-jfk.twitch.tv/app/' }, { 'text': 'South America: Medellin, Colombia', 'value': 'rtmp://live-mde.twitch.tv/app/' }, { 'text': 'US Central: Denver, CO', 'value': 'rtmp://live-den.twitch.tv/app/' }, { 'text': 'EU: Madrid, Spain', 'value': 'rtmp://live-mad.twitch.tv/app/' }, { 'text': 'EU: London, UK', 'value': 'rtmp://live-lhr.twitch.tv/app/' }, { 'text': 'EU: Amsterdam, NL', 'value': 'rtmp://live-ams.twitch.tv/app/' }, { 'text': 'South America: Sao Paulo, Brazil (deprecated)', 'value': 'rtmp://live-gru.twitch.tv/app/' }, { 'text': 'EU: Milan, Italy', 'value': 'rtmp://live-mil.twitch.tv/app/' }, { 'text': 'US Central: Houston, TX', 'value': 'rtmp://live-hou.twitch.tv/app/' }, { 'text': 'South America: Rio de Janeiro, Brazil (depracated)', 'value': 'rtmp://live-gig.twitch.tv/app/' }, { 'text': 'US West: Portland, Oregon', 'value': 'rtmp://live-pdx.twitch.tv/app/' }, { 'text': 'South America: Chile', 'value': 'rtmp://live-scl.twitch.tv/app/' }, { 'text': 'NA: Toronto, Canada', 'value': 'rtmp://live-yto.twitch.tv/app/' }, { 'text': 'EU: Lisbon, Portugal', 'value': 'rtmp://live-lis.twitch.tv/app/' }, { 'text': 'EU: Paris, FR', 'value': 'rtmp://live-cdg.twitch.tv/app/' }, { 'text': 'EU: Warsaw, Poland', 'value': 'rtmp://live-waw.twitch.tv/app/' }, { 'text': 'US East: Ashburn, VA', 'value': 'rtmp://live-iad.twitch.tv/app/' }, { 'text': 'Berlin, Germany', 'value': 'rtmp://live-ber.twitch.tv/app/' }, { 'text': 'Australia: Sydney', 'value': 'rtmp://live-syd.twitch.tv/app/' }, { 'text': 'EU: Frankfurt, Germany', 'value': 'rtmp://live-fra.twitch.tv/app/' }, { 'text': 'South America: Rio de Janeiro, Brazil', 'value': 'rtmp://live-rio.twitch.tv/app/' }, { 'text': 'EU: Vienna, Austria', 'value': 'rtmp://live-vie.twitch.tv/app/' }
]
const mixerServers = [{ 'text': 'Asia: Hong Kong', 'value': 'rtmp://ingest-hkg.mixer.com:1935/beam' }, { 'text': 'Asia: Tokyo', 'value': 'rtmp://ingest-tok.mixer.com:1935/beam' }, { 'text': 'Australia: Melbourne', 'value': 'rtmp://ingest-mel.mixer.com:1935/beam' }, { 'text': 'Australia: Sydney', 'value': 'rtmp://ingest-syd.mixer.com:1935/beam' }, { 'text': 'Brazil: Sao Paulo', 'value': 'rtmp://ingest-sao.mixer.com:1935/beam' }, { 'text': 'Canada: Toronto', 'value': 'rtmp://ingest-tor.mixer.com:1935/beam' }, { 'text': 'EU: Amsterdam', 'value': 'rtmp://ingest-ams.mixer.com:1935/beam' }, { 'text': 'EU: Frankfurt', 'value': 'rtmp://ingest-fra.mixer.com:1935/beam' }, { 'text': 'EU: London', 'value': 'rtmp://ingest-lon.mixer.com:1935/beam' }, { 'text': 'EU: Milan', 'value': 'rtmp://ingest-mil.mixer.com:1935/beam' }, { 'text': 'EU: Oslo', 'value': 'rtmp://ingest-osl.mixer.com:1935/beam' }, { 'text': 'EU: Paris', 'value': 'rtmp://ingest-par.mixer.com:1935/beam' }, { 'text': 'India: Chennai', 'value': 'rtmp://ingest-che.mixer.com:1935/beam' }, { 'text': 'Mexico: Mexico City', 'value': 'rtmp://ingest-mex.mixer.com:1935/beam' }, { 'text': 'South Korea: Seoul', 'value': 'rtmp://ingest-seo.mixer.com:1935/beam' }, { 'text': 'US: Dallas, TX', 'value': 'rtmp://ingest-dal.mixer.com:1935/beam' }, { 'text': 'US: San Jose, CA', 'value': 'rtmp://ingest-sjc.mixer.com:1935/beam' }, { 'text': 'US: Seattle', 'value': 'rtmp://ingest-sea.mixer.com:1935/beam' }, { 'text': 'US: Washington DC', 'value': 'rtmp://ingest-wdc.mixer.com:1935/beam' }]

const smashcastServers = [{ 'text': 'Default', 'value': 'rtmp://live.smashcast.tv/push' }, { 'text': 'EU-West (Frankfurt)', 'value': 'rtmp://live.fra.smashcast.tv/push' }, { 'text': 'EU-West (Paris)', 'value': 'rtmp://live.cdg.smashcast.tv/push' }, { 'text': 'EU-West (London)', 'value': 'rtmp://live.lhr.smashcast.tv/push' }, { 'text': 'EU-East (Vienna)', 'value': 'rtmp://live.vie.smashcast.tv/push' }, { 'text': 'EU-Central (Nurnberg)', 'value': 'rtmp://live.nbg.smashcast.tv/push' }, { 'text': 'EU-North (Amsterdam)', 'value': 'rtmp://live.ams.smashcast.tv/push' }, { 'text': 'EU-South (Milan)', 'value': 'rtmp://live.mxp.smashcast.tv/push' }, { 'text': 'Russia (Moscow)', 'value': 'rtmp://live.dme.smashcast.tv/push' }, { 'text': 'US-East (Washington)', 'value': 'rtmp://live.vgn.smashcast.tv/push' }, { 'text': 'US-East (New York)', 'value': 'rtmp://live.nyc.smashcast.tv/push' }, { 'text': 'US-Central (Denver)', 'value': 'rtmp://live.den.smashcast.tv/push' }, { 'text': 'US-West (Los Angeles)', 'value': 'rtmp://live.lax.smashcast.tv/push' }, { 'text': 'US-West(SanFrancisco)', 'value': 'rtmp://live.sfo.smashcast.tv/push' }, { 'text': 'S.America (Sao Paulo)', 'value': 'rtmp://live.gru.smashcast.tv/push' }, { 'text': 'South Korea (Seoul)', 'value': 'rtmp://live.icn.hitbox.tv/push' }, { 'text': 'Asia (Singapore)', 'value': 'rtmp://live.sin.hitbox.tv/push' }, { 'text': 'China (Hong Kong)', 'value': 'rtmp://live.hkg.hitbox.tv/push' }, { 'text': 'Oceania (Sydney)', 'value': 'rtmp://live.syd.hitbox.tv/push' }]

const mobcrushServers = ['rtmp://live.mobcrush.net/stream']
const goodgameServers = ['rtmp://msk.goodgame.ru:1940/live']
const cybergameServers = [
  { text: 'RU Origin', value: 'rtmp://st.cybergame.tv:1953/live' },
  { text: 'RU Premium', value: 'rtmp://premium.cybergame.tv:1953/premium' },
  { text: 'EU Premium', value: 'rtmp://vod5.cybergame.tv:1953/live/' }
]
const StreamMeServers = [
  { text: 'Default', value: 'rtmp://uc-origin.stream.me/origin' },
  { text: 'US East', value: 'rtmp://ue-origin.stream.me/origin' },
  { text: 'US West', value: 'rtmp://uw-origin.stream.me/origin' },
  { text: 'Europe West', value: 'rtmp://ew-origin.stream.me/origin' },
  { text: 'Asia East', value: 'rtmp://ae-origin.stream.me/origin' },
  { text: '4k', value: 'rtmp://sea-origin.stream.me/origin' }
]
const PricartoServers = [
  { text: 'Default', value: 'rtmp://live.us.picarto.tv/golive' },
  { text: 'US East (Chicago, US)', value: 'rtmp://live.us-east1.picarto.tv/golive' },
  { text: 'US West (Los Angeles, US)', value: 'rtmp://live.us-west1.picarto.tv/golive' },
  { text: 'EU West (Düsseldorf, Germany)', value: 'rtmp://live.eu-west1.picarto.tv/golive' }
]
const bilibiliServers = ['rtmp://txy.live-send.acg.tv/live-txy/?']
const webTvServers = ['rtmp://live3.origins.web.tv/liveext']
const gamePlankServers = ['rtmp://www.gameplank.tv/live']
const VaughnSoftServers = [
  { text: 'US: Primary', value: 'rtmp://live.vaughnsoft.net/live' },
  { text: 'US: Chicago, IL', value: 'rtmp://live-ord.vaughnsoft.net/live' },
  { text: 'US: Denver, CO', value: 'rtmp://live-den.vaughnsoft.net/live' },
  { text: 'US: New York, NY', value: 'rtmp://live-nyc.vaughnsoft.net/live' },
  { text: 'EU: Amsterdam, NL', value: 'rtmp://live-ams.vaughnsoft.net/live' }
]
const facebookServers = ['rtmp://rtmp-api.facebook.com:80/rtmp']
const DJliveServers = ['rtmp://live.djlive.pl/live']
const BoomstreamServers = ['rtmp://live.boomstream.com/live']
const streamLiveServers = ['rtmp://media.stream.live:1935/live']
const medirixLiveSportsServers = ['rtmp://publish.meridix.com/live']
const liveStreamServers = ['rtmp://rtmpin.livestreamingest.com/rtmpin']
const liveEduServers = [
  { text: 'US', value: 'rtmp://usmedia11.liveedu.tv/liveedutv' },
  { tex: 'EU', value: 'rtmp://eumedia8.liveedu.tv/liveedutv' },
  { text: 'Asia', value: 'rtmp://apmedia1.liveedu.tv/liveedutv' }
]
const switchboardServers = [
  { text: 'Default Performance Global', value: 'rtmp://ingest-global-a.switchboard.zone/live' },
  { text: 'US West', value: 'rtmp://ingest-us-west.a.switchboard.zone/live' },
  { text: 'US East', value: 'rtmp://ingest-us-east.a.switchboard.zone/live' },
  { text: 'Europe West', value: 'rtmp://ingest-eu-west.a.switchboard.zone/live' },
  { text: 'Europe Central', value: 'rtmp://ingest-us-east.a.switchboard.zone/live' },
  { text: 'Australia East', value: 'rtmp://ingest-au-east.a.switchboard.zone/live' },
  { text: 'Asia Central', value: 'rtmp://ingest-as-central.a.switchboard.zone/live' }
]
const vimeoServers = ['rtmp://rtmp.cloud.vimeo.com/live']
const cavetubeServers = ['rtmp://cavestream.net/live']
const younowServers = ['rtmp://stream.younow.com/liveapp']
const livehouseServers = ['rtmp://live-ea.livehouse.in/app/']
const fc2Servers = ['rtmp://media.live.fc2.com/live']
const lahzenegarServers = ['rtmp://live.lahzenegar.com:80/pro']
const aparatServers = ['rtmp://rtmp.cdn.asset.aparat.com:443/event']

const platforms = [{
    name: 'youtube',
    servers: youtubeServers,
    icon: '/static/images/platforms/youtube.svg',
    serverKeySegments: [
      { text: 'rtmp://', hidden: true },
      { input: true, placeholder: 'x', width: 50 },
      '.rtmp.youtube.com',
      { text: '/live2', hidden: false }
    ],
    serverKeySegmentValues: [],
    canLinkService: true,
    serviceAuthorization: {
      enabled: true,
      metadata: {
        fields: [
          { key: 'title', required: true },
          // { key: 'description', disabled: true, value: 'Multistreaming with Castr.io' }
          { key: 'description', value: 'Multistreaming with Castr.io' }
        ]
      }
    }
  },
  {
    name: 'twitch',
    servers: twitchServers,
    icon: '/static/images/platforms/twitch.svg',
    canLinkService: true,
    serviceAuthorization: {
      enabled: true,
      metadata: {
        fields: [
          { key: 'title', required: true },
          { key: 'game' }
        ]
      }
    }
  },
  // { name: 'facebook live', servers: facebookServers, icon: '/static/images/platforms/facebook-live.svg' },
  { 
    name: 'facebook live',
    // servers: [],
    customServer: true,
    // serverKeySegments: [
    //   { input: true, placeholder: 'rtmp://facebook-rtmp-server-addr:80/rtmp/' },
    // ],
    // serverKeySegmentValues: [],
    serverInputPlaceholder: 'rtmp://facebook-rtmp-server-addr:80/rtmp/',
    icon: '/static/images/platforms/facebook-live.svg'
  },
  { name: 'Vimeo', servers: vimeoServers, icon: '/static/images/platforms/vimeo-white-12dfb0dc.svg' },
  {
    name: 'periscope',
    serverKeySegments: [
      { text: 'rtmp://', hidden: true },
      { input: true, placeholder: 'ca', width: 40 },
      '.pscp.tv:80/',
      { input: true, placeholder: 'x/0', width: 40 }
    ],
    serverKeySegmentValues: [],
    icon: '/static/images/platforms/periscope.png'
  },
  {
    name: 'mixer',
    servers: mixerServers,
    icon: '/static/images/platforms/mixer.svg',
    canLinkService: true,
    serviceAuthorization: {
      metadata: {
        fields: [
          { key: 'title', required: true },
          // { key: 'description', disabled: true, value: 'Multistreaming with Castr.io' }
          { key: 'description', value: 'Multistreaming with Castr.io' }
        ]
      }
    }
  },
  {
    name: 'steam',
    serverKeySegments: [
      { text: 'rtmp://', hidden: true },
      { input: true, placeholder: 'br4-lhr1', width: 80 },
      '.broadcast.steamcontent.com',
      { text: '/app', hidden: true }
    ],
    serverKeySegmentValues: [],
    icon: '/static/images/platforms/steam.png',
    streamKeyPlaceholder: 'steam_852695447_c3886cec1233395a'
  },
  { name: 'smashcast', servers: smashcastServers, icon: '/static/images/platforms/smashcast.svg' },
  { name: 'mobcrush', servers: mobcrushServers, icon: '/static/images/platforms/mobcrush.svg' },
  {
    name: 'USTREAM',
    serverKeySegments: [
      { text: 'rtmp://', hidden: true },
      { input: true, placeholder: '----', width: 60 },
      { text: '...ustream.tv/ustreamVideo/', exclude: true },
      { text: '.fme.ustream.tv/ustreamVideo/', hidden: true },
      { input: true, placeholder: '----', width: 60 }
    ],
    serverKeySegmentValues: [],
    icon: '/static/images/platforms/ustream.svg'
  },
  { name: 'GoodGame', servers: goodgameServers, icon: '/static/images/platforms/gg.svg', streamKeyPlaceholder: '30549?pwd=000a0000b00000b0' },
  { name: 'cybergame', servers: cybergameServers, icon: '/static/images/platforms/cybergame.svg', streamKeyPlaceholder: 'example?key=tJz0m0XRsZZktYOuv' },
  { name: 'StreamMe', servers: StreamMeServers, icon: '/static/images/platforms/streamme.svg' },
  { name: 'bilibili', servers: bilibiliServers, icon: '/static/images/platforms/bilibili.svg', streamKeyPlaceholder: 'streamname=live_..&key=...' },
  { name: 'picarto TV', servers: PricartoServers, icon: '/static/images/platforms/picartotv.svg', streamKeyPlaceholder: 'ptv_125095_01115ae8b3cd' },
  { name: 'web TV', servers: webTvServers, icon: '/static/images/platforms/webtv.png' },
  { name: 'GamePlank', servers: gamePlankServers, icon: '/static/images/platforms/gameplank.png' },
  { name: 'vaughn live', servers: VaughnSoftServers, icon: '/static/images/platforms/vaughnlivelogotype.svg' },
  { name: 'breakers TV', servers: VaughnSoftServers, icon: '/static/images/platforms/breakerstv.svg' },
  { name: 'instagib', servers: VaughnSoftServers, icon: '/static/images/platforms/instagib.svg' },
  { name: 'vapers TV', servers: VaughnSoftServers, icon: '/static/images/platforms/vaperstv.svg' },
  { name: 'DJlive.pl', servers: DJliveServers, icon: '/static/images/platforms/djlive.png' },
  { name: 'Boomstream', servers: BoomstreamServers, icon: '/static/images/platforms/boomstream.png' },
  { name: 'StreamLive', servers: streamLiveServers, icon: '/static/images/platforms/stream-logo-light.png' },
  { name: 'Medirix Live Sports', servers: medirixLiveSportsServers, icon: '/static/images/platforms/medirix.png' },
  { name: 'Livestream', servers: liveStreamServers, icon: '/static/images/platforms/livestream.png' },
  { name: 'LiveEdu TV', servers: liveEduServers, icon: '/static/images/platforms/liveedu.svg' },
  { name: 'Switchboard Live', servers: switchboardServers, icon: '/static/images/platforms/switchboard.png' },
  { name: 'Cavetube', servers: cavetubeServers, icon: '/static/images/platforms/cavetube.svg' },
  { name: 'Livehouse', servers: livehouseServers, icon: '/static/images/platforms/livehouse.svg' },
  { name: 'Younow', servers: younowServers, icon: '/static/images/platforms/now.svg' },
  { name: 'FC2Live', servers: fc2Servers, icon: '/static/images/platforms/fc2.svg' },
  { name: 'lahzenegar', servers: lahzenegarServers, icon: '/static/images/platforms/lahzenegar.png' },
  { name: 'aparat', servers: aparatServers, icon: '/static/images/platforms/aparat.png' },
]

function getPlatformIcon(name) {
  const platform = _.find(platforms, { name })
  return platform && platform.icon
}

export default { platforms, getPlatformIcon }
