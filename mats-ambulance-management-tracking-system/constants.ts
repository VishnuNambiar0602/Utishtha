
import { Ambulance, AmbulanceStatus, Hospital } from './types';

export const INITIAL_AMBULANCES: Ambulance[] = [
  {
    id: 'AMB-001',
    driver_name: 'John Doe',
    driver_phone: '+1 555-0101',
    location: { lat: 34.0522, lng: -118.2437 }, // Los Angeles Downtown
    status: AmbulanceStatus.AVAILABLE,
    last_updated: new Date().toISOString()
  },
  {
    id: 'AMB-002',
    driver_name: 'Sarah Smith',
    driver_phone: '+1 555-0102',
    location: { lat: 34.0407, lng: -118.2688 }, // Near Crypto.com Arena
    status: AmbulanceStatus.AVAILABLE,
    last_updated: new Date().toISOString()
  },
  {
    id: 'AMB-003',
    driver_name: 'Mike Johnson',
    driver_phone: '+1 555-0103',
    location: { lat: 34.0689, lng: -118.4452 }, // Westwood/UCLA
    status: AmbulanceStatus.OFFLINE,
    last_updated: new Date().toISOString()
  },
  {
    id: 'AMB-004',
    driver_name: 'Elena Rodriguez',
    driver_phone: '+1 555-0104',
    location: { lat: 34.1027, lng: -118.3287 }, // Hollywood
    status: AmbulanceStatus.AVAILABLE,
    last_updated: new Date().toISOString()
  }
];

export const HOSPITALS: Hospital[] = [
  { name: 'General Medical Center', location: { lat: 34.0583, lng: -118.2163 } },
  { name: 'St. Mary\'s Hospital', location: { lat: 34.0415, lng: -118.2123 } },
  { name: 'Cedars-Sinai Medical Center', location: { lat: 34.0754, lng: -118.3804 } },
  { name: 'UCLA Ronald Reagan', location: { lat: 34.0674, lng: -118.4468 } },
  { name: 'Good Samaritan Hospital', location: { lat: 34.0523, lng: -118.2638 } }
];
