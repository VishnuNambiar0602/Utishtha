
export enum AmbulanceStatus {
  AVAILABLE = 'available',
  ENROUTE = 'enroute',
  HOSPITAL = 'hospital',
  OFFLINE = 'offline'
}

export enum TripStatus {
  REQUESTED = 'requested',
  ASSIGNED = 'assigned',
  ENROUTE = 'enroute',
  ARRIVED = 'arrived',
  COMPLETED = 'completed'
}

export type AuthRole = 'admin' | 'vendor';

export interface User {
  id: string;
  email: string;
  role: AuthRole;
  name: string;
  unitId?: string; // For vendors
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Ambulance {
  id: string;
  driver_name: string;
  driver_phone: string;
  location: Location;
  status: AmbulanceStatus;
  last_updated: string;
}

export interface Hospital {
  name: string;
  location: Location;
  distance?: string;
}

export interface Trip {
  id: string;
  ambulance_id?: string;
  patient_name: string;
  patient_phone: string;
  pickup_location: Location;
  hospital_name: string;
  hospital_location: Location;
  status: TripStatus;
  start_time: string;
  end_time?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface DispatchRecommendation {
  nearestAmbulanceId: string;
  hospitals: Hospital[];
  rationale: string;
}

// Emergency Call Transcript Analysis Types
export type EmergencyType = 'cardiac' | 'accident' | 'fall' | 'breathing_issue' | 'unconscious' | 'bleeding' | 'other' | 'unknown';
export type Gender = 'male' | 'female' | 'unknown';
export type ConsciousState = true | false | 'unknown';
export type BreathingState = 'normal' | 'labored' | 'not_breathing' | 'unknown';
export type BleedingState = 'none' | 'minor' | 'severe' | 'unknown';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type RecommendedResponse = 'ALS' | 'BLS' | 'standard' | 'unknown';

export interface CallMetadata {
  analysis_timestamp: string;
  model_assumption_free: boolean;
}

export interface CallSummary {
  short_summary: string;
}

export interface EmergencyCallLocation {
  full_address: string | null;
  landmark: string | null;
}

export interface EmergencyCallPatient {
  name: string | null;
  age: number | null;
  gender: Gender;
  conscious: ConsciousState;
  breathing: BreathingState;
  bleeding: BleedingState;
}

export interface EmergencyCallEmergency {
  type: EmergencyType;
  critical_symptoms_detected: string[];
  description: string;
}

export interface Triage {
  priority: Priority;
  recommended_response: RecommendedResponse;
  requires_immediate_dispatch: boolean;
  life_threatening_confirmed: boolean;
}

export interface AutomationDecision {
  auto_dispatch_allowed: boolean;
  reason: string;
  confidence: number;
}

export interface SafetyFlags {
  missing_critical_information: boolean;
  transcript_unclear: boolean;
  human_review_required: boolean;
  location_verified: boolean;
  human_review_recommended: boolean;
}

export interface AIMeta {
  confidence: number;
  reasoning: string;
  extraction_completeness: number;
  escalation_logic_triggered: boolean;
}

export interface EmergencyCallAnalysis {
  call_metadata: CallMetadata;
  call_summary: CallSummary;
  location: EmergencyCallLocation;
  patient: EmergencyCallPatient;
  emergency: EmergencyCallEmergency;
  triage: Triage;
  automation_decision: AutomationDecision;
  safety_flags: SafetyFlags;
  ai_meta: AIMeta;
}
