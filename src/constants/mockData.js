// Unsplash photo IDs chosen for streetwear / graphic tee aesthetic
const IMG = (id, w = 480, h = 580) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=center&q=82`

export const WEEKLY_DESIGNS = [
  {
    id:'DR001', name:'STATIC NOISE',  designer:'@glitchkid',  orders:847,  rank:1, prevRank:2,
    color:'#B6FF00', weeklyOrders:312, allTimeOrders:2104, hype:'🔥', drop:false,
    image: IMG('1583743814966-8936f5b7be1a'),   // black graphic tee flat lay
  },
  {
    id:'DR002', name:'VOID RUNNER',   designer:'@darkmode_z', orders:712,  rank:2, prevRank:1,
    color:'#00D1FF', weeklyOrders:289, allTimeOrders:1876, hype:'⚡', drop:false,
    image: IMG('1556821840-3a63f15732ce'),       // dark streetwear on model
  },
  {
    id:'DR003', name:'CHROME GHOST',  designer:'@spectral99', orders:634,  rank:3, prevRank:5,
    color:'#FF006E', weeklyOrders:241, allTimeOrders:1523, hype:'💀', drop:false,
    image: IMG('1576566588028-4147f3842f27'),    // white tee on model — will overlay magenta
  },
  {
    id:'DR004', name:'ACID BLOOM',    designer:'@rave.flux',  orders:589,  rank:4, prevRank:3,
    color:'#B6FF00', weeklyOrders:198, allTimeOrders:1290, hype:'🌿', drop:false,
    image: IMG('1562157873-818bc0726f68'),       // bold graphic tee
  },
  {
    id:'DR005', name:'NULL CITY',     designer:'@n0city',     orders:421,  rank:5, prevRank:4,
    color:'#00D1FF', weeklyOrders:167, allTimeOrders:987,  hype:'🌆', drop:false,
    image: IMG('1529374255404-311a2a4f1fd9'),   // urban streetwear model
  },
  {
    id:'DR006', name:'PLASMA WAVE',   designer:'@wave99',     orders:388,  rank:6, prevRank:8,
    color:'#FF006E', weeklyOrders:155, allTimeOrders:812,  hype:'🌊', drop:false,
    image: IMG('1542291026-7eec264c27ff'),       // red/pink fashion
  },
  {
    id:'DR007', name:'DARK MATTER',   designer:'@mattter',    orders:312,  rank:7, prevRank:6,
    color:'#B6FF00', weeklyOrders:124, allTimeOrders:734,  hype:'🔮', drop:false,
    image: IMG('1523381294911-8d3cead13475'),   // dark street fashion
  },
  {
    id:'DR008', name:'NEON TOKYO',    designer:'@tokyoghost', orders:287,  rank:8, prevRank:7,
    color:'#00D1FF', weeklyOrders:108, allTimeOrders:654,  hype:'🗼', drop:false,
    image: IMG('1571945153237-4929e783af4a'),   // editorial fashion
  },
  {
    id:'DR009', name:'GLITCH ARC',    designer:'@arc.exe',    orders:241,  rank:9, prevRank:11,
    color:'#FF006E', weeklyOrders:97,  allTimeOrders:589,  hype:'⚡', drop:false,
    image: IMG('1603252109303-2751441dd157'),   // monochrome tee
  },
  {
    id:'DR010', name:'ELECTRIC ZEN',  designer:'@zenmode',    orders:198,  rank:10,prevRank:9,
    color:'#B6FF00', weeklyOrders:78,  allTimeOrders:432,  hype:'☯️', drop:false,
    image: IMG('1564859228273-274232fdb516'),   // minimal streetwear
  },
]

export const ALLTIME_DESIGNS = WEEKLY_DESIGNS.map((d) => ({
  ...d,
  orders:    d.allTimeOrders,
  rank:      WEEKLY_DESIGNS.indexOf(d) + 1,
  prevRank:  WEEKLY_DESIGNS.indexOf(d) + 1,
})).sort((a, b) => b.allTimeOrders - a.allTimeOrders)
  .map((d, i) => ({ ...d, rank: i + 1, prevRank: i + 1 }))

export const ACTIVE_DROPS = [
  {
    id:       'DROP-001',
    designId: 'DR001',
    name:     'STATIC NOISE GENESIS',
    designer: '@glitchkid',
    color:    '#B6FF00',
    price:    'COD — Market Rate',
    stock:    47,
    endsAt:   new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    tag:      'LIMITED',
    hype:     '🔥',
    image:    IMG('1583743814966-8936f5b7be1a'),
  },
  {
    id:       'DROP-002',
    designId: 'DR003',
    name:     'CHROME GHOST REISSUE',
    designer: '@spectral99',
    color:    '#FF006E',
    price:    'COD — Market Rate',
    stock:    23,
    endsAt:   new Date(Date.now() + 12 * 60 * 60 * 1000),
    tag:      'ENDING SOON',
    hype:     '💀',
    image:    IMG('1576566588028-4147f3842f27'),
  },
  {
    id:       'DROP-003',
    designId: 'DR006',
    name:     'PLASMA WAVE FIRST RUN',
    designer: '@wave99',
    color:    '#00D1FF',
    price:    'COD — Market Rate',
    stock:    88,
    endsAt:   new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    tag:      'NEW DROP',
    hype:     '🌊',
    image:    IMG('1542291026-7eec264c27ff'),
  },
]

export function getTrend(d) {
  if (d.prevRank > d.rank)  return { dir: 'up',   delta: d.prevRank - d.rank }
  if (d.prevRank < d.rank)  return { dir: 'down', delta: d.rank - d.prevRank }
  return { dir: 'same', delta: 0 }
}
