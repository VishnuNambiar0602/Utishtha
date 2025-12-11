export const mockDrivers = [
    { id: 1, name: 'Ramesh K.', vehicle: 'KA-01-AB-1234', lat: 12.9716, lng: 77.5946, status: 'busy' },
    { id: 2, name: 'Suresh P.', vehicle: 'KA-05-XY-9876', lat: 12.9780, lng: 77.5900, status: 'free' },
    { id: 3, name: 'Abdul M.', vehicle: 'KA-53-ZZ-5555', lat: 12.9650, lng: 77.6000, status: 'free' },
    { id: 4, name: 'John D.', vehicle: 'KA-04-QQ-1111', lat: 12.9800, lng: 77.6100, status: 'maintenance' },
];

export const mockRequests = [
    { id: 101, type: 'Cardiac Arrest', location: 'Indiranagar, 12th Main', time: '10:30 AM', severity: 'critical' },
    { id: 102, type: 'Road Accident', location: 'MG Road, Metro Stn', time: '10:32 AM', severity: 'high' },
    { id: 103, type: 'High Fever', location: 'Koramangala, 4th Block', time: '10:35 AM', severity: 'medium' },
];

export const mockStats = {
    activeTrips: 12,
    avgResponse: '08:30',
    available: 8,
    totalFleet: 20,
    criticalAlerts: 2
};
