import bloodDonationImage from '../assets/events/blood-donation.jpg'
import bootcampImage from '../assets/events/bootcamp.jpg'
import concertImage from '../assets/events/concert.jpg'
import designRetreatImage from '../assets/events/design-retreat.jpg'
import expoImage from '../assets/events/expo.jpg'
import halloweenImage from '../assets/events/halloween.jpg'
import techSummitImage from '../assets/events/tech-summit.jpg'
import workshopImage from '../assets/events/workshop.jpg'

export const eventGroups = [
  {
    id: 'trending',
    title: 'Trending Events',
    events: [
      { id: 1, title: 'Global Tech Summit 2026', date: 'Oct 15 - 17, 2026', location: 'ICT Faculty, Mahidol University', price: 499, totalSpots: 100, filledSpots: 58, capacity: '42 spots remaining', image: techSummitImage, status: 'open', badge: 'Open' },
      { id: 2, title: 'UX Design Leadership Retreat', date: 'Sep 02, 2026', location: 'Austin, TX', price: 299, totalSpots: 100, filledSpots: 95, capacity: 'Only 5 spots remaining!', image: designRetreatImage, status: 'almost-full', badge: 'Almost full' },
      { id: 3, title: 'Marketing Innovators Expo', date: 'Sep 20, 2026', location: 'Chicago, IL', totalSpots: 100, filledSpots: 100, capacity: 'Capacity reached', image: expoImage, status: 'closed', badge: 'Closed' },
      { id: 4, title: 'Freshy Music Night', date: 'Aug 20, 2026', location: 'ICT Faculty, Mahidol University', totalSpots: 100, filledSpots: 100, capacity: 'Capacity reached', image: concertImage, status: 'closed', badge: 'Closed' },
    ],
  },
  {
    id: 'upcoming',
    title: 'Upcoming Events',
    events: [
      { id: 5, title: 'UX/UI Design Workshop', date: 'Sep 15 - 16, 2026', location: 'ICT Faculty, Mahidol University', capacity: 'Upcoming', image: workshopImage, status: 'upcoming', badge: 'Upcoming' },
      { id: 6, title: 'Data Science Boot Camp', date: 'Nov 02, 2026', location: 'ICT Faculty, Mahidol University', capacity: 'Upcoming', image: bootcampImage, status: 'upcoming', badge: 'Upcoming' },
      { id: 7, title: 'Halloween Event: ICT', date: 'Oct 31, 2026', location: 'ICT Faculty, Mahidol University', capacity: 'Upcoming', image: halloweenImage, status: 'upcoming', badge: 'Upcoming' },
      { id: 8, title: 'Blood Donation Day', date: 'Sep 25, 2026', location: 'ICT Faculty, Mahidol University', capacity: 'Upcoming', image: bloodDonationImage, status: 'upcoming', badge: 'Upcoming' },
    ],
  },
]

export function canRegisterForEvent(event) {
  return event?.status === 'open' || event?.status === 'almost-full'
}
