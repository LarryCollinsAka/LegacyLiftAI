"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AnalysisData {
  success: boolean;
  repository: string;
  method: string;
  filesAnalyzed: number;
  analysis: {
    metrics: {
      securityScore: number;
      codeQualityScore: number;
      maintainabilityIndex: number;
      riskLevel: string;
      successProbability: string;
      timeline: string;
      budget: string;
      approach: string;
    };
    findings: {
      riskLevel: string;
      securityIssues: string[];
      approach: string;
      timeline: string;
      budget: string;
      successProbability: string;
      roadmap: string[];
    };
    rawOutput?: string;
  };
  timestamp: string;
}

export default function ExecutiveDashboard() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "technical">("overview");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("analysis");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log("📊 Loaded analysis data:", parsed);
        setData(parsed);
      } catch (error) {
        console.error("Failed to parse analysis data:", error);
        alert("Error loading analysis data. Redirecting to homepage...");
        router.push("/");
      }
    } else {
      console.warn("No analysis data found in localStorage");
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#5B7CFA] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-700 font-semibold text-lg">Preparing Executive Summary...</p>
          <p className="text-slate-500 text-sm mt-2">Analyzing strategic insights</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const metrics = data.analysis?.metrics || {};
  const findings = data.analysis?.findings || {};

  // ============================================
  // CALCULATE BUSINESS METRICS
  // ============================================
  const calculateBusinessImpact = () => {
    const riskScore = metrics.riskLevel === "CRITICAL" ? 4 : 
                      metrics.riskLevel === "HIGH" ? 3 : 
                      metrics.riskLevel === "MEDIUM" ? 2 : 1;
    
    const technicalDebt = 100 - metrics.maintainabilityIndex;
    const securityRisk = 100 - metrics.securityScore;
    
    return {
      riskScore,
      technicalDebt,
      securityRisk,
      estimatedDowntimeRisk: riskScore > 2 ? "High" : "Low",
      competitiveImpact: technicalDebt > 50 ? "Negative" : "Neutral"
    };
  };

  const businessMetrics = calculateBusinessImpact();

  // ============================================
  // EXPORT EXECUTIVE SUMMARY PDF
  // ============================================
  function handleExportExecutivePDF() {
    // Add print-friendly class and trigger print
    document.body.classList.add("executive-print");
    window.print();
    document.body.classList.remove("executive-print");
  }

  function handleExportJSON() {
    const executiveSummary = {
      repository: data.repository,
      analysisDate: data.timestamp,
      executiveSummary: {
        riskLevel: metrics.riskLevel,
        securityPosture: metrics.securityScore,
        modernizationInvestment: metrics.budget,
        estimatedTimeline: metrics.timeline,
        successProbability: metrics.successProbability,
        recommendedApproach: metrics.approach,
      },
      criticalFindings: findings.securityIssues?.slice(0, 5) || [],
      strategicRoadmap: findings.roadmap || [],
      businessImpact: businessMetrics,
    };

    const dataStr = JSON.stringify(executiveSummary, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `executive-summary-${data.repository.replace(/\//g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function getRiskColor(risk: string) {
    const colors: Record<string, string> = {
      CRITICAL: "bg-red-100 text-red-700 border-red-300",
      HIGH: "bg-orange-100 text-orange-700 border-orange-300",
      MEDIUM: "bg-blue-100 text-blue-700 border-blue-300",
      LOW: "bg-green-100 text-green-700 border-green-300",
    };
    return colors[risk] || colors.MEDIUM;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ============================================
          EXECUTIVE HEADER
          ============================================ */}
      <header className="bg-white border-b border-slate-200 shadow-sm print:shadow-none">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push("/")}
                  className="text-slate-400 hover:text-slate-600 print:hidden"
                >
                  ← Back
                </button>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                  Executive Summary
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Legacy Modernization Assessment
              </h1>
              <p className="text-slate-600 mt-1">
                {data.repository} • {data.filesAnalyzed} files analyzed • {new Date(data.timestamp).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-3 print:hidden">
              <button
                onClick={handleExportJSON}
                className="px-5 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-50 transition shadow-sm"
              >
                💾 Export Data
              </button>
              <button
                onClick={handleExportExecutivePDF}
                className="px-5 py-2.5 bg-gradient-to-r from-[#7AA2FF] via-[#5B7CFA] to-[#3E63DD] text-white rounded-xl font-semibold text-sm hover:scale-[1.02] transition shadow-lg"
              >
                📄 Export Executive PDF
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mt-6 print:hidden">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-[#7AA2FF] to-[#5B7CFA] text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              📊 Executive Overview
            </button>
            <button
              onClick={() => setActiveTab("technical")}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition ${
                activeTab === "technical"
                  ? "bg-gradient-to-r from-[#7AA2FF] to-[#5B7CFA] text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              🔧 Technical Details
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* ============================================
            EXECUTIVE OVERVIEW TAB
            ============================================ */}
        {activeTab === "overview" && (
          <>
            {/* RISK SCORECARD */}
            <section className="mb-8">
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      <span className="text-3xl">⚠️</span>
                      Risk Scorecard
                    </h2>
                    <p className="text-slate-600 mt-1">Overall system health and business risk assessment</p>
                  </div>
                  <div className={`px-8 py-4 rounded-2xl border-3 ${getRiskColor(metrics.riskLevel)} text-2xl font-black`}>
                    {metrics.riskLevel} RISK
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
                    <div className="text-red-600 text-4xl mb-3">🔒</div>
                    <h3 className="font-bold text-slate-900 mb-2">Security Posture</h3>
                    <div className="text-4xl font-black text-red-700 mb-2">
                      {metrics.securityScore}<span className="text-2xl text-red-400">/100</span>
                    </div>
                    <p className="text-sm text-slate-700">
                      {metrics.securityScore < 30 ? "⛔ Critical vulnerabilities present" :
                       metrics.securityScore < 60 ? "⚠️ Security gaps identified" :
                       "✅ Acceptable security baseline"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="text-blue-600 text-4xl mb-3">📊</div>
                    <h3 className="font-bold text-slate-900 mb-2">Technical Debt</h3>
                    <div className="text-4xl font-black text-blue-700 mb-2">
                      {businessMetrics.technicalDebt}<span className="text-2xl text-blue-400">%</span>
                    </div>
                    <p className="text-sm text-slate-700">
                      {businessMetrics.technicalDebt > 50 ? "🔴 High accumulation" :
                       businessMetrics.technicalDebt > 30 ? "🟡 Moderate burden" :
                       "🟢 Manageable levels"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="text-green-600 text-4xl mb-3">🎯</div>
                    <h3 className="font-bold text-slate-900 mb-2">Success Outlook</h3>
                    <div className="text-3xl font-black text-green-700 mb-2">
                      {metrics.successProbability}
                    </div>
                    <p className="text-sm text-slate-700">
                      Modernization success probability with proper execution
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* INVESTMENT OVERVIEW */}
            <section className="mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">💰</span>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Investment Required</h3>
                      <p className="text-sm text-slate-600">Estimated modernization budget</p>
                    </div>
                  </div>
                  <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {metrics.budget}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                    <span>📅</span>
                    <span>Timeline: <strong>{metrics.timeline}</strong></span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">🎯</span>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Recommended Strategy</h3>
                      <p className="text-sm text-slate-600">Migration approach</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-4">
                    {metrics.approach}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed bg-blue-50 rounded-lg p-4 border border-blue-200">
                    {metrics.approach === "Strangler Pattern" ? 
                      "Gradual migration strategy minimizing business disruption. New features built in modern stack while legacy system phases out incrementally." :
                      "Recommended migration strategy balancing risk, timeline, and business continuity."
                    }
                  </p>
                </div>
              </div>
            </section>

            {/* CRITICAL SECURITY FINDINGS */}
            <section className="mb-8">
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🚨</span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Critical Security Findings</h2>
                    <p className="text-slate-600">High-priority vulnerabilities requiring immediate attention</p>
                  </div>
                </div>

                {findings.securityIssues && findings.securityIssues.length > 0 ? (
                  <div className="space-y-4">
                    {findings.securityIssues.slice(0, 5).map((issue, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl hover:shadow-md transition"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 mb-2">{issue}</h4>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="px-3 py-1 bg-red-600 text-white rounded-full font-semibold">
                              HIGH PRIORITY
                            </span>
                            <span className="text-slate-600">
                              Requires immediate remediation
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-green-50 rounded-xl border-2 border-green-200">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-lg font-semibold text-green-700">No critical security issues detected</p>
                    <p className="text-sm text-green-600 mt-2">System maintains acceptable security baseline</p>
                  </div>
                )}
              </div>
            </section>

            {/* STRATEGIC MODERNIZATION ROADMAP */}
            <section className="mb-8">
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🗺️</span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Strategic Modernization Roadmap</h2>
                    <p className="text-slate-600">Phased approach to minimize risk and maximize ROI</p>
                  </div>
                </div>

                {findings.roadmap && findings.roadmap.length > 0 ? (
                  <div className="space-y-6">
                    {findings.roadmap.map((step, index) => {
                      const phaseColors = [
                        "from-blue-500 to-blue-600",
                        "from-purple-500 to-purple-600",
                        "from-pink-500 to-pink-600",
                        "from-orange-500 to-orange-600",
                      ];
                      
                      return (
                        <div
                          key={index}
                          className="relative flex gap-6 p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl hover:shadow-lg transition"
                        >
                          <div className="flex-shrink-0">
                            <div className={`w-16 h-16 bg-gradient-to-br ${phaseColors[index % 4]} text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg`}>
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-xl font-bold text-slate-900">
                                {step.split(":")[0] || `Phase ${index + 1}`}
                              </h3>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                Phase {index + 1}
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed text-base">
                              {step.split(":").slice(1).join(":").trim() || step}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-8">Roadmap details being finalized...</p>
                )}
              </div>
            </section>

            {/* QUICK WINS & RECOMMENDATIONS */}
            <section className="mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Quick Wins</h2>
                    <p className="text-slate-700">High-impact actions you can implement immediately</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">Update Critical Dependencies</h4>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Address known CVEs in outdated packages. Estimated effort: <strong>1-2 weeks</strong>
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">Implement Security Scanning</h4>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Integrate automated SAST/DAST tools into CI/CD. Estimated effort: <strong>1 week</strong>
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">Establish Test Coverage Baseline</h4>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Document current coverage and set targets. Estimated effort: <strong>2-3 weeks</strong>
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        4
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg">Document Architecture</h4>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Create current-state architecture diagrams. Estimated effort: <strong>1-2 weeks</strong>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SUCCESS FACTORS */}
            <section className="mb-8">
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">✅</span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Success Factors</h2>
                    <p className="text-slate-600">Critical elements for modernization success</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Executive Sponsorship</h4>
                        <p className="text-sm text-slate-600">C-level commitment and adequate budget allocation</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Security-First Approach</h4>
                        <p className="text-sm text-slate-600">Modern security practices from day one</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Comprehensive Testing</h4>
                        <p className="text-sm text-slate-600">Automated test coverage and validation strategy</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Strong Governance</h4>
                        <p className="text-sm text-slate-600">Clear ownership, milestones, and accountability</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ============================================
            TECHNICAL DETAILS TAB
            ============================================ */}
        {activeTab === "technical" && (
          <>
            <section className="mb-8">
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">📊 Technical Metrics</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="font-semibold text-slate-700 mb-3">🔒 Security Score</h3>
                    <div className="text-4xl font-bold text-slate-900 mb-2">
                      {metrics.securityScore}/100
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600"
                        style={{ width: `${metrics.securityScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="font-semibold text-slate-700 mb-3">⭐ Code Quality</h3>
                    <div className="text-4xl font-bold text-slate-900 mb-2">
                      {metrics.codeQualityScore}/100
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-600"
                        style={{ width: `${metrics.codeQualityScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="font-semibold text-slate-700 mb-3">🔧 Maintainability</h3>
                    <div className="text-4xl font-bold text-slate-900 mb-2">
                      {metrics.maintainabilityIndex}/100
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${metrics.maintainabilityIndex}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">🔍 All Security Findings</h2>
                {findings.securityIssues && findings.securityIssues.length > 0 ? (
                  <ul className="space-y-3">
                    {findings.securityIssues.map((issue, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <span className="text-xl">🚨</span>
                        <span className="text-slate-800">{issue}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600">No security issues detected.</p>
                )}
              </div>
            </section>
          </>
        )}

        {/* ============================================
            FOOTER
            ============================================ */}
        <footer className="text-center text-slate-500 text-sm py-8 border-t border-slate-200 mt-12">
          <p className="font-semibold">Powered by IBM Bob Orchestrator • RefactorDocs</p>
          <p className="mt-2">Executive Summary generated on {new Date(data.timestamp).toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate-400">Confidential - For Internal Use Only</p>
        </footer>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body.executive-print {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}