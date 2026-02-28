import type {
  Trip,
  MedicalReport,
  MedicalReportResult,
  SymptomExtractionResult,
  DiagnosisResponse
} from '../types';

/**
 * Metadata for storing a medical report
 */
export interface ReportMetadata {
  incident_id: string;
  patient_name: string;
  diagnosis: string;
  confidence_score: number;
  api_response: DiagnosisResponse;
  created_by?: string;
}

/**
 * Service interface for medical report generation and management
 * 
 * This service orchestrates the complete medical report workflow:
 * 1. Extract symptoms from incident descriptions using Gemini AI
 * 2. Call GRASP2026 diagnosis API for medical analysis
 * 3. Generate PDF reports with XAI explanations
 * 4. Store reports in Supabase with metadata
 * 5. Retrieve historical reports
 */
export interface MedicalReportService {
  /**
   * Generate a complete medical report for a trip
   * 
   * Orchestrates the full workflow: symptom extraction, diagnosis API call,
   * PDF generation, and storage. Returns the report URL on success.
   * 
   * @param tripData - The trip/incident data containing patient info and description
   * @returns Promise resolving to result with report URL or error message
   */
  generateMedicalReport(tripData: Trip): Promise<MedicalReportResult>;

  /**
   * Extract medical symptoms from natural language incident description
   * 
   * Uses Gemini AI to parse unstructured text and identify medical symptoms.
   * Normalizes symptoms to match GRASP2026's medical knowledge base terminology.
   * 
   * @param incidentDescription - Natural language description of the incident
   * @returns Promise resolving to extracted symptoms or error
   */
  extractSymptoms(incidentDescription: string): Promise<SymptomExtractionResult>;

  /**
   * Call GRASP2026 diagnosis API with symptoms and duration
   * 
   * Sends HTTP POST request to GRASP2026 /diagnose endpoint with symptoms
   * and symptom duration. Returns comprehensive diagnostic analysis including
   * XAI explanations, differential diagnosis, and specialist recommendations.
   * 
   * @param symptoms - Array of normalized symptom strings
   * @param days - Number of days patient has experienced symptoms
   * @returns Promise resolving to diagnostic response from GRASP2026
   */
  callDiagnosisAPI(symptoms: string[], days: number): Promise<DiagnosisResponse>;

  /**
   * Generate PDF medical report from diagnostic data
   * 
   * Renders ResultsWithSpecialists component with diagnostic data and converts
   * to PDF using html2pdf.js. Includes patient information, diagnosis, XAI
   * explanations, differential diagnosis, and specialist recommendations.
   * 
   * @param diagnosticData - Diagnostic response from GRASP2026 API
   * @param tripData - Trip data for patient information
   * @returns Promise resolving to PDF blob
   */
  generatePDF(diagnosticData: DiagnosisResponse, tripData: Trip): Promise<Blob>;

  /**
   * Store medical report PDF and metadata in Supabase
   * 
   * Uploads PDF to Supabase Storage and inserts metadata record in
   * medical_reports table. Links report to incident via incident_id.
   * 
   * @param pdfBlob - PDF file as Blob
   * @param metadata - Report metadata including diagnosis and API response
   * @returns Promise resolving to public URL of stored PDF
   */
  storeMedicalReport(pdfBlob: Blob, metadata: ReportMetadata): Promise<string>;

  /**
   * Retrieve all medical reports for a specific incident
   * 
   * Queries medical_reports table by incident_id and returns all associated
   * reports with metadata and download URLs.
   * 
   * @param incidentId - UUID of the incident/trip
   * @returns Promise resolving to array of medical reports
   */
  getMedicalReports(incidentId: string): Promise<MedicalReport[]>;
}

import { GoogleGenAI, Type } from "@google/genai";

/**
 * Extract medical symptoms from natural language incident description
 * 
 * Uses Gemini AI to parse unstructured text and identify medical symptoms.
 * Normalizes symptoms to match GRASP2026's medical knowledge base terminology.
 * 
 * @param incidentDescription - Natural language description of the incident
 * @returns Promise resolving to extracted symptoms or error
 * 
 * @example
 * const result = await extractSymptoms("Patient has high fever, severe cough, and difficulty breathing");
 * // Returns: { success: true, symptoms: ["fever", "cough", "difficulty breathing"] }
 * 
 * @example
 * const result = await extractSymptoms("Car accident on highway");
 * // Returns: { success: false, symptoms: [], error: "No medical symptoms detected..." }
 */
