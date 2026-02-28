# Medical Report Components

This directory contains components copied and adapted from the GRASP2026 project for medical report generation in Utishtha.

## Components

### ResultsWithSpecialists.tsx
Main component for displaying comprehensive diagnostic results with XAI explanations. This component:
- Displays patient information
- Shows top diagnosis with confidence score
- Includes XAI scoring breakdown and explanations
- Shows matched symptoms and feature importance
- Displays differential diagnosis when applicable
- Shows specialist recommendations table
- Provides PDF download functionality

### DifferentialDiagnosisSection.tsx
Component for displaying differential diagnosis analysis when multiple conditions have similar confidence scores. Shows:
- Score comparison between top two diagnoses
- Shared symptoms
- Distinguishing symptoms for each diagnosis
- Clarification questions

### ClarifyingQuestionsSection.tsx
Component for collecting additional patient information through an interactive form. Supports:
- Text input fields
- Symptom confirmation questions
- Severity assessment
- Timeline questions
- Differential diagnosis questions

## Adaptations Made

1. **Import Updates**: Changed imports from `../services/prediction` to `../../types` to match Utishtha project structure
2. **Type Definitions**: Added `ClarifyingQuestion` interface to `types.ts`
3. **Type Updates**: Updated `DifferentialDiagnosis` to include `clarification_explanation` field
4. **Type Safety**: Changed `clarifying_questions` from `any[]` to `ClarifyingQuestion[]` in `ConfidenceCheck`

## Dependencies Required

The following package needs to be installed:

```bash
npm install html2pdf.js
```

Or add to package.json:
```json
{
  "dependencies": {
    "html2pdf.js": "^0.10.1"
  }
}
```

## Usage

```typescript
import ResultsWithSpecialists from './components/medical/ResultsWithSpecialists';

// In your component
<ResultsWithSpecialists
  disease={diagnosticData.diseases[0].name}
  confidence={diagnosticData.diseases[0].confidence}
  topPredictions={diagnosticData.diseases.slice(0, 5)}
  specialistRecommendations={specialistRecommendations}
  explanation={diagnosticData.diseases[0].explanation}
  importantFeatures={diagnosticData.diseases[0].xai.feature_importance}
  matchedSymptoms={diagnosticData.diseases[0].matched_symptoms}
  days={diagnosticData.days}
  region="Karnataka"
  date={new Date().toLocaleDateString()}
  patientInfo={patientInfo}
  xaiData={diagnosticData.diseases[0].xai}
  differentialDiagnosis={diagnosticData.differential_diagnosis}
  confidenceCheck={diagnosticData.confidence_check}
/>
```

## Styling

The components use inline styles for PDF generation compatibility. The styling is self-contained within each component using `<style>` tags.

## Future Enhancements

- Adapt color scheme to match Utishtha branding
- Add Utishtha logo to PDF header
- Customize disclaimer text for Utishtha context
- Add multi-language support for reports
