
import React, { useState } from 'react';
import { EmergencyCallAnalysis } from '../types';
import { analyzeEmergencyCallTranscript, SAMPLE_TRANSCRIPT } from '../services/emergencyCallAnalyzer';

interface EmergencyCallIntakeProps {
  onAnalysisComplete?: (analysis: EmergencyCallAnalysis) => void;
}

const EmergencyCallIntake: React.FC<EmergencyCallIntakeProps> = ({ onAnalysisComplete }) => {
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<EmergencyCallAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Please enter a call transcript');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeEmergencyCallTranscript(transcript);
      setAnalysis(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze transcript');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleTranscript = () => {
    setTranscript(SAMPLE_TRANSCRIPT);
    setAnalysis(null);
    setError(null);
  };

  const clearAll = () => {
    setTranscript('');
    setAnalysis(null);
    setError(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center">
            <i className="fa-solid fa-phone-volume text-3xl"></i>
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase italic">AI Call Analyzer</h1>
            <p className="text-slate-300 text-sm mt-1">
              Emergency call transcript intelligence powered by advanced AI
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full text-xs">
            <i className="fa-solid fa-brain text-rose-400"></i>
            <span>Gemini 3 Flash</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full text-xs">
            <i className="fa-solid fa-bolt text-yellow-400"></i>
            <span>Real-time Analysis</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full text-xs">
            <i className="fa-solid fa-shield-halved text-blue-400"></i>
            <span>HIPAA Ready</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-file-lines text-rose-500"></i>
              Call Transcript
            </h2>
            <button
              onClick={loadSampleTranscript}
              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-slate-700 transition-all"
            >
              <i className="fa-solid fa-flask mr-1"></i>
              Load Sample
            </button>
          </div>
          
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste emergency call transcript here...&#10;&#10;Example:&#10;Dispatcher: 911, what's your emergency?&#10;Caller: My father collapsed! He's not breathing!"
            className="w-full h-96 p-4 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:border-rose-500 font-mono text-sm"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || !transcript.trim()}
              className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Analyze with AI
                </>
              )}
            </button>
            <button
              onClick={clearAll}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 transition-all"
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <i className="fa-solid fa-exclamation-triangle"></i>
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
            <i className="fa-solid fa-chart-simple text-rose-500"></i>
            Analysis Results
          </h2>

          {!analysis && !loading && (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400">
              <i className="fa-solid fa-chart-line text-6xl mb-4 opacity-20"></i>
              <p className="text-sm">Awaiting transcript analysis...</p>
            </div>
          )}

          {loading && (
            <div className="h-96 flex flex-col items-center justify-center text-slate-500">
              <i className="fa-solid fa-brain text-6xl mb-4 animate-pulse text-rose-500"></i>
              <p className="text-sm font-semibold">AI is processing the transcript...</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {/* Call Metadata Banner */}
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <i className="fa-solid fa-clock"></i>
                  <span>Analyzed: {new Date(analysis.call_metadata.analysis_timestamp).toLocaleString()}</span>
                </div>
                {analysis.call_metadata.model_assumption_free && (
                  <div className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                    <i className="fa-solid fa-shield-check"></i>
                    <span className="font-semibold">No Assumptions</span>
                  </div>
                )}
              </div>

              {/* Escalation Alert (if triggered) */}
              {analysis.ai_meta.escalation_logic_triggered && (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-triangle-exclamation text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-red-900 text-lg">CRITICAL ESCALATION</h3>
                      <p className="text-sm text-red-700">Critical keywords detected - Immediate response required</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Call Summary */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-file-lines text-blue-600"></i>
                  Call Summary
                </h3>
                <p className="text-sm text-blue-800 italic">"{analysis.call_summary.short_summary}"</p>
              </div>

              {/* Triage & Safety Flags Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border-2 ${getPriorityColor(analysis.triage.priority)} font-bold`}>
                  <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Priority</div>
                  <div className="text-2xl">{analysis.triage.priority}</div>
                  <div className="text-xs mt-2 opacity-80">
                    {analysis.triage.requires_immediate_dispatch && (
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-bolt"></i> Immediate Dispatch
                      </span>
                    )}
                    {analysis.triage.life_threatening_confirmed && (
                      <span className="flex items-center gap-1 text-red-600">
                        <i className="fa-solid fa-heart-pulse"></i> Life-Threatening
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50">
                  <div className="text-xs uppercase tracking-wider text-slate-600 mb-1">Response Type</div>
                  <div className="text-2xl font-bold text-slate-900">{analysis.triage.recommended_response}</div>
                  <div className="text-xs mt-2 text-slate-600">
                    {analysis.triage.recommended_response === 'ALS' && 'Advanced Life Support'}
                    {analysis.triage.recommended_response === 'BLS' && 'Basic Life Support'}
                    {analysis.triage.recommended_response === 'standard' && 'Standard Response'}
                  </div>
                </div>
              </div>

              {/* Autonomous Dispatch Decision */}
              <div className={`p-5 rounded-xl border-2 ${
                analysis.automation_decision.auto_dispatch_allowed 
                  ? 'bg-emerald-50 border-emerald-400 shadow-lg' 
                  : 'bg-slate-50 border-slate-300'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                    analysis.automation_decision.auto_dispatch_allowed
                      ? 'bg-emerald-600'
                      : 'bg-slate-400'
                  }`}>
                    <i className={`text-white text-2xl ${
                      analysis.automation_decision.auto_dispatch_allowed
                        ? 'fa-solid fa-robot'
                        : 'fa-solid fa-user-shield'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-lg font-black uppercase ${
                        analysis.automation_decision.auto_dispatch_allowed
                          ? 'text-emerald-900'
                          : 'text-slate-900'
                      }`}>
                        {analysis.automation_decision.auto_dispatch_allowed
                          ? '🤖 AUTONOMOUS DISPATCH AUTHORIZED'
                          : '👤 HUMAN CONFIRMATION REQUIRED'}
                      </h3>
                    </div>
                    <p className={`text-sm mb-2 ${
                      analysis.automation_decision.auto_dispatch_allowed
                        ? 'text-emerald-800 font-semibold'
                        : 'text-slate-700'
                    }`}>
                      {analysis.automation_decision.reason}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2 text-xs">
                        <i className="fa-solid fa-gauge-high"></i>
                        <span className="font-semibold">Confidence: {(analysis.automation_decision.confidence * 100).toFixed(0)}%</span>
                      </div>
                      {analysis.safety_flags.location_verified && (
                        <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                          <i className="fa-solid fa-location-check"></i>
                          <span className="font-semibold">Location Verified</span>
                        </div>
                      )}
                      {!analysis.safety_flags.location_verified && (
                        <div className="flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                          <i className="fa-solid fa-location-xmark"></i>
                          <span className="font-semibold">Location Missing</span>
                        </div>
                      )}
                    </div>
                    {analysis.automation_decision.auto_dispatch_allowed && (
                      <div className="mt-3 p-3 bg-emerald-100 border border-emerald-300 rounded text-xs text-emerald-900">
                        <i className="fa-solid fa-check-circle mr-1"></i>
                        <strong>All safety conditions met:</strong> Life-threatening confirmed, high priority, location verified, confidence ≥ 85%, transcript clear.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Safety Flags */}
              {(analysis.safety_flags.human_review_required || analysis.safety_flags.human_review_recommended || analysis.safety_flags.missing_critical_information || analysis.safety_flags.transcript_unclear) && (
                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-triangle-exclamation text-amber-600"></i>
                    Safety Alerts
                  </h3>
                  <div className="space-y-2">
                    {analysis.safety_flags.human_review_required && (
                      <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-100 px-3 py-2 rounded">
                        <i className="fa-solid fa-user-check"></i>
                        <span className="font-semibold">Human Review Required</span>
                      </div>
                    )}
                    {analysis.safety_flags.human_review_recommended && !analysis.safety_flags.human_review_required && (
                      <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-100 px-3 py-2 rounded">
                        <i className="fa-solid fa-user-doctor"></i>
                        <span className="font-semibold">Human Review Recommended</span>
                      </div>
                    )}
                    {analysis.safety_flags.missing_critical_information && (
                      <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-100 px-3 py-2 rounded">
                        <i className="fa-solid fa-circle-info"></i>
                        <span className="font-semibold">Missing Critical Information</span>
                      </div>
                    )}
                    {analysis.safety_flags.transcript_unclear && (
                      <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-100 px-3 py-2 rounded">
                        <i className="fa-solid fa-volume-xmark"></i>
                        <span className="font-semibold">Transcript Unclear or Incomplete</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border-2 ${getConfidenceColor(analysis.ai_meta.confidence)} bg-opacity-10`}>
                  <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Confidence</div>
                  <div className="text-2xl font-bold">{(analysis.ai_meta.confidence * 100).toFixed(0)}%</div>
                </div>
                <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50">
                  <div className="text-xs uppercase tracking-wider text-emerald-700 mb-1">Completeness</div>
                  <div className="text-2xl font-bold text-emerald-900">{analysis.ai_meta.extraction_completeness}%</div>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-brain text-purple-600"></i>
                  AI Reasoning
                  {analysis.ai_meta.escalation_logic_triggered && (
                    <span className="ml-auto text-xs bg-red-600 text-white px-2 py-1 rounded-full font-bold">
                      ESCALATED
                    </span>
                  )}
                </h3>
                <p className="text-sm text-purple-800 leading-relaxed italic mb-2">"{analysis.ai_meta.reasoning}"</p>
                {analysis.ai_meta.escalation_logic_triggered && (
                  <div className="mt-2 pt-2 border-t border-purple-200 text-xs text-purple-700">
                    <i className="fa-solid fa-bolt mr-1"></i>
                    <span className="font-semibold">Escalation logic was automatically triggered due to critical keywords in transcript</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="p-4 bg-slate-50 rounded-xl">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-rose-500"></i>
                  Location
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Address:</span>
                    <span className="font-semibold">{analysis.location.full_address || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Landmark:</span>
                    <span className="font-semibold">{analysis.location.landmark || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="p-4 bg-slate-50 rounded-xl">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-user-injured text-rose-500"></i>
                  Patient Information
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Name:</span>
                    <span className="font-semibold">{analysis.patient.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Age:</span>
                    <span className="font-semibold">{analysis.patient.age || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gender:</span>
                    <span className="font-semibold capitalize">{analysis.patient.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Conscious:</span>
                    <span className="font-semibold capitalize">{String(analysis.patient.conscious)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Breathing:</span>
                    <span className="font-semibold capitalize">{analysis.patient.breathing.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bleeding:</span>
                    <span className="font-semibold capitalize">{analysis.patient.bleeding}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Details */}
              <div className="p-4 bg-slate-50 rounded-xl">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-siren-on text-rose-500"></i>
                  Emergency Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Type:</span>
                    <span className="font-semibold capitalize">{analysis.emergency.type.replace('_', ' ')}</span>
                  </div>
                  {analysis.emergency.critical_symptoms_detected.length > 0 && (
                    <div>
                      <span className="text-slate-600 block mb-1">Critical Symptoms:</span>
                      <div className="flex flex-wrap gap-1">
                        {analysis.emergency.critical_symptoms_detected.map((symptom, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold border border-red-200">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-600 block mb-1">Description:</span>
                    <p className="font-semibold bg-white p-2 rounded border border-slate-200">
                      {analysis.emergency.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyCallIntake;