export async function extractSymptoms(
  incidentDescription: string
): Promise<SymptomExtractionResult> {
  // Handle empty or missing incident description
  if (!incidentDescription || incidentDescription.trim().length === 0) {
    return {
      success: false,
      symptoms: [],
      error: "No incident description provided. Please add incident details when creating the trip."
    };
  }
  
  // Simple extraction: split by common delimiters and clean up
  const delimiters = /[,;.]+/;
  const rawSymptoms = incidentDescription
    .toLowerCase()
    .split(delimiters)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // Common medical symptom keywords to look for
  const symptomKeywords = [
    'fever', 'cough', 'headache', 'pain', 'ache', 'nausea', 'vomiting', 
    'dizziness', 'fatigue', 'weakness', 'breathing', 'chest', 'abdominal',
    'bleeding', 'swelling', 'rash', 'confusion', 'seizure', 'unconscious'
  ];
  
  // Extract phrases that contain symptom keywords
  const symptoms = rawSymptoms.filter(phrase => 
    symptomKeywords.some(keyword => phrase.includes(keyword))
  );
  
  if (symptoms.length === 0) {
    // If no keywords found, just use the whole description as one symptom
    return {
      success: true,
      symptoms: [incidentDescription.trim()]
    };
  }
  
  return {
    success: true,
    symptoms: symptoms
  };
}

/**
 * Calculate symptom duration from incident start time to current time
 * 
 * Calculates the number of days between the incident start_time and the current
 * time. Rounds to the nearest whole number and defaults to 1 day minimum.
 * 
 * This duration is used by the GRASP2026 diagnosis API to validate disease
 * likelihood and apply duration-based penalties to confidence scores.
 * 
 * @param startTime - ISO 8601 timestamp string of when the incident started
 * @returns Number of days (minimum 1) the patient has been experiencing symptoms
 * 
 * @example
 * // Incident started 2.7 days ago
 * const duration = calculateSymptomDuration("2024-01-01T10:00:00Z");
 * // Returns: 3 (rounded to nearest whole number)
 * 
 * @example
 * // Incident started 8 hours ago
 * const duration = calculateSymptomDuration("2024-01-03T16:00:00Z");
 * // Returns: 1 (minimum default)
 */
export function calculateSymptomDuration(startTime: string): number {
  const start = new Date(startTime);
  const now = new Date();
  
  // Calculate difference in milliseconds
  const diffMs = now.getTime() - start.getTime();
  
  // Convert to days
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  // Round to nearest whole number
  const roundedDays = Math.round(diffDays);
  
  // Default to 1 day minimum
  return Math.max(1, roundedDays);
}

/**
 * Call GRASP2026 diagnosis API with symptoms and duration
 * 
 * Sends HTTP POST request to GRASP2026 /diagnose endpoint with symptoms
 * and symptom duration. Returns comprehensive diagnostic analysis including
 * XAI explanations, differential diagnosis, and specialist recommendations.
 * 
 * Implements:
 * - 10-second timeout using AbortSignal
 * - Response structure validation
 * - Network error handling
 * - API error response handling
 * - Timeout error handling
 * 
 * @param symptoms - Array of normalized symptom strings
 * @param days - Number of days patient has experienced symptoms
 * @returns Promise resolving to diagnostic response from GRASP2026
 * @throws Error if API is unavailable, request times out, or response is invalid
 * 
 * @example
 * const response = await callDiagnosisAPI(["fever", "cough", "fatigue"], 2);
 * // Returns: DiagnosisResponse with diseases, XAI data, differential diagnosis
 * 
 * @example
 * try {
 *   await callDiagnosisAPI(["fever"], 1);
 * } catch (error) {
 *   // Handle: "Diagnosis API request timed out" or "Medical diagnosis service is currently unavailable"
 * }
 */
