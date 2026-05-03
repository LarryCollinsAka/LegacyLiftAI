// components/AnalysisReport.tsx
// Formatted, printable analysis report - reads like a professional consulting document

"use client";

interface AnalysisReportProps {
  data: any;
}

export default function AnalysisReport({ data }: AnalysisReportProps) {
  const metrics = data.analysis?.metrics || {};
  const findings = data.analysis?.findings || {};
  const rawOutput = data.analysis?.rawOutput || "";

  // Parse Bob's raw output into sections
  const parseBobAnalysis = () => {
    const sections: Record<string, string> = {};
    
    // If no raw output, return empty sections
    if (!rawOutput || rawOutput.trim().length === 0) {
      return sections;
    }
    
    // Try to extract sections from Bob's output
    const sectionPatterns = [
      { key: "security", pattern: /security analysis|security assessment|security score/i },
      { key: "codeQuality", pattern: /code quality|code analysis|quality assessment/i },
      { key: "maintainability", pattern: /maintainability|maintenance|technical debt/i },
      { key: "architecture", pattern: /architecture|system design|structure/i },
      { key: "recommendations", pattern: /recommendations|suggestions|next steps/i },
    ];

    sectionPatterns.forEach(({ key, pattern }) => {
      const match = rawOutput.match(new RegExp(`${pattern.source}([^]*?)(?=\\n\\n[A-Z]|$)`, 'i'));
      if (match && match[1]) {
        sections[key] = match[1].trim();
      }
    });

    return sections;
  };

  const bobSections = parseBobAnalysis();

  return (
    <div className="bg-white">
      {/* ============================================
          COVER PAGE
          ============================================ */}
      <div className="min-h-screen flex flex-col items-center justify-center p-16 border-b-4 border-[#5B7CFA] print:break-after-page">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-[#7AA2FF] to-[#5B7CFA] rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-5xl font-bold">R</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-black text-slate-900 mb-4">
            Legacy Code Modernization
          </h1>
          <h2 className="text-3xl font-bold text-[#5B7CFA] mb-8">
            Analysis Report
          </h2>
          
          <div className="space-y-3 text-lg text-slate-700">
            <p><strong>Repository:</strong> {data.repository}</p>
            <p><strong>Files Analyzed:</strong> {data.filesAnalyzed}</p>
            <p><strong>Analysis Date:</strong> {new Date(data.timestamp).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-slate-200">
            <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">
              Powered by IBM Bob Orchestrator
            </p>
            <p className="text-sm text-slate-500 mt-2">
              RefactorDocs Intelligence Platform
            </p>
          </div>
        </div>
      </div>

      {/* ============================================
          EXECUTIVE SUMMARY
          ============================================ */}
      <div className="p-16 print:break-after-page">
        <h2 className="text-4xl font-black text-slate-900 mb-8 pb-4 border-b-4 border-[#5B7CFA]">
          Executive Summary
        </h2>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-slate-700 mb-8">
            This report provides a comprehensive analysis of <strong>{data.repository}</strong>, 
            examining {data.filesAnalyzed} source code files to assess security posture, code quality, 
            and modernization readiness.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Key Findings</h3>
          
          <div className="grid grid-cols-2 gap-8 my-8">
            <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Overall Risk Level
              </div>
              <div className="text-4xl font-black text-slate-900">
                {metrics.riskLevel}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Success Probability
              </div>
              <div className="text-4xl font-black text-slate-900">
                {metrics.successProbability}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Estimated Investment
              </div>
              <div className="text-4xl font-black text-slate-900">
                {metrics.budget}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Timeline
              </div>
              <div className="text-4xl font-black text-slate-900">
                {metrics.timeline}
              </div>
            </div>
          </div>

          <p className="text-lg leading-relaxed text-slate-700 mt-8">
            The recommended approach is <strong>{metrics.approach}</strong>, which balances 
            risk mitigation with business continuity. This strategy allows for incremental 
            modernization while maintaining operational stability.
          </p>
        </div>
      </div>

      {/* ============================================
          SECURITY ANALYSIS
          ============================================ */}
      <div className="p-16 print:break-after-page">
        <h2 className="text-4xl font-black text-slate-900 mb-8 pb-4 border-b-4 border-red-600">
          Security Analysis
        </h2>

        <div className="mb-8">
          <div className="flex items-center gap-6 bg-red-50 rounded-xl p-8 border-2 border-red-200">
            <div className="text-6xl">🔒</div>
            <div>
              <div className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
                Security Score
              </div>
              <div className="text-6xl font-black text-red-700">
                {metrics.securityScore}<span className="text-3xl text-red-400">/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Analysis Details</h3>
          
          <p className="text-lg leading-relaxed text-slate-700 mb-8">
            {metrics.securityScore < 30 ? (
              <>
                The security analysis reveals <strong>critical vulnerabilities</strong> requiring 
                immediate remediation. The codebase demonstrates significant security gaps that 
                expose the system to potential exploits and data breaches.
              </>
            ) : metrics.securityScore < 60 ? (
              <>
                The security analysis identifies <strong>moderate security concerns</strong> that 
                should be addressed systematically. While not critical, these issues present 
                measurable risk that could be exploited under certain conditions.
              </>
            ) : (
              <>
                The security analysis shows an <strong>acceptable security baseline</strong>. 
                The codebase demonstrates awareness of security best practices, though 
                opportunities for improvement exist.
              </>
            )}
          </p>

          {bobSections.security && (
            <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-200 my-8">
              <h4 className="text-lg font-bold text-slate-900 mb-4">Bob's Security Assessment</h4>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {bobSections.security}
              </div>
            </div>
          )}

          <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Critical Findings</h3>
          
          {findings.securityIssues && findings.securityIssues.length > 0 ? (
            <div className="space-y-6">
              {findings.securityIssues.map((issue: string, index: number) => (
                <div key={index} className="border-l-4 border-red-600 pl-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-2">{issue}</h4>
                      <p className="text-slate-600 text-sm">
                        <strong>Priority:</strong> High • 
                        <strong className="ml-2">Impact:</strong> Security Risk • 
                        <strong className="ml-2">Action:</strong> Immediate Remediation Required
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-green-50 rounded-xl p-8 border-2 border-green-200 text-center">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-lg font-semibold text-green-700">
                No critical security vulnerabilities detected
              </p>
            </div>
          )}

          <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Recommendations</h3>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-slate-700">
                Implement automated security scanning in CI/CD pipeline
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-slate-700">
                Update all dependencies with known CVEs to latest stable versions
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-slate-700">
                Establish regular security audit cadence (quarterly recommended)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-slate-700">
                Implement comprehensive input validation and sanitization
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* ============================================
          CODE QUALITY ANALYSIS
          ============================================ */}
      <div className="p-16 print:break-after-page">
        <h2 className="text-4xl font-black text-slate-900 mb-8 pb-4 border-b-4 border-orange-600">
          Code Quality Analysis
        </h2>

        <div className="mb-8">
          <div className="flex items-center gap-6 bg-orange-50 rounded-xl p-8 border-2 border-orange-200">
            <div className="text-6xl">⭐</div>
            <div>
              <div className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-2">
                Code Quality Score
              </div>
              <div className="text-6xl font-black text-orange-700">
                {metrics.codeQualityScore}<span className="text-3xl text-orange-400">/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Analysis Details</h3>
          
          <p className="text-lg leading-relaxed text-slate-700 mb-8">
            {metrics.codeQualityScore < 30 ? (
              <>
                The code quality assessment reveals <strong>significant technical debt</strong> and 
                architectural concerns. The codebase exhibits patterns that impede development 
                velocity and increase the likelihood of defects.
              </>
            ) : metrics.codeQualityScore < 60 ? (
              <>
                The code quality assessment identifies <strong>moderate improvement opportunities</strong>. 
                While functional, the codebase would benefit from systematic refactoring to reduce 
                complexity and improve maintainability.
              </>
            ) : (
              <>
                The code quality assessment demonstrates <strong>solid engineering practices</strong>. 
                The codebase shows evidence of thoughtful design and adherence to established 
                software engineering principles.
              </>
            )}
          </p>

          {bobSections.codeQuality && (
            <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-200 my-8">
              <h4 className="text-lg font-bold text-slate-900 mb-4">Bob's Quality Assessment</h4>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {bobSections.codeQuality}
              </div>
            </div>
          )}

          <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Key Observations</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3">Code Complexity</h4>
              <p className="text-slate-700 text-sm">
                Analysis of cyclomatic complexity and nesting depth across modules
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3">Design Patterns</h4>
              <p className="text-slate-700 text-sm">
                Evaluation of architectural patterns and adherence to SOLID principles
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3">Code Duplication</h4>
              <p className="text-slate-700 text-sm">
                Assessment of redundancy and opportunities for abstraction
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3">Documentation</h4>
              <p className="text-slate-700 text-sm">
                Review of inline comments, API documentation, and technical guides
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Recommendations</h3>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-slate-700">
                Establish coding standards and enforce through automated linting
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-slate-700">
                Implement systematic refactoring of high-complexity modules
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-slate-700">
                Increase code review rigor with mandatory peer approval
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* ============================================
          MAINTAINABILITY ANALYSIS
          ============================================ */}
      <div className="p-16 print:break-after-page">
        <h2 className="text-4xl font-black text-slate-900 mb-8 pb-4 border-b-4 border-blue-600">
          Maintainability Analysis
        </h2>

        <div className="mb-8">
          <div className="flex items-center gap-6 bg-blue-50 rounded-xl p-8 border-2 border-blue-200">
            <div className="text-6xl">🔧</div>
            <div>
              <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                Maintainability Index
              </div>
              <div className="text-6xl font-black text-blue-700">
                {metrics.maintainabilityIndex}<span className="text-3xl text-blue-400">/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Analysis Details</h3>
          
          <p className="text-lg leading-relaxed text-slate-700 mb-8">
            {metrics.maintainabilityIndex < 30 ? (
              <>
                The maintainability assessment indicates <strong>substantial challenges</strong> in 
                sustaining and evolving this codebase. High coupling and complexity create 
                significant friction for feature development and bug resolution.
              </>
            ) : metrics.maintainabilityIndex < 60 ? (
              <>
                The maintainability assessment reveals <strong>moderate sustainability concerns</strong>. 
                While maintainable in the short term, accumulating technical debt may impede 
                long-term evolution without intervention.
              </>
            ) : (
              <>
                The maintainability assessment demonstrates <strong>strong foundational health</strong>. 
                The codebase structure supports ongoing development with manageable long-term 
                maintenance costs.
              </>
            )}
          </p>

          {bobSections.maintainability && (
            <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-200 my-8">
              <h4 className="text-lg font-bold text-slate-900 mb-4">Bob's Maintainability Assessment</h4>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {bobSections.maintainability}
              </div>
            </div>
          )}

          <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Long-Term Implications</h3>
          
          <div className="bg-amber-50 rounded-xl p-8 border-2 border-amber-200 my-8">
            <p className="text-slate-700 leading-relaxed">
              <strong>Technical Debt Accumulation:</strong> At the current maintainability level, 
              estimated technical debt is <strong>{100 - metrics.maintainabilityIndex}%</strong>. 
              Without strategic intervention, this debt will compound, leading to:
            </p>
            <ul className="mt-4 space-y-2">
              <li>• Increased time-to-market for new features</li>
              <li>• Higher defect rates in production</li>
              <li>• Elevated operational costs</li>
              <li>• Difficulty attracting and retaining engineering talent</li>
            </ul>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Recommendations</h3>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-slate-700">
                Allocate 20% of sprint capacity to technical debt reduction
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-slate-700">
                Implement comprehensive automated test coverage (target: 80%+)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <span className="text-slate-700">
                Establish architecture decision records (ADRs) for all major changes
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* ============================================
          MODERNIZATION ROADMAP
          ============================================ */}
      <div className="p-16 print:break-after-page">
        <h2 className="text-4xl font-black text-slate-900 mb-8 pb-4 border-b-4 border-purple-600">
          Modernization Roadmap
        </h2>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-slate-700 mb-12">
            The recommended modernization strategy employs <strong>{metrics.approach}</strong>, 
            estimated to require <strong>{metrics.budget}</strong> investment over a 
            <strong> {metrics.timeline}</strong> timeline.
          </p>

          {findings.roadmap && findings.roadmap.length > 0 ? (
            <div className="space-y-8">
              {findings.roadmap.map((step: string, index: number) => {
                const phaseNumber = index + 1;
                const phaseColors = [
                  { bg: "bg-blue-50", border: "border-blue-600", badge: "bg-blue-600" },
                  { bg: "bg-purple-50", border: "border-purple-600", badge: "bg-purple-600" },
                  { bg: "bg-pink-50", border: "border-pink-600", badge: "bg-pink-600" },
                  { bg: "bg-orange-50", border: "border-orange-600", badge: "bg-orange-600" },
                ];
                const colors = phaseColors[index % 4];

                return (
                  <div key={index} className={`${colors.bg} rounded-xl p-8 border-2 ${colors.border}`}>
                    <div className="flex items-start gap-6">
                      <div className={`flex-shrink-0 w-16 h-16 ${colors.badge} text-white rounded-2xl flex items-center justify-center font-black text-2xl`}>
                        {phaseNumber}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">
                          Phase {phaseNumber}: {step.split(":")[0] || `Step ${phaseNumber}`}
                        </h3>
                        <p className="text-lg text-slate-700 leading-relaxed">
                          {step.split(":").slice(1).join(":").trim() || step}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-600">Detailed roadmap being finalized based on stakeholder priorities.</p>
          )}

          <h3 className="text-2xl font-bold text-slate-900 mt-16 mb-6">Success Metrics</h3>
          
          <p className="text-lg text-slate-700 mb-6">
            The following metrics will be tracked throughout modernization to ensure progress and ROI:
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">Deployment Frequency</h4>
              <p className="text-slate-600 text-sm">Measure time from commit to production</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">Mean Time to Recovery</h4>
              <p className="text-slate-600 text-sm">Average time to restore service after incident</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">Change Failure Rate</h4>
              <p className="text-slate-600 text-sm">Percentage of changes causing production failures</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">Lead Time for Changes</h4>
              <p className="text-slate-600 text-sm">Time from code commit to production release</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          CONCLUSION
          ============================================ */}
      <div className="p-16">
        <h2 className="text-4xl font-black text-slate-900 mb-8 pb-4 border-b-4 border-[#5B7CFA]">
          Conclusion & Next Steps
        </h2>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-slate-700 mb-8">
            This comprehensive analysis of <strong>{data.repository}</strong> reveals a system 
            with a <strong>{metrics.riskLevel}</strong> risk profile and 
            <strong> {metrics.successProbability}</strong> probability of successful modernization.
          </p>

          <h3 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Immediate Actions (Week 1-2)</h3>
          
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#5B7CFA] text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </span>
              <span className="text-slate-700">
                Secure executive sponsorship and budget allocation
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#5B7CFA] text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </span>
              <span className="text-slate-700">
                Assemble modernization taskforce with technical and business representation
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#5B7CFA] text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </span>
              <span className="text-slate-700">
                Address critical security vulnerabilities identified in this report
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#5B7CFA] text-white rounded-full flex items-center justify-center font-bold text-sm">
                4
              </span>
              <span className="text-slate-700">
                Establish baseline metrics for tracking modernization progress
              </span>
            </li>
          </ol>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-[#5B7CFA] mt-12">
            <h4 className="text-xl font-bold text-slate-900 mb-4">Final Recommendation</h4>
            <p className="text-lg text-slate-700 leading-relaxed">
              Based on this analysis, we recommend proceeding with modernization using the 
              <strong> {metrics.approach}</strong> strategy. This approach balances technical risk 
              with business value delivery, enabling iterative progress while maintaining operational 
              stability throughout the transformation.
            </p>
          </div>

          <div className="mt-16 pt-8 border-t-2 border-slate-200 text-center">
            <p className="text-slate-500 text-sm">
              <strong>Report Generated:</strong> {new Date(data.timestamp).toLocaleString()}
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Analysis Platform: RefactorDocs • Powered by IBM Bob Orchestrator
            </p>
            <p className="text-slate-400 text-xs mt-4">
              Confidential - For Internal Use Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}