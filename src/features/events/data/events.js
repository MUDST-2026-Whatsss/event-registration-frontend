import bloodDonationImage from '@/assets/events/blood-donation.jpg'
import bootcampImage from '@/assets/events/bootcamp.jpg'
import concertImage from '@/assets/events/concert.jpg'
import designRetreatImage from '@/assets/events/design-retreat.jpg'
import expoImage from '@/assets/events/expo.jpg'
import halloweenImage from '@/assets/events/halloween.jpg'
import techSummitImage from '@/assets/events/tech-summit.jpg'
import workshopImage from '@/assets/events/workshop.jpg'

export const eventGroups = [
  {
    id: 'trending',
    title: 'Trending Events',
    events: [
      { id: 1, title: 'Global Tech Summit 2026', date: 'Oct 15 - 17, 2026', location: 'ICT Faculty, Mahidol University', price: 499, totalSpots: 100, filledSpots: 58, capacity: '42 spots remaining', image: techSummitImage, status: 'open', badge: 'Open' },
      { id: 2, title: 'UX Design Leadership Retreat', date: 'Sep 02, 2026', location: 'Austin, TX', price: 299, totalSpots: 100, filledSpots: 95, capacity: 'Only 5 spots remaining!', image: designRetreatImage, status: 'almost-full', badge: 'Almost full' },
      { id: 3, title: 'Marketing Innovators Expo', date: 'Sep 20, 2026', location: 'Chicago, IL', price: 0, totalSpots: 100, filledSpots: 100, capacity: 'Capacity reached', image: expoImage, status: 'closed', badge: 'Closed' },
      { id: 4, title: 'Freshy Music Night', date: 'Aug 20, 2026', location: 'ICT Faculty, Mahidol University', price: 350, totalSpots: 100, filledSpots: 100, capacity: 'Capacity reached', image: concertImage, status: 'closed', badge: 'Closed' },
      { id: 9, title: 'Cloud Security Community Meetup', date: 'Oct 22, 2026', location: 'ICT Faculty, Mahidol University', price: 0, totalSpots: 120, filledSpots: 72, capacity: '48 spots remaining', image: techSummitImage, status: 'open', badge: 'Open' },
      { id: 10, title: 'Product Management Masterclass', date: 'Nov 08, 2026', location: 'Bangkok Design Center', price: 650, totalSpots: 80, filledSpots: 34, capacity: '46 spots remaining', image: designRetreatImage, status: 'open', badge: 'Open' },
      { id: 11, title: 'Startup Pitch Night', date: 'Oct 05, 2026', location: 'MU Startup Hub', price: 0, totalSpots: 90, filledSpots: 83, capacity: 'Only 7 spots remaining!', image: expoImage, status: 'almost-full', badge: 'Almost full' },
      { id: 12, title: 'AI Engineering Conference', date: 'Dec 03 - 04, 2026', location: 'Centara Grand Bangkok', price: 899, totalSpots: 300, filledSpots: 184, capacity: '116 spots remaining', image: bootcampImage, status: 'open', badge: 'Open' },
    ],
  },
  {
    id: 'upcoming',
    title: 'Upcoming Events',
    events: [
      { id: 5, title: 'UX/UI Design Workshop', date: 'Sep 15 - 16, 2026', location: 'ICT Faculty, Mahidol University', price: 199, capacity: 'Upcoming', image: workshopImage, status: 'upcoming', badge: 'Upcoming' },
      { id: 6, title: 'Data Science Boot Camp', date: 'Nov 02, 2026', location: 'ICT Faculty, Mahidol University', price: 799, capacity: 'Upcoming', image: bootcampImage, status: 'upcoming', badge: 'Upcoming' },
      { id: 7, title: 'Halloween Event: ICT', date: 'Oct 31, 2026', location: 'ICT Faculty, Mahidol University', price: 150, capacity: 'Upcoming', image: halloweenImage, status: 'upcoming', badge: 'Upcoming' },
      { id: 8, title: 'Blood Donation Day', date: 'Sep 25, 2026', location: 'ICT Faculty, Mahidol University', price: 0, capacity: 'Upcoming', image: bloodDonationImage, status: 'upcoming', badge: 'Upcoming' },
      { id: 13, title: 'Frontend Community Meetup', date: 'Nov 18, 2026', location: 'True Digital Park', price: 0, capacity: 'Upcoming', image: workshopImage, status: 'upcoming', badge: 'Upcoming' },
      { id: 14, title: 'Digital Marketing Workshop', date: 'Dec 12, 2026', location: 'ICT Faculty, Mahidol University', price: 399, capacity: 'Upcoming', image: expoImage, status: 'upcoming', badge: 'Upcoming' },
      { id: 15, title: 'ICT Career Fair 2026', date: 'Dec 18, 2026', location: 'Mahidol University', price: 0, capacity: 'Upcoming', image: techSummitImage, status: 'upcoming', badge: 'Upcoming' },
      { id: 16, title: 'Creative Coding Lab', date: 'Jan 16, 2027', location: 'Bangkok Art and Culture Centre', price: 249, capacity: 'Upcoming', image: designRetreatImage, status: 'upcoming', badge: 'Upcoming' },
    ],
  },
]

export function canRegisterForEvent(event) {
  return event?.status === 'open' || event?.status === 'almost-full'
}
