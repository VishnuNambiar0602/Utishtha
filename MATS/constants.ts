
import { Ambulance, AmbulanceStatus, Hospital } from './types';

export const INITIAL_AMBULANCES: Ambulance[] = [
  {
    id: 'AMB-001',
    driver_name: 'Rajesh Kumar',
    driver_phone: '+91 98765 43210',
    location: { lat: 12.9716, lng: 77.5946 }, // Bangalore - MG Road
    status: AmbulanceStatus.AVAILABLE,
    last_updated: new Date().toISOString()
  },
  {
    id: 'AMB-002',
    driver_name: 'Priya Sharma',
    driver_phone: '+91 98765 43211',
    location: { lat: 13.0358, lng: 77.5970 }, // Bangalore - Hebbal
    status: AmbulanceStatus.AVAILABLE,
    last_updated: new Date().toISOString()
  },
  {
    id: 'AMB-003',
    driver_name: 'Suresh Gowda',
    driver_phone: '+91 98765 43212',
    location: { lat: 12.9352, lng: 77.6245 }, // Bangalore - HSR Layout
    status: AmbulanceStatus.AVAILABLE,
    last_updated: new Date().toISOString()
  },
  {
    id: 'AMB-004',
    driver_name: 'Lakshmi Devi',
    driver_phone: '+91 98765 43213',
    location: { lat: 12.9975, lng: 77.5913 }, // Bangalore - Malleswaram
    status: AmbulanceStatus.AVAILABLE,
    last_updated: new Date().toISOString()
  },
  {
    id: 'AMB-005',
    driver_name: 'Manjunath Reddy',
    driver_phone: '+91 98765 43214',
    location: { lat: 12.9279, lng: 77.6271 }, // Bangalore - Koramangala
    status: AmbulanceStatus.AVAILABLE,
    last_updated: new Date().toISOString()
  },
  {
    id: 'AMB-006',
    driver_name: 'Deepa Shetty',
    driver_phone: '+91 98765 43215',
    location: { lat: 13.0110, lng: 77.5508 }, // Bangalore - Yeshwanthpur
    status: AmbulanceStatus.AVAILABLE,
    last_updated: new Date().toISOString()
  }
];

export const HOSPITALS: Hospital[] = [
  { name: 'Manipal Hospital Whitefield', location: { lat: 12.9698, lng: 77.7499 } },
  { name: 'Fortis Hospital Bannerghatta', location: { lat: 12.8988, lng: 77.6072 } },
  { name: 'Apollo Hospital Jayanagar', location: { lat: 12.9250, lng: 77.5937 } },
  { name: 'Columbia Asia Hebbal', location: { lat: 13.0358, lng: 77.5929 } },
  { name: 'Narayana Health City', location: { lat: 12.8102, lng: 77.6707 } },
  { name: 'St. Johns Medical College Hospital', location: { lat: 12.9310, lng: 77.6173 } },
  { name: 'Sakra World Hospital', location: { lat: 12.9606, lng: 77.7290 } },
  { name: 'BGS Gleneagles Global Hospital', location: { lat: 12.9924, lng: 77.5625 } },
  { name: 'Aster CMI Hospital Hebbal', location: { lat: 13.0446, lng: 77.5963 } },
  { name: 'KIMS Hospital Jayanagar', location: { lat: 12.9165, lng: 77.5927 } }
];
