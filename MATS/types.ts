
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
  pickup_address?: string;  // Text address entered by admin
  incident_description?: string;  // Emergency details/condition
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

// Medical Report Integration Types

export interface MedicalReport {
  id: string;
  incident_id: string;
  patient_name: string;
  diagnosis: string;
  confidence_score: number;
  report_url: string;
  api_response: DiagnosisResponse;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface SymptomExtractionResult {
  success: boolean;
  symptoms: string[];
  error?: string;
}

export interface MedicalReportResult {
  success: boolean;
  reportUrl?: string;
  reportId?: string;
  diagnosticData?: DiagnosisResponse; // Diagnostic data for on-demand report generation
  error?: string;
}

export interface DiagnosisResponse {
  input_symptoms: string[];
  total_matches: number;
  days: number;
  analysis_type: 'standard' | 'clarification_needed';
  diseases: Disease[];
  differential_diagnosis: DifferentialDiagnosis;
  confidence_check: ConfidenceCheck;
}

export interface Disease {
  name: string;
  disease_id: string;
  confidence: number;
  confidence_level: string;
  explanation: string;
  matched_symptoms: string[];
  all_symptoms: string[];
  xai: XAIData;
  duration_warning?: string;
}

export interface XAIData {
  scoring_breakdown: {
    tfidf_component: number;
    tfidf_weight: number;
    match_component: number;
    match_weight: number;
    final_score: number;
    tfidf_details: {
      tfidf_similarity: number;
      matched_symptoms_count: number;
      total_disease_symptoms: number;
      match_bonus: number;
      unmatched_disease_symptoms: string[];
    };
    match_ratio: number;
    matched_count: number;
  };
  explanation: {
    title: string;
    main_reason: string;
    scoring_components: {
      text_similarity: ScoringComponent;
      symptom_match: ScoringComponent;
    };
    matched_symptoms: string[];
    unmatched_disease_symptoms: string[];
    overall_confidence: number;
    confidence_level: string;
    summary: string;
  };
  symptom_analysis: {
    reported_and_match: {
      count: number;
      symptoms: string[];
      description: string;
    };
    disease_expects_but_not_reported: {
      count: number;
      symptoms: string[];
      more_count: number;
      description: string;
    };
    coverage: {
      percentage: number;
      text: string;
    };
  };
  feature_importance: FeatureImportance[];
}

export interface ScoringComponent {
  label: string;
  score: number;
  explanation: string;
  weight: string;
}

export interface FeatureImportance {
  symptom: string;
  importance: number;
  contribution: 'High' | 'Medium' | 'Low';
  explanation: string;
}

export interface DifferentialDiagnosis {
  is_differential: boolean;
  diseases_compared?: string[];
  score_1?: number;
  score_2?: number;
  score_difference?: number;
  explanation?: string;
  shared_symptoms?: string[];
  distinguishing_for_top?: string[];
  distinguishing_for_alternative?: string[];
  clarification_symptoms?: string[];
  clarification_explanation?: string;
}

export interface ClarifyingQuestion {
  type: 'symptom_confirmation' | 'severity' | 'timeline' | 'differential' | 'text_input';
  question: string;
  symptoms?: string[];
  explanation?: string;
  field_name?: string;
}

export interface ConfidenceCheck {
  needs_clarification: boolean;
  confidence?: number;
  message?: string;
  reason?: string;
  primary_candidate?: {
    disease: string;
    confidence: number;
  };
  alternatives?: Array<{
    name: string;
    confidence: number;
  }>;
  clarifying_questions?: ClarifyingQuestion[];
  next_step?: string;
}