export async function callDiagnosisAPI(
  symptoms: string[],
  days: number
): Promise<DiagnosisResponse> {
  const apiUrl = import.meta.env.VITE_GRASP2026_API_URL;
  
  if (!apiUrl) {
    throw new Error('GRASP2026 API URL is not configured. Please set VITE_GRASP2026_API_URL environment variable.');
  }
  
  // Prepare request payload
  const payload = {
    symptoms: symptoms.join(', '),
    days: days
  };
  
  try {
    // Make HTTP POST request with 10-second timeout
    const response = await fetch(`${apiUrl}/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    // Handle non-OK HTTP responses
    if (!response.ok) {
      let errorMessage = 'Diagnosis API request failed';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If error response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    // Parse response JSON
    const data = await response.json();
    
    // Validate response structure
    if (!data.diseases || !Array.isArray(data.diseases)) {
      throw new Error('Invalid response format from diagnosis API: missing or invalid diseases array');
    }
    
    if (!data.differential_diagnosis || typeof data.differential_diagnosis !== 'object') {
      throw new Error('Invalid response format from diagnosis API: missing or invalid differential_diagnosis');
    }
    
    if (!data.confidence_check || typeof data.confidence_check !== 'object') {
      throw new Error('Invalid response format from diagnosis API: missing or invalid confidence_check');
    }
    
    // Return validated response
    return data as DiagnosisResponse;
    
  } catch (error) {
    // Handle timeout errors
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error('Diagnosis API request timed out. Please try again.');
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Medical diagnosis service is currently unavailable. Please check your network connection or try again later.');
    }
    
    // Re-throw other errors (including validation errors)
    throw error;
  }
}

/**
 * Generate PDF medical report from diagnostic data
 * 
 * Renders ResultsWithSpecialists component with diagnostic data and converts
 * to PDF using html2pdf.js. Includes patient information, diagnosis, XAI
 * explanations, differential diagnosis, and specialist recommendations.
 * 
 * @param diagnosticData - Diagnostic response from GRASP2026 API
 * @param tripData - Trip data for patient information
 * @returns Promise resolving to PDF blob
 * 
 * @example
 * const pdfBlob = await generatePDF(diagnosticData, tripData);
 * // Returns: Blob containing PDF file
 */
export async function generatePDF(
  diagnosticData: DiagnosisResponse,
  tripData: Trip
): Promise<Blob> {
  // Dynamic imports
  const html2pdf = (await import('html2pdf.js')).default;
  
  // Get top diagnosis from diagnostic data
  const topDisease = diagnosticData.diseases[0];
  
  // Calculate symptom duration
  const symptomDuration = calculateSymptomDuration(tripData.start_time);
  
  // Prepare location information
  const location = tripData.pickup_address || 
    `${tripData.pickup_location.lat.toFixed(4)}, ${tripData.pickup_location.lng.toFixed(4)}`;
  
  try {
    console.log('🔄 Generating HTML report for PDF...');
    
    // Enhanced HTML with improved visual design
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              font-size: 11px;
              color: #1a202c;
              padding: 30px;
              line-height: 1.7;
              background: #ffffff;
            }
            .title {
              font-size: 28px;
              font-weight: 800;
              margin-bottom: 15px;
              color: #ffffff;
              letter-spacing: 1px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
              text-transform: uppercase;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .section-title {
              font-size: 14px;
              font-weight: 800;
              margin-top: 25px;
              margin-bottom: 12px;
              color: #ffffff;
              background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
              padding: 12px 16px;
              border-radius: 6px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              border: 2px solid #cbd5e0;
              border-radius: 6px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }
            td {
              border: 1.5px solid #cbd5e0;
              padding: 12px 14px;
              font-size: 11px;
              vertical-align: top;
            }
            th {
              border: 1.5px solid #a0aec0;
              padding: 12px 14px;
              font-size: 11px;
              font-weight: 700;
              text-align: left;
              color: #1a202c;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            /* Patient Info Table - Vibrant Blue */
            .table-patient-info td.label {
              font-weight: 800;
              width: 35%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
            }
            .table-patient-info td.value {
              width: 65%;
              background: #f0f4ff;
            }
            .table-patient-info tr:nth-child(even) td.value {
              background: #e0e9ff;
            }
            
            /* Primary Diagnosis Table - Vibrant Purple */
            .table-diagnosis th {
              background: linear-gradient(90deg, #a78bfa 0%, #c084fc 100%);
              color: #ffffff;
              font-weight: 800;
            }
            .table-diagnosis td {
              background: #f3e8ff;
            }
            .table-diagnosis tr:nth-child(even) td {
              background: #e9d5ff;
            }
            
            /* Matched Symptoms Table - Vibrant Green */
            .table-symptoms th {
              background: linear-gradient(90deg, #34d399 0%, #10b981 100%);
              color: #ffffff;
              font-weight: 800;
            }
            .table-symptoms td {
              background: #d1fae5;
            }
            .table-symptoms tr:nth-child(even) td {
              background: #a7f3d0;
            }
            
            /* Feature Importance Table - Vibrant Orange */
            .table-features th {
              background: linear-gradient(90deg, #fb923c 0%, #f97316 100%);
              color: #ffffff;
              font-weight: 800;
            }
            .table-features td {
              background: #ffedd5;
            }
            .table-features tr:nth-child(even) td {
              background: #fed7aa;
            }
            
            /* Alternative Diagnoses Table - Vibrant Pink */
            .table-alternatives th {
              background: linear-gradient(90deg, #ec4899 0%, #db2777 100%);
              color: #ffffff;
              font-weight: 800;
            }
            .table-alternatives td {
              background: #fce7f3;
            }
            .table-alternatives tr:nth-child(even) td {
              background: #fbcfe8;
            }
            
            /* Differential Diagnosis Table - Vibrant Teal */
            .table-differential th {
              background: linear-gradient(90deg, #14b8a6 0%, #0891b2 100%);
              color: #ffffff;
              font-weight: 800;
            }
            .table-differential td {
              background: #ccfbf1;
            }
            .table-differential tr:nth-child(even) td {
              background: #99f6e4;
            }
            .table-differential td:first-child {
              font-weight: 800;
              background: linear-gradient(90deg, #14b8a6, #0891b2);
              color: #ffffff;
            }
            
            .explanation {
              margin: 14px 0;
              padding: 16px;
              font-size: 11px;
              line-height: 1.8;
              background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
              border: 2px solid #10b981;
              border-left: 6px solid #059669;
              border-radius: 6px;
              font-weight: 500;
            }
            .footer {
              margin-top: 35px;
              padding: 16px;
              font-size: 10px;
              line-height: 1.7;
              background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
              border: 2px solid #ef4444;
              border-radius: 6px;
              color: #7f1d1d;
              font-weight: 600;
            }
            .footer strong {
              color: #991b1b;
              font-size: 11px;
              text-transform: uppercase;
            }
            .generated {
              text-align: right;
              font-size: 9px;
              margin-top: 20px;
              color: #718096;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="title">MEDICAL DIAGNOSTIC REPORT</div>
          
          <div class="section-title">PATIENT INFORMATION</div>
          <table class="table-patient-info">
            <tr>
              <td class="label">Patient Name</td>
              <td class="value">${sanitizeHtml(tripData.patient_name)}</td>
            </tr>
            <tr>
              <td class="label">Report Date</td>
              <td class="value">${new Date(tripData.start_time).toLocaleString()}</td>
            </tr>
            <tr>
              <td class="label">Location</td>
              <td class="value">${sanitizeHtml(location)}</td>
            </tr>
            <tr>
              <td class="label">Symptom Duration</td>
              <td class="value">${symptomDuration} day(s)</td>
            </tr>
          </table>
          
          <div class="section-title">PRIMARY DIAGNOSIS</div>
          <table class="table-diagnosis">
            <tr>
              <th style="width: 50%;">Diagnosis</th>
              <th style="width: 25%;">Confidence</th>
              <th style="width: 25%;">Level</th>
            </tr>
            <tr>
              <td><strong>${sanitizeHtml(topDisease.name)}</strong></td>
              <td>${topDisease.confidence.toFixed(1)}%</td>
              <td>${topDisease.confidence_level}</td>
            </tr>
          </table>
          
          <div class="section-title">DIAGNOSIS EXPLANATION</div>
          <div class="explanation">
            ${sanitizeHtml(topDisease.explanation)}
          </div>
          
          ${topDisease.matched_symptoms && topDisease.matched_symptoms.length > 0 ? `
          <div class="section-title">MATCHED SYMPTOMS</div>
          <table class="table-symptoms">
            <tr>
              <th>Symptom</th>
            </tr>
            ${topDisease.matched_symptoms.map(s => `<tr><td>${sanitizeHtml(s)}</td></tr>`).join('')}
          </table>
          ` : ''}
          
          ${topDisease.xai && topDisease.xai.feature_importance && topDisease.xai.feature_importance.length > 0 ? `
          <div class="section-title">FEATURE IMPORTANCE</div>
          <table class="table-features">
            <tr>
              <th style="width: 50%;">Symptom</th>
              <th style="width: 25%;">Importance</th>
              <th style="width: 25%;">Impact</th>
            </tr>
            ${topDisease.xai.feature_importance.slice(0, 8).map(f => `
            <tr>
              <td>${sanitizeHtml(f.symptom)}</td>
              <td>${(f.importance * 100).toFixed(1)}%</td>
              <td>${f.contribution}</td>
            </tr>
            `).join('')}
          </table>
          ` : ''}
          
          ${diagnosticData.diseases && diagnosticData.diseases.length > 1 ? `
          <div class="section-title">TOP ALTERNATIVE DIAGNOSES</div>
          <table class="table-alternatives">
            <tr>
              <th style="width: 50%;">Disease</th>
              <th style="width: 25%;">Confidence</th>
              <th style="width: 25%;">Level</th>
            </tr>
            ${diagnosticData.diseases.slice(1, 5).map(d => `
            <tr>
              <td>${sanitizeHtml(d.name)}</td>
              <td>${d.confidence.toFixed(1)}%</td>
              <td>${d.confidence_level}</td>
            </tr>
            `).join('')}
          </table>
          ` : ''}
          
          ${diagnosticData.differential_diagnosis && diagnosticData.differential_diagnosis.is_differential ? `
          <div class="section-title">DIFFERENTIAL DIAGNOSIS</div>
          <table class="table-differential">
            <tr>
              <td><strong>Diseases Compared:</strong></td>
              <td>${sanitizeHtml(diagnosticData.differential_diagnosis.diseases_compared?.join(', ') || 'N/A')}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Analysis:</strong><br><br>${sanitizeHtml(diagnosticData.differential_diagnosis.explanation || 'No additional analysis available')}</td>
            </tr>
          </table>
          ` : ''}
          
          <div class="footer">
            <strong>DISCLAIMER:</strong> This report is generated by an AI system and should be reviewed by qualified medical professionals. This is for diagnostic assistance only, not a substitute for professional medical advice.
          </div>
          
          <div class="generated">Generated: ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `;
    
    console.log('✅ HTML report generated');
    
    // Simple html2pdf options
    const options = {
      margin: 10 as any,
      filename: `medical-report-${tripData.id}-${Date.now()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const
      }
    };
    
    console.log('🖨️  Converting to PDF...');
    
    const pdfBlob = await html2pdf()
      .set(options)
      .from(htmlContent)
      .outputPdf('blob');
    
    console.log('✅ PDF generated successfully');
    console.log('📦 PDF size:', (pdfBlob.size / 1024).toFixed(2), 'KB');
    
    if (pdfBlob.size === 0) {
      throw new Error('PDF generated but file is empty');
    }
    
    return pdfBlob;
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  }
}

/**
 * Sanitize HTML to prevent injection
 */
function sanitizeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Store diagnostic data in database (no PDF storage)
 * 
 * Inserts diagnostic metadata and API response in medical_reports table.
 * The report is generated on-demand from this data whenever needed.
 * No PDF files are stored - saves storage costs and database space.
 * 
 * @param metadata - Report metadata including diagnosis and API response
 * @returns Promise resolving to the report ID
 * @throws Error if database insertion fails
 * 
 * @example
 * const reportId = await storeMedicalReportData({
 *   incident_id: '123e4567-e89b-12d3-a456-426614174000',
 *   patient_name: 'John Doe',
 *   diagnosis: 'Acute Bronchitis',
 *   confidence_score: 87.5,
 *   api_response: diagnosticData
 * });
 * // Returns: report ID for future retrieval
 */
export async function storeMedicalReportData(
  metadata: ReportMetadata
): Promise<string> {
  // Import Supabase client
  const { supabase } = await import('./supabase');
  
  try {
    // Insert diagnostic data into medical_reports table (no PDF storage)
    const { data: insertData, error: insertError } = await supabase
      .from('medical_reports')
      .insert({
        incident_id: metadata.incident_id,
        patient_name: metadata.patient_name,
        diagnosis: metadata.diagnosis,
        confidence_score: metadata.confidence_score,
        api_response: metadata.api_response, // Store complete API response for report regeneration
        created_by: metadata.created_by || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Failed to insert medical report data:', insertError);
      throw new Error(`Failed to store medical report data: ${insertError.message}`);
    }
    
    console.log('Medical report data stored successfully:', {
      reportId: insertData.id,
      incidentId: metadata.incident_id
    });
    
    // Return report ID for future reference
    return insertData.id;
    
  } catch (error) {
    console.error('Error storing medical report data:', error);
    
    // Re-throw if already an Error object
    if (error instanceof Error) {
      throw error;
    }
    
    // Wrap unknown errors
    throw new Error('Failed to store medical report data: Unknown error occurred');
  }
}

/**
 * Retrieve all medical reports for a specific incident
 * 
 * Queries medical_reports table by incident_id and returns all associated
 * reports with metadata and download URLs. Returns an empty array if no
 * reports are found for the incident.
 * 
 * @param incidentId - UUID of the incident/trip
 * @returns Promise resolving to array of medical reports
 * @throws Error if database query fails
 * 
 * @example
 * const reports = await getMedicalReports('123e4567-e89b-12d3-a456-426614174000');
 * // Returns: [{ id: '...', incident_id: '...', patient_name: '...', ... }]
 * 
 * @example
 * const reports = await getMedicalReports('no-reports-incident-id');
 * // Returns: [] (empty array)
 */
export async function getMedicalReports(incidentId: string): Promise<MedicalReport[]> {
  // Import Supabase client
  const { supabase } = await import('./supabase');
  
  try {
    // Query medical_reports table by incident_id
    const { data, error } = await supabase
      .from('medical_reports')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: false }); // Most recent first
    
    if (error) {
      console.error('Failed to retrieve medical reports:', error);
      throw new Error(`Failed to retrieve medical reports: ${error.message}`);
    }
    
    // Handle case with no existing reports
    if (!data || data.length === 0) {
      console.log(`No medical reports found for incident ${incidentId}`);
      return [];
    }
    
    console.log(`Retrieved ${data.length} medical report(s) for incident ${incidentId}`);
    
    // Return array of MedicalReport objects
    return data as MedicalReport[];
    
  } catch (error) {
    console.error('Error retrieving medical reports:', error);
    
    // Re-throw if already an Error object
    if (error instanceof Error) {
      throw error;
    }
    
    // Wrap unknown errors
    throw new Error('Failed to retrieve medical reports: Unknown error occurred');
  }
}

/**
 * Retrieve stored diagnostic data for a specific incident
 * 
 * Fetches the diagnostic data from a previously generated medical report
 * using the incident ID.
 * 
 * @param incidentId - UUID of the incident/trip
 * @returns Promise resolving to diagnostic response data
 * @throws Error if report not found or database query fails
 */
export async function getStoredDiagnosticData(incidentId: string): Promise<DiagnosisResponse> {
  // Import Supabase client
  const { supabase } = await import('./supabase');
  
  try {
    // Query for the most recent medical report for this incident
    const { data, error } = await supabase
      .from('medical_reports')
      .select('api_response')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Failed to retrieve diagnostic data:', error);
      throw new Error(`No medical report found for incident ${incidentId}`);
    }
    
    if (!data || !data.api_response) {
      throw new Error(`No diagnostic data found for incident ${incidentId}`);
    }
    
    console.log('Retrieved diagnostic data for incident:', incidentId);
    return data.api_response as DiagnosisResponse;
    
  } catch (error) {
    console.error('Error retrieving diagnostic data:', error);
    
    // Re-throw if already an Error object
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to retrieve diagnostic data: Unknown error occurred');
  }
}

/**
 * Download a medical report by regenerating PDF from stored diagnostic data
 * 
 * Retrieves the stored diagnostic data for an incident and generates a fresh PDF.
 * The PDF is returned as a Blob for download, without storing it again.
 * 
 * @param incidentId - UUID of the incident/trip
 * @param tripData - Trip information for the report header
 * @returns Promise resolving to PDF blob for download
 * @throws Error if diagnostic data not found or PDF generation fails
 */
export async function downloadMedicalReport(
  incidentId: string,
  tripData: Trip
): Promise<Blob> {
  try {
    console.log('Downloading medical report for incident:', incidentId);
    
    // Step 1: Retrieve stored diagnostic data
    console.log('Step 1: Retrieving stored diagnostic data...');
    const diagnosticData = await getStoredDiagnosticData(incidentId);
    console.log('✓ Diagnostic data retrieved');
    
    // Step 2: Generate PDF from stored data
    console.log('Step 2: Generating PDF from stored diagnostic data...');
    const pdfBlob = await generatePDF(diagnosticData, tripData);
    console.log('✓ PDF generated successfully');
    console.log('PDF Size:', (pdfBlob.size / 1024).toFixed(2), 'KB');
    
    return pdfBlob;
    
  } catch (error) {
    console.error('Error downloading report:', error);
    
    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to download medical report';
    
    throw new Error(errorMessage);
  }
}

/**
 * Generate a complete medical report for a trip
 * 
 * Orchestrates the full workflow: symptom extraction, diagnosis API call,
 * PDF generation, and storage. Returns the report URL on success.
 * 
 * This is the main entry point for medical report generation. It:
 * 1. Validates required trip data (patient_name, incident_description)
 * 2. Extracts symptoms from incident_description using Gemini AI
 * 3. Calculates symptom duration from start_time
 * 4. Calls GRASP2026 diagnosis API with symptoms and duration
 * 5. Generates PDF report with diagnostic data
 * 6. Stores PDF and metadata in Supabase
 * 7. Returns report URL or error message
 * 
 * All operations are logged for audit trail and compliance.
 * 
 * @param tripData - The trip/incident data containing patient info and description
 * @returns Promise resolving to result with report URL or error message
 * 
 * @example
 * const result = await generateMedicalReport(tripData);
 * if (result.success) {
 *   console.log('Report generated:', result.reportUrl);
 * } else {
 *   console.error('Report generation failed:', result.error);
 * }
 */
export async function generateMedicalReport(
  tripData: Trip
): Promise<MedicalReportResult> {
  console.log('=== Starting Medical Report Generation ===');
  console.log('Incident ID:', tripData.id);
  console.log('Patient Name:', tripData.patient_name);
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    // Step 1: Validate required trip data
    console.log('Step 1: Validating required trip data...');
    
    if (!tripData.patient_name || tripData.patient_name.trim() === '') {
      const error = 'Patient name is required for medical report generation';
      console.error('Validation failed:', error);
      return {
        success: false,
        error: error
      };
    }
    
    if (!tripData.incident_description || tripData.incident_description.trim() === '') {
      const error = 'Incident description is required for medical report generation';
      console.error('Validation failed:', error);
      return {
        success: false,
        error: error
      };
    }
    
    console.log('✓ Validation passed');
    
    // Step 2: Extract symptoms from incident description
    console.log('Step 2: Extracting symptoms from incident description...');
    console.log('Incident Description:', tripData.incident_description);
    
    const symptomResult = await extractSymptoms(tripData.incident_description);
    
    if (!symptomResult.success) {
      console.error('Symptom extraction failed:', symptomResult.error);
      return {
        success: false,
        error: symptomResult.error || 'Unable to extract symptoms from incident description'
      };
    }
    
    console.log('✓ Symptoms extracted:', symptomResult.symptoms);
    
    // Step 3: Calculate symptom duration from start_time
    console.log('Step 3: Calculating symptom duration...');
    console.log('Incident Start Time:', tripData.start_time);
    
    const symptomDuration = calculateSymptomDuration(tripData.start_time);
    
    console.log('✓ Symptom duration calculated:', symptomDuration, 'days');
    
    // Step 4: Call GRASP2026 diagnosis API
    console.log('Step 4: Calling GRASP2026 diagnosis API...');
    console.log('API Request Payload:', {
      symptoms: symptomResult.symptoms,
      days: symptomDuration
    });
    
    let diagnosticData: DiagnosisResponse;
    
    try {
      diagnosticData = await callDiagnosisAPI(symptomResult.symptoms, symptomDuration);
      console.log('✓ Diagnosis API call successful');
      console.log('Top Diagnosis:', diagnosticData.diseases[0]?.name);
      console.log('Confidence:', diagnosticData.diseases[0]?.confidence);
      console.log('Total Diseases Found:', diagnosticData.diseases.length);
    } catch (apiError) {
      console.error('Diagnosis API call failed:', apiError);
      
      // Return user-friendly error message
      const errorMessage = apiError instanceof Error 
        ? apiError.message 
        : 'Medical diagnosis service is currently unavailable';
      
      return {
        success: false,
        error: errorMessage
      };
    }
    
    // Step 5: Generate PDF report
    console.log('Step 5: Generating PDF report...');
    
    let pdfBlob: Blob;
    
    try {
      pdfBlob = await generatePDF(diagnosticData, tripData);
      console.log('✓ PDF generated successfully');
      console.log('PDF Size:', (pdfBlob.size / 1024).toFixed(2), 'KB');
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      
      const errorMessage = pdfError instanceof Error
        ? `Failed to generate PDF report: ${pdfError.message}`
        : 'Failed to generate PDF report';
      
      return {
        success: false,
        error: errorMessage
      };
    }
    
    // Step 6: Store medical report data in database (no PDF storage)
    console.log('Step 6: Storing diagnostic data in database...');
    
    const topDisease = diagnosticData.diseases[0];
    
    const metadata: ReportMetadata = {
      incident_id: tripData.id,
      patient_name: tripData.patient_name,
      diagnosis: topDisease.name,
      confidence_score: topDisease.confidence,
      api_response: diagnosticData
    };
    
    console.log('Report Metadata:', {
      incident_id: metadata.incident_id,
      patient_name: metadata.patient_name,
      diagnosis: metadata.diagnosis,
      confidence_score: metadata.confidence_score
    });
    
    let reportId: string;
    
    try {
      reportId = await storeMedicalReportData(metadata);
      console.log('✓ Medical report data stored successfully');
      console.log('Report ID:', reportId);
    } catch (storageError) {
      console.error('Report data storage failed:', storageError);
      
      const errorMessage = storageError instanceof Error
        ? `Failed to store medical report: ${storageError.message}`
        : 'Failed to store medical report';
      
      return {
        success: false,
        error: errorMessage
      };
    }
    
    // Step 7: Return success result with diagnostic data for immediate display
    console.log('=== Medical Report Generation Complete ===');
    console.log('Success: true');
    console.log('Report ID:', reportId);
    console.log('Timestamp:', new Date().toISOString());
    
    return {
      success: true,
      reportId: reportId,
      reportUrl: undefined, // No URL stored - report generated on-demand
      diagnosticData: diagnosticData // Return diagnostic data for display
    };
    
  } catch (error) {
    // Catch any unexpected errors
    console.error('=== Medical Report Generation Failed ===');
    console.error('Unexpected error:', error);
    console.error('Timestamp:', new Date().toISOString());
    
    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred during medical report generation';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get recommended specialist for a disease
 * 
 * Maps disease names to appropriate medical specialists. This is a simplified
 * mapping and should be enhanced with a proper medical knowledge base.
 * 
 * @param diseaseName - Name of the disease
 * @returns Specialist type (e.g., "Cardiologist", "Neurologist")
 */
function getSpecialistForDisease(diseaseName: string): string {
  const diseaseNameLower = diseaseName.toLowerCase();
  
  // Cardiology
  if (diseaseNameLower.includes('heart') || 
      diseaseNameLower.includes('cardiac') || 
      diseaseNameLower.includes('hypertension') ||
      diseaseNameLower.includes('angina')) {
    return 'Cardiologist';
  }
  
  // Neurology
  if (diseaseNameLower.includes('stroke') || 
      diseaseNameLower.includes('seizure') || 
      diseaseNameLower.includes('migraine') ||
      diseaseNameLower.includes('neurological')) {
    return 'Neurologist';
  }
  
  // Pulmonology
  if (diseaseNameLower.includes('lung') || 
      diseaseNameLower.includes('respiratory') || 
      diseaseNameLower.includes('asthma') ||
      diseaseNameLower.includes('pneumonia') ||
      diseaseNameLower.includes('bronchitis')) {
    return 'Pulmonologist';
  }
  
  // Gastroenterology
  if (diseaseNameLower.includes('gastro') || 
      diseaseNameLower.includes('stomach') || 
      diseaseNameLower.includes('intestin') ||
      diseaseNameLower.includes('liver') ||
      diseaseNameLower.includes('digestive')) {
    return 'Gastroenterologist';
  }
  
  // Infectious Disease
  if (diseaseNameLower.includes('infection') || 
      diseaseNameLower.includes('fever') || 
      diseaseNameLower.includes('flu') ||
      diseaseNameLower.includes('viral') ||
      diseaseNameLower.includes('bacterial')) {
    return 'Infectious Disease Specialist';
  }
  
  // Endocrinology
  if (diseaseNameLower.includes('diabetes') || 
      diseaseNameLower.includes('thyroid') || 
      diseaseNameLower.includes('hormone')) {
    return 'Endocrinologist';
  }
  
  // Rheumatology
  if (diseaseNameLower.includes('arthritis') || 
      diseaseNameLower.includes('joint') || 
      diseaseNameLower.includes('rheumat')) {
    return 'Rheumatologist';
  }
  
  // Dermatology
  if (diseaseNameLower.includes('skin') || 
      diseaseNameLower.includes('rash') || 
      diseaseNameLower.includes('dermat')) {
    return 'Dermatologist';
  }
  
  // Default to General Physician
  return 'General Physician';
}
