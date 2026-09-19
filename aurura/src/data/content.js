import heroOne from '../assets/images/hero-1.jpg'
import heroTwo from '../assets/images/hero-2.jpg'
import heroThree from '../assets/images/hero-3.jpg'
import categoryTailoring from '../assets/images/category-tailoring.jpg'
import categoryTops from '../assets/images/category-tops.jpg'
import categoryBottoms from '../assets/images/category-bottoms.jpg'
import jewelry from '../assets/images/jewelry.jpg'
import bags from '../assets/images/bags.jpg'
import moments from '../assets/images/moments-1.jpg'

export const heroSlides = [heroOne, heroTwo, heroThree]

export const categories = [
  {
    id: 'tailoring',
    title: 'Tailoring',
    tagline: 'Suits & Outerwear',
    copy: 'Structured shoulders, clean lines and fabrics that hold their shape from morning meetings to midnight events.',
    image: categoryTailoring,
  },
  {
    id: 'tops',
    title: 'Tops',
    tagline: 'Shirts & Knitwear',
    copy: 'Poplin shirts, fine-gauge knits and easy layers built for warm days and cool evenings alike.',
    image: categoryTops,
  },
  {
    id: 'bottoms',
    title: 'Bottoms',
    tagline: 'Trousers & Chinos',
    copy: 'Tapered trousers and relaxed chinos cut for movement, finished with a sharp, considered crease.',
    image: categoryBottoms,
  },
]

export const accessories = [
  {
    id: 'jewelry',
    title: 'Fine Accents',
    tagline: 'Watches & Chains',
    copy: 'Small details finish a look. Warm-toned metals and honest materials, made to be worn daily.',
    image: jewelry,
  },
  {
    id: 'bags',
    title: 'Carry',
    tagline: 'Bags & Leather Goods',
    copy: 'Structured leather goods that move between the studio, the street and everywhere after dark.',
    image: bags,
  },
]

export const momentsImage = moments

export const galleryItems = [
  { id: 1, tag: 'Tailoring', image: categoryTailoring, caption: 'Charcoal double-breasted, studio session' },
  { id: 2, tag: 'Campaign', image: heroOne, caption: 'AURURA 26 — Amber campaign' },
  { id: 3, tag: 'Campaign', image: heroTwo, caption: 'AURURA 26 — Cobalt campaign' },
  { id: 4, tag: 'Tops', image: categoryTops, caption: 'Poplin shirting, close detail' },
  { id: 5, tag: 'Bottoms', image: categoryBottoms, caption: 'Tapered trouser, texture study' },
  { id: 6, tag: 'Accessories', image: jewelry, caption: 'Warm-metal accents flatlay' },
  { id: 7, tag: 'Accessories', image: bags, caption: 'Structured leather carry' },
  { id: 8, tag: 'Campaign', image: heroThree, caption: 'AURURA 26 — Tailoring detail' },
  { id: 9, tag: 'Moments', image: moments, caption: 'Off-duty, rooftop evening' },
]

export const lookbookChapters = [
  {
    id: 'daylight',
    title: 'Daylight',
    subtitle: 'Chapter One',
    copy: 'Clean tailoring built for the parts of the day that ask for precision — meetings, openings, first impressions.',
    image: heroOne,
  },
  {
    id: 'motion',
    title: 'Motion',
    subtitle: 'Chapter Two',
    copy: 'Fabrics that move the way you do. Cut for the commute, the city, the in-between hours.',
    image: heroTwo,
  },
  {
    id: 'afterhours',
    title: 'After Hours',
    subtitle: 'Chapter Three',
    copy: 'Richer tones and sharper shoulders for the moments the lights go low and the room gets louder.',
    image: heroThree,
  },
]

export const events = [
  {
    id: 1,
    name: 'AURURA Season Preview',
    date: 'Oct 04, 2026',
    location: 'Lagos — The Wheatbaker',
    description: 'A first look at the upcoming collection with live styling stations and a guided fitting bar.',
  },
  {
    id: 2,
    name: 'Rooftop Trunk Show',
    date: 'Oct 18, 2026',
    location: 'Lagos — Landmark Beach',
    description: 'An evening trunk show featuring limited runs of tailoring and accessories, drinks included.',
  },
  {
    id: 3,
    name: 'AURURA x Studio Night',
    date: 'Nov 02, 2026',
    location: 'Abuja — Transcorp Hilton',
    description: 'A styling collaboration night with guest stylists, personal fittings and a capsule-only drop.',
  },
  {
    id: 4,
    name: 'Weekend Pop-Up',
    date: 'Nov 21-22, 2026',
    location: 'Lagos — Freedom Park',
    description: 'A two-day pop-up shop with the full current range, alterations on-site and light refreshments.',
  },
  {
    id: 5,
    name: 'Year-End Showcase',
    date: 'Dec 12, 2026',
    location: 'Lagos — Eko Hotel',
    description: 'Our closing show of the year — new arrivals, a runway walk-through, and appointment-only fittings.',
  },
]

export const services = [
  'Personal Styling Session',
  'Made-to-Measure Fitting',
  'Wardrobe Consultation',
  'Alterations & Fit Check',
  'Gift & Occasion Styling',
]

export const timeSlots = [
  '10:00 AM',
  '11:00 AM',
  '12:30 PM',
  '2:00 PM',
  '3:30 PM',
  '5:00 PM',
  '6:30 PM',
]
