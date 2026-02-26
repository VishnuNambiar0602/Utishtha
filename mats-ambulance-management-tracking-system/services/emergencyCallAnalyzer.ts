
import { GoogleGenAI, Type } from "@google/genai";
import { EmergencyCallAnalysis } from "../types";

/**
 * Advanced AI-Powered Emergency Call Transcript Analyzer
 * Uses Google Gemini AI to extract structured information from emergency call transcripts
 */
export const analyzeEmergencyCallTranscript = async (
  transcript: string
): Promise<EmergencyCallAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  const prompt = `You are operating as an autonomous emergency dispatch decision engine in a mission-critical ambulance system.

You are allowed to authorize automatic ambulance dispatch ONLY under strict safety rules.

This system may operate without human administrator confirmation if conditions are met.

STRICT AUTOMATION RULES:

1. You must NEVER hallucinate.
2. If critical information is missing, DO NOT authorize automatic dispatch.
3. Automatic dispatch is allowed ONLY when:
   - Priority = HIGH
   - Critical life-threatening symptom is clearly detected
   - Location is clearly specified
   - Confidence >= 0.85
4. If transcript is unclear, DO NOT authorize automation.
5. When in doubt, require human review.
6. Return ONLY JSON.
7. Do NOT include markdown or commentary.

CRITICAL SYMPTOMS THAT ALLOW AUTOMATION:

- Not breathing
- No pulse
- Unconscious
- Cardiac arrest
- Severe bleeding
- Heavy bleeding
- Gasping for air
- Collapse with no response

Analyze the emergency call transcript below and extract structured information.

TRANSCRIPT:
"""
${transcript}
"""

Extract structured information as follows:

1. call_metadata:
   - analysis_timestamp (ISO-8601 string, current time)
   - model_assumption_free (always true)

2. call_summary:
   - short_summary (1 sentence factual description)

3. location:
   - full_address (string or null)
   - landmark (string or null)

4. patient:
   - name (string or null)
   - age (number or null)
   - gender (male/female/unknown)
   - conscious (true/false/unknown)
   - breathing (normal/labored/not_breathing/unknown)
   - bleeding (none/minor/severe/unknown)

5. emergency:
   - type (cardiac/accident/fall/breathing_issue/unconscious/bleeding/other/unknown)
   - critical_symptoms_detected (array of strings)
   - description (short factual medical description)

6. triage:
   - priority (HIGH/MEDIUM/LOW)
   - recommended_response (ALS/BLS/standard/unknown)
   - requires_immediate_dispatch (true/false)

   PRIORITY RULES:
   
   HIGH:
   - Unconscious
   - Not breathing
   - Severe bleeding
   - Cardiac symptoms
   - Collapse with abnormal breathing
   
   MEDIUM:
   - Breathing difficulty
   - Accidents
   - Falls
   - Moderate bleeding
   
   LOW:
   - Stable condition
   - Non-critical symptoms

7. automation_decision:
   - auto_dispatch_allowed (true/false)
   - reason (explanation of why automation is/isn't allowed)
   - confidence (0.0-1.0)
   
   AUTOMATION DECISION LOGIC:
   
   Auto-dispatch is TRUE only if ALL conditions are satisfied:
   - life_threatening_confirmed = true
   - priority = HIGH
   - location_verified = true
   - confidence >= 0.85
   - transcript_unclear = false
   
   If ANY condition fails, auto_dispatch_allowed MUST be false.
   The reason field must explain which condition(s) failed.

8. safety_flags:
   - missing_critical_information (true/false)
   - transcript_unclear (true/false)
   - human_review_required (true/false)
   - location_verified (true if full_address is present)
   - human_review_recommended (true if confidence < 0.85 or critical symptoms)

   human_review_required must be true if:
   - confidence < 0.75
   - critical symptoms detected
   - location missing
   - transcript unclear

9. ai_meta:
   - confidence (number between 0 and 1)
   - reasoning (2–3 sentence explanation of why priority was chosen)
   - extraction_completeness (percentage 0–100)
   - escalation_logic_triggered (true if HIGH priority due to critical keywords)

IMPORTANT:

If priority is HIGH:
- escalation_logic_triggered must be true
- human_review_required must be true
- requires_immediate_dispatch must be true

Confidence Guidelines:
- 0.90–1.0 → Clear transcript, complete data
- 0.75–0.89 → Minor missing details
- 0.50–0.74 → Significant missing details
- Below 0.50 → Transcript unclear

Return ONLY JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          call_metadata: {
            type: Type.OBJECT,
            properties: {
              analysis_timestamp: { type: Type.STRING },
              model_assumption_free: { type: Type.BOOLEAN }
            },
            required: ["analysis_timestamp", "model_assumption_free"]
          },
          call_summary: {
            type: Type.OBJECT,
            properties: {
              short_summary: { type: Type.STRING }
            },
            required: ["short_summary"]
          },
          location: {
            type: Type.OBJECT,
            properties: {
              full_address: { type: Type.STRING, nullable: true },
              landmark: { type: Type.STRING, nullable: true }
            },
            required: ["full_address", "landmark"]
          },
          patient: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, nullable: true },
              age: { type: Type.NUMBER, nullable: true },
              gender: { 
                type: Type.STRING,
                enum: ["male", "female", "unknown"]
              },
              conscious: { 
                type: Type.STRING,
                enum: ["true", "false", "unknown"]
              },
              breathing: { 
                type: Type.STRING,
                enum: ["normal", "labored", "not_breathing", "unknown"]
              },
              bleeding: { 
                type: Type.STRING,
                enum: ["none", "minor", "severe", "unknown"]
              }
            },
            required: ["name", "age", "gender", "conscious", "breathing", "bleeding"]
          },
          emergency: {
            type: Type.OBJECT,
            properties: {
              type: { 
                type: Type.STRING,
                enum: ["cardiac", "accident", "fall", "breathing_issue", "unconscious", "bleeding", "other", "unknown"]
              },
              critical_symptoms_detected: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              description: { type: Type.STRING }
            },
            required: ["type", "critical_symptoms_detected", "description"]
          },
          triage: {
            type: Type.OBJECT,
            properties: {
              priority: { 
                type: Type.STRING,
                enum: ["HIGH", "MEDIUM", "LOW"]
              },
              recommended_response: {
                type: Type.STRING,
                enum: ["ALS", "BLS", "standard", "unknown"]
              },
              requires_immediate_dispatch: { type: Type.BOOLEAN },
              life_threatening_confirmed: { type: Type.BOOLEAN }
            },
            required: ["priority", "recommended_response", "requires_immediate_dispatch", "life_threatening_confirmed"]
          },
          automation_decision: {
            type: Type.OBJECT,
            properties: {
              auto_dispatch_allowed: { type: Type.BOOLEAN },
              reason: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            },
            required: ["auto_dispatch_allowed", "reason", "confidence"]
          },
          safety_flags: {
            type: Type.OBJECT,
            properties: {
              missing_critical_information: { type: Type.BOOLEAN },
              transcript_unclear: { type: Type.BOOLEAN },
              human_review_required: { type: Type.BOOLEAN },
              location_verified: { type: Type.BOOLEAN },
              human_review_recommended: { type: Type.BOOLEAN }
            },
            required: ["missing_critical_information", "transcript_unclear", "human_review_required", "location_verified", "human_review_recommended"]
          },
          ai_meta: {
            type: Type.OBJECT,
            properties: {
              confidence: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              extraction_completeness: { type: Type.NUMBER },
              escalation_logic_triggered: { type: Type.BOOLEAN }
            },
            required: ["confidence", "reasoning", "extraction_completeness", "escalation_logic_triggered"]
          }
        },
        required: ["call_metadata", "call_summary", "location", "patient", "emergency", "triage", "automation_decision", "safety_flags", "ai_meta"]
      }
    }
  });

  try {
    const parsed = JSON.parse(response.text);
    
    // Convert string "true"/"false" to boolean for conscious field
    if (parsed.patient.conscious === "true") {
      parsed.patient.conscious = true;
    } else if (parsed.patient.conscious === "false") {
      parsed.patient.conscious = false;
    }
    
    return parsed as EmergencyCallAnalysis;
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    throw new Error("Failed to analyze emergency call transcript");
  }
};

/**
 * Sample transcript for testing the analyzer
 */
export const SAMPLE_TRANSCRIPT = `Dispatcher: 911, what's your emergency?

Caller: Yes, hello! My father collapsed in the living room! He's not responding!

Dispatcher: Okay, stay calm. What's your location?

Caller: We're at 742 Maple Drive, near the big Walmart store.

Dispatcher: And what's your father's name?

Caller: His name is Robert Thompson. He's 68 years old.

Dispatcher: Is he breathing?

Caller: I... I think so, but it's very shallow and he's gasping!

Dispatcher: Is he bleeding anywhere?

Caller: No, no blood. He was just watching TV and suddenly grabbed his chest and fell!

Dispatcher: Did he mention any chest pain?

Caller: Yes! Right before he collapsed he said his chest hurt really bad!

Dispatcher: Okay, help is on the way. What's your phone number?

Caller: It's 555-0123.

Dispatcher: And what's your name? Are you family?

Caller: I'm Sarah, his daughter. Please hurry!

Dispatcher: An ambulance is being dispatched now. Stay with him and keep him comfortable.`;
