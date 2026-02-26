
import { Ambulance, Trip, AmbulanceStatus, TripStatus, Location } from '../types';
import { INITIAL_AMBULANCES } from '../constants';
import { supabase } from './supabase';

type Subscriber = (data: any) => void;

class SupabaseBackend {
  private ambulances: Ambulance[] = [];
  private trips: Trip[] = [];
  private subscribers: Set<Subscriber> = new Set();
  private initialized = false;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    await this.loadInitial();
    await this.seedIfEmpty();
    this.subscribeToChanges();
    this.initialized = true;
    this.notifySubscribers({ type: 'AMBULANCE_UPDATES', data: this.ambulances });
    this.notifySubscribers({ type: 'TRIP_UPDATED', data: this.trips });
  }

  async refresh() {
    await this.initPromise;
    await this.loadInitial();
    this.notifySubscribers({ type: 'AMBULANCE_UPDATES', data: this.ambulances });
    this.notifySubscribers({ type: 'TRIP_UPDATED', data: this.trips });
  }

  private normalizeAmbulance(row: any): Ambulance {
    return {
      ...row,
      location: row.location as Location
    } as Ambulance;
  }

  private normalizeTrip(row: any): Trip {
    return {
      ...row,
      pickup_location: row.pickup_location as Location,
      hospital_location: row.hospital_location as Location
    } as Trip;
  }

  private async loadInitial() {
    const { data: ambRows } = await supabase.from('ambulances').select('*');
    if (ambRows) this.ambulances = ambRows.map(row => this.normalizeAmbulance(row));

    const { data: tripRows } = await supabase.from('trips').select('*');
    if (tripRows) this.trips = tripRows.map(row => this.normalizeTrip(row));
  }

  private async seedIfEmpty() {
    if (this.ambulances.length > 0) return;
    const { data: inserted } = await supabase.from('ambulances').insert(INITIAL_AMBULANCES).select('*');
    if (inserted) this.ambulances = inserted.map(row => this.normalizeAmbulance(row));
  }

  private subscribeToChanges() {
    supabase
      .channel('mats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulances' }, (payload) => {
        this.applyAmbulanceChange(payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, (payload) => {
        this.applyTripChange(payload);
      })
      .subscribe();
  }

  private applyAmbulanceChange(payload: any) {
    const record = payload.new || payload.old;
    if (!record?.id) return;
    if (payload.eventType === 'DELETE') {
      this.ambulances = this.ambulances.filter(a => a.id !== record.id);
    } else {
      const normalized = this.normalizeAmbulance(record);
      const index = this.ambulances.findIndex(a => a.id === record.id);
      if (index >= 0) this.ambulances[index] = normalized;
      else this.ambulances.push(normalized);
    }
    this.notifySubscribers({ type: 'AMBULANCE_UPDATES', data: this.ambulances });
  }

  private applyTripChange(payload: any) {
    const record = payload.new || payload.old;
    if (!record?.id) return;
    if (payload.eventType === 'DELETE') {
      this.trips = this.trips.filter(t => t.id !== record.id);
    } else {
      const normalized = this.normalizeTrip(record);
      const index = this.trips.findIndex(t => t.id === record.id);
      if (index >= 0) this.trips[index] = normalized;
      else this.trips.push(normalized);
    }
    const eventType = payload.eventType === 'INSERT' ? 'TRIP_CREATED' : 'TRIP_UPDATED';
    this.notifySubscribers({ type: eventType, data: record });
  }

  getAmbulances() { return [...this.ambulances]; }
  getTrips() { return [...this.trips]; }

  subscribe(callback: Subscriber) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(event: { type: string, data: any }) {
    this.subscribers.forEach(sub => sub(event));
  }

  async requestTrip(tripData: Omit<Trip, 'id' | 'status' | 'start_time'>) {
    await this.initPromise;
    const payload = {
      ...tripData,
      status: TripStatus.REQUESTED,
      start_time: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('trips')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create trip');
    }
    const trip = this.normalizeTrip(data);
    this.trips.push(trip);
    this.notifySubscribers({ type: 'TRIP_CREATED', data: trip });
    return trip;
  }

  async assignAmbulance(tripId: string, ambulanceId: string) {
    await this.initPromise;
    await Promise.all([
      supabase.from('trips').update({ ambulance_id: ambulanceId, status: TripStatus.ASSIGNED }).eq('id', tripId),
      supabase.from('ambulances').update({ status: AmbulanceStatus.ENROUTE, last_updated: new Date().toISOString() }).eq('id', ambulanceId)
    ]);
    await this.refresh();
  }

  async updateTripStatus(tripId: string, status: TripStatus) {
    await this.initPromise;
    const end_time = status === TripStatus.COMPLETED ? new Date().toISOString() : null;
    await supabase.from('trips').update({ status, end_time }).eq('id', tripId);

    const affectedTrip = this.trips.find(t => t.id === tripId);
    if (!affectedTrip?.ambulance_id) return;

    let ambStatus = AmbulanceStatus.ENROUTE;
    if (status === TripStatus.ARRIVED) ambStatus = AmbulanceStatus.HOSPITAL;
    if (status === TripStatus.COMPLETED) ambStatus = AmbulanceStatus.AVAILABLE;

    await supabase
      .from('ambulances')
      .update({ status: ambStatus, last_updated: new Date().toISOString() })
      .eq('id', affectedTrip.ambulance_id);
    await this.refresh();
  }

  async updateAmbulanceLocation(ambulanceId: string, location: Location) {
    await this.initPromise;
    await supabase
      .from('ambulances')
      .update({ location, last_updated: new Date().toISOString() })
      .eq('id', ambulanceId);
    await this.refresh();
  }
}

export const api = new SupabaseBackend();
