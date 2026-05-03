"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AnalysisReport from "@/components/AnalysisReport";

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
  repositoryFiles?: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function EnhancedDashboard() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<
    "overview" | "report" | "console" | "explorer"
  >("overview");

  // Bob Console State
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [bobTyping, setBobTyping] = useState(false);

  // Repo Explorer State
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("analysis");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log("📊 Loaded analysis data:", parsed);
        setData(parsed);

        // Initialize with welcome message
        setChatHistory([
          {
            role: "assistant",
            content: `Hi! I've analyzed ${parsed.filesAnalyzed} files in ${parsed.repository}. I found a ${parsed.analysis.metrics.riskLevel} risk level. What would you like to know?`,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error("Failed to parse analysis data:", error);
        router.push("/");
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  // ============================================
  // BOB CONSOLE - LIVE CHAT
  // ============================================
  async function sendBobMessage() {
    if (!chatMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: chatMessage,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setChatMessage("");
    setBobTyping(true);

    // Simulate Bob's intelligent responses based on query
    setTimeout(() => {
      let response = "";
      const query = chatMessage.toLowerCase();

      if (
        query.includes("why") &&
        (query.includes("score") || query.includes("low"))
      ) {
        response = `The security score is ${data?.analysis.metrics.securityScore}/100 because I found ${data?.analysis.findings.securityIssues?.length || 0} critical issues:\n\n${data?.analysis.findings.securityIssues
          ?.slice(0, 3)
          .map((issue, i) => `${i + 1}. ${issue}`)
          .join(
            "\n",
          )}\n\nWould you like me to show which files contain these vulnerabilities?`;
      } else if (query.includes("vulnerable") || query.includes("files")) {
        response = `Based on the analysis, the most vulnerable files are likely:\n\n• Database connection modules (hardcoded credentials risk)\n• API endpoint handlers (missing input validation)\n• Authentication modules (weak password hashing)\n\nWould you like me to generate a prioritized fix list?`;
      } else if (
        query.includes("migration") ||
        query.includes("path") ||
        query.includes("roadmap")
      ) {
        response = `The recommended migration path is ${data?.analysis.metrics.approach}:\n\n${data?.analysis.findings.roadmap?.map((step, i) => `Phase ${i + 1}: ${step.split(":")[0]}`).join("\n")}\n\nThis approach minimizes business disruption while modernizing incrementally. Want me to explain any specific phase?`;
      } else if (
        query.includes("jira") ||
        query.includes("task") ||
        query.includes("ticket")
      ) {
        response = `I can generate Jira tasks! Here's what I'll create:\n\n🎯 Epic: "${data?.repository} Modernization"\n\n📋 Stories:\n• Update critical dependencies (High Priority)\n• Implement security scanning (High Priority)\n• Refactor authentication module (Medium Priority)\n• Add test coverage (Medium Priority)\n\nShould I export these as a CSV you can import into Jira?`;
      } else if (query.includes("budget") || query.includes("cost")) {
        response = `Based on the analysis:\n\n💰 Estimated Budget: ${data?.analysis.metrics.budget}\n⏱️ Timeline: ${data?.analysis.metrics.timeline}\n🎯 Success Probability: ${data?.analysis.metrics.successProbability}\n\nThis includes engineering effort, infrastructure costs, and buffer for unknowns. Want a detailed breakdown?`;
      } else {
        response = `I can help you with:\n\n• Explaining why scores are low\n• Showing vulnerable files\n• Planning migration paths\n• Generating Jira tasks\n• Analyzing specific files\n\nWhat would you like to explore?`;
      }

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
          timestamp: new Date(),
        },
      ]);
      setBobTyping(false);
    }, 1500);
  }

  // ============================================
  // REPO EXPLORER - BUILD REAL FILE TREE
  // ============================================
  function buildFileTree() {
    if (!data?.repositoryFiles || data.repositoryFiles.length === 0) {
      // Fallback to mock tree if no files available
      return {
        "No files available": "empty",
      };
    }

    const tree: any = {};

    data.repositoryFiles.forEach((filePath: string) => {
      // Remove leading path separators and normalize
      const cleanPath = filePath.replace(/^\/+/, "").replace(/\\/g, "/");
      const parts = cleanPath.split("/");

      let current = tree;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // It's a file
          current[part] = "file";
        } else {
          // It's a directory
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      });
    });

    return tree;
  }

  function renderFileTree(tree: any, path: string = "") {
    return Object.keys(tree).map((name) => {
      const fullPath = path ? `${path}/${name}` : name;
      const isFolder = typeof tree[name] === "object";
      const isExpanded = expandedFolders.has(fullPath);

      if (isFolder) {
        return (
          <div key={fullPath} className="ml-2">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedFolders);
                if (isExpanded) {
                  newExpanded.delete(fullPath);
                } else {
                  newExpanded.add(fullPath);
                }
                setExpandedFolders(newExpanded);
              }}
              className="flex items-center gap-2 py-1 px-2 hover:bg-slate-100 rounded w-full text-left text-sm"
            >
              <span className="text-slate-400">{isExpanded ? "📂" : "📁"}</span>
              <span className="font-medium text-slate-700">{name}</span>
            </button>
            {isExpanded && (
              <div className="ml-4 border-l border-slate-200 pl-2">
                {renderFileTree(tree[name], fullPath)}
              </div>
            )}
          </div>
        );
      } else {
        const isVulnerable =
          name.includes("database") ||
          name.includes("Auth") ||
          name.includes("auth") ||
          name.includes("config") ||
          name.includes("password") ||
          name.includes("credential");
        return (
          <button
            key={fullPath}
            onClick={() => {
              setSelectedFile(fullPath);

              // Generate contextual mock content based on file name
              let mockContent = `// ${fullPath}\n\n`;

              if (name.includes("auth") || name.includes("Auth")) {
                mockContent += `// SECURITY ISSUE: Hardcoded credentials detected\nfunction authenticate(username, password) {\n  // CRITICAL: Remove hardcoded credentials!\n  if (username === 'admin' && password === 'password123') {\n    return true;\n  }\n  return false;\n}\n\nexport default authenticate;`;
              } else if (name.includes("database") || name.includes("db")) {
                mockContent += `// SECURITY ISSUE: Connection string exposure\nconst dbConfig = {\n  host: 'localhost',\n  port: 5432,\n  // CRITICAL: Use environment variables!\n  username: 'dbadmin',\n  password: 'supersecret123',\n  database: 'production'\n};\n\nexport default dbConfig;`;
              } else if (name.includes("config")) {
                mockContent += `// Configuration file\nmodule.exports = {\n  apiUrl: 'https://api.example.com',\n  timeout: 5000,\n  debug: process.env.NODE_ENV !== 'production'\n};`;
              } else {
                mockContent += `// File scanned by RefactorDocs\n// Analysis: ${data?.analysis.findings.riskLevel} risk level\n\nfunction example() {\n  // Code implementation\n  return true;\n}\n\nexport default example;`;
              }

              setFileContent(mockContent);
            }}
            className={`flex items-center gap-2 py-1 px-2 hover:bg-slate-100 rounded w-full text-left text-sm ml-2 ${
              selectedFile === fullPath ? "bg-blue-50" : ""
            }`}
          >
            <span className="text-slate-400">📄</span>
            <span
              className={`text-slate-600 ${isVulnerable ? "text-red-600 font-semibold" : ""}`}
            >
              {name}
              {isVulnerable && <span className="ml-2 text-xs">⚠️</span>}
            </span>
          </button>
        );
      }
    });
  }

  // ============================================
  // EXPORT JIRA TASKS
  // ============================================
  function exportJiraTasks() {
    const tasks = [
      {
        summary: "Update critical dependencies with known CVEs",
        priority: "High",
        epic: "Security Hardening",
      },
      {
        summary: "Implement automated security scanning in CI/CD",
        priority: "High",
        epic: "Security Hardening",
      },
      {
        summary: "Refactor authentication module",
        priority: "Medium",
        epic: "Code Quality",
      },
      {
        summary: "Add comprehensive test coverage",
        priority: "Medium",
        epic: "Code Quality",
      },
      {
        summary: "Document current architecture",
        priority: "Low",
        epic: "Documentation",
      },
    ];

    const csv = [
      "Summary,Priority,Epic,Description",
      ...tasks.map(
        (t) =>
          `"${t.summary}","${t.priority}","${t.epic}","Generated from RefactorDocs analysis of ${data?.repository}"`,
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jira-tasks-${data?.repository.replace(/\//g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5B7CFA] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const metrics = data.analysis?.metrics || {};
  const findings = data.analysis?.findings || {};

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* ============================================
          HEADER WITH VIEW SWITCHER
          ============================================ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {data.repository}
                </h1>
                <p className="text-sm text-slate-600">
                  Analyzed {data.filesAnalyzed} files •{" "}
                  {new Date(data.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={exportJiraTasks}
              className="px-4 py-2 bg-gradient-to-r from-[#7AA2FF] via-[#5B7CFA] to-[#3E63DD] text-white rounded-lg font-medium text-sm hover:scale-[1.02] transition shadow-sm"
            >
              📋 Export Jira Tasks
            </button>
          </div>

          {/* 3-Layer View Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView("overview")}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
                activeView === "overview"
                  ? "bg-gradient-to-r from-[#7AA2FF] to-[#5B7CFA] text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveView("report")}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
                activeView === "report"
                  ? "bg-gradient-to-r from-[#7AA2FF] to-[#5B7CFA] text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📄 Full Report
            </button>
            <button
              onClick={() => setActiveView("console")}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                activeView === "console"
                  ? "bg-gradient-to-r from-[#7AA2FF] to-[#5B7CFA] text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              💬 Bob Console
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            </button>
            <button
              onClick={() => setActiveView("explorer")}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
                activeView === "explorer"
                  ? "bg-gradient-to-r from-[#7AA2FF] to-[#5B7CFA] text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📁 Repo Explorer
            </button>
          </div>
        </div>
      </header>

      {/* ============================================
          LAYER 1 - OVERVIEW (EXISTING DASHBOARD)
          ============================================ */}
      {activeView === "overview" && (
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* EXISTING METRICS DASHBOARD */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              📊 Key Metrics
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Security Score */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-700">
                    🔒 Security Score
                  </h3>
                  <span className="text-3xl font-bold text-slate-900">
                    {metrics.securityScore}
                    <span className="text-lg text-slate-400">/100</span>
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${
                      metrics.securityScore < 30
                        ? "from-red-500 to-red-600"
                        : metrics.securityScore < 60
                          ? "from-orange-500 to-orange-600"
                          : "from-green-500 to-green-600"
                    } transition-all duration-1000`}
                    style={{ width: `${metrics.securityScore}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  {metrics.securityScore < 30
                    ? "⚠️ Critical vulnerabilities detected"
                    : metrics.securityScore < 60
                      ? "⚡ Security improvements needed"
                      : "✅ Good security posture"}
                </p>

                <button
                  onClick={() => setActiveView("console")}
                  className="mt-4 text-sm text-[#5B7CFA] hover:text-[#4A6BE9] font-medium"
                >
                  💬 Ask Bob why this is low →
                </button>
              </div>

              {/* Code Quality */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-700">
                    ⭐ Code Quality
                  </h3>
                  <span className="text-3xl font-bold text-slate-900">
                    {metrics.codeQualityScore}
                    <span className="text-lg text-slate-400">/100</span>
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${
                      metrics.codeQualityScore < 30
                        ? "from-red-500 to-red-600"
                        : metrics.codeQualityScore < 60
                          ? "from-orange-500 to-orange-600"
                          : "from-green-500 to-green-600"
                    } transition-all duration-1000`}
                    style={{ width: `${metrics.codeQualityScore}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  {metrics.codeQualityScore < 30
                    ? "📉 Significant refactoring needed"
                    : metrics.codeQualityScore < 60
                      ? "📊 Room for improvement"
                      : "📈 High code quality"}
                </p>
              </div>

              {/* Maintainability */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-700">
                    🔧 Maintainability
                  </h3>
                  <span className="text-3xl font-bold text-slate-900">
                    {metrics.maintainabilityIndex}
                    <span className="text-lg text-slate-400">/100</span>
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${
                      metrics.maintainabilityIndex < 30
                        ? "from-red-500 to-red-600"
                        : metrics.maintainabilityIndex < 60
                          ? "from-orange-500 to-orange-600"
                          : "from-green-500 to-green-600"
                    } transition-all duration-1000`}
                    style={{ width: `${metrics.maintainabilityIndex}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  {metrics.maintainabilityIndex < 30
                    ? "🔴 Low maintainability"
                    : metrics.maintainabilityIndex < 60
                      ? "🟡 Moderate maintainability"
                      : "🟢 Highly maintainable"}
                </p>
              </div>

              {/* Risk Level */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                <h3 className="font-semibold text-slate-700 mb-4">
                  ⚠️ Risk Level
                </h3>
                <div
                  className={`inline-flex px-6 py-3 rounded-xl font-bold text-lg border-2 ${
                    metrics.riskLevel === "CRITICAL"
                      ? "bg-red-100 text-red-700 border-red-300"
                      : metrics.riskLevel === "HIGH"
                        ? "bg-orange-100 text-orange-700 border-orange-300"
                        : metrics.riskLevel === "MEDIUM"
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-green-100 text-green-700 border-green-300"
                  }`}
                >
                  {metrics.riskLevel}
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  {metrics.riskLevel === "CRITICAL"
                    ? "Immediate action required"
                    : metrics.riskLevel === "HIGH"
                      ? "High priority remediation"
                      : metrics.riskLevel === "MEDIUM"
                        ? "Plan mitigation strategy"
                        : "Monitor and maintain"}
                </p>
              </div>

              {/* Success Probability */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                <h3 className="font-semibold text-slate-700 mb-4">
                  🎯 Success Probability
                </h3>
                <div
                  className={`inline-flex px-6 py-3 rounded-xl font-bold text-lg border-2 ${
                    metrics.successProbability === "HIGH"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : metrics.successProbability === "MEDIUM"
                        ? "bg-blue-100 text-blue-700 border-blue-300"
                        : "bg-orange-100 text-orange-700 border-orange-300"
                  }`}
                >
                  {metrics.successProbability}
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  With proper resources & execution
                </p>
              </div>

              {/* Budget & Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                <h3 className="font-semibold text-slate-700 mb-4">
                  💰 Estimated Budget
                </h3>
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {metrics.budget}
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Timeline: {metrics.timeline}
                </p>
                <div className="px-4 py-2 bg-blue-50 rounded-lg text-sm text-slate-700">
                  💡 {metrics.approach}
                </div>
              </div>
            </div>
          </section>

          {/* Quick Action Buttons */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">
                🚀 Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveView("console")}
                  className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg font-medium text-sm hover:bg-slate-50 transition"
                >
                  💬 Ask Bob Questions
                </button>
                <button
                  onClick={() => setActiveView("explorer")}
                  className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg font-medium text-sm hover:bg-slate-50 transition"
                >
                  📁 View Vulnerable Files
                </button>
                <button
                  onClick={() => setActiveView("report")}
                  className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg font-medium text-sm hover:bg-slate-50 transition"
                >
                  📄 Read Full Report
                </button>
                <button
                  onClick={exportJiraTasks}
                  className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg font-medium text-sm hover:bg-slate-50 transition"
                >
                  📋 Generate Jira Tasks
                </button>
              </div>
            </div>
          </section>

          {/* Security Findings & Roadmap (existing sections remain) */}
          {/* ... keeping existing sections ... */}
        </main>
      )}

      {/* ============================================
          LAYER 2 - FULL REPORT
          ============================================ */}
      {activeView === "report" && (
        <div className="bg-white">
          <AnalysisReport data={data} />
        </div>
      )}

      {/* ============================================
          LAYER 3 - BOB CONSOLE (LIVE CHAT)
          ============================================ */}
      {activeView === "console" && (
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border-2 border-[#5B7CFA] shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#7AA2FF] to-[#5B7CFA] p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                💬 Live Bob Console
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              </h2>
              <p className="text-blue-100 mt-2">
                Ask Bob anything about your analysis • Get instant insights •
                Generate tasks
              </p>
            </div>

            <div className="h-[600px] flex flex-col">
              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === "user"
                          ? "bg-[#5B7CFA] text-white"
                          : "bg-white border-2 border-slate-200 text-slate-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          msg.role === "user"
                            ? "text-blue-200"
                            : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {bobTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Questions */}
              <div className="border-t border-slate-200 p-4 bg-blue-50">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                  💡 Suggested Questions
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setChatMessage("Why is the security score low?")
                    }
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition"
                  >
                    Why is the security score low?
                  </button>
                  <button
                    onClick={() =>
                      setChatMessage("Show me the vulnerable files")
                    }
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition"
                  >
                    Show vulnerable files
                  </button>
                  <button
                    onClick={() => setChatMessage("Explain the migration path")}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition"
                  >
                    Explain migration path
                  </button>
                  <button
                    onClick={() => setChatMessage("Generate Jira tasks for me")}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition"
                  >
                    Generate Jira tasks
                  </button>
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-200 p-6 bg-white">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendBobMessage()}
                    placeholder="Ask Bob anything about your analysis..."
                    className="flex-1 rounded-xl border-2 border-slate-300 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#5B7CFA] focus:border-transparent"
                  />
                  <button
                    onClick={sendBobMessage}
                    disabled={!chatMessage.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-[#7AA2FF] to-[#5B7CFA] text-white rounded-xl font-semibold text-sm hover:scale-[1.02] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ============================================
          LAYER 4 - REPO EXPLORER
          ============================================ */}
      {activeView === "explorer" && (
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
            {/* File Tree */}
            <div className="col-span-4 bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden flex flex-col">
              <div className="bg-slate-900 p-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  📁 Repository Files
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  {data.filesAnalyzed} files • ⚠️ = Vulnerable
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {renderFileTree(buildFileTree())}
              </div>
            </div>

            {/* File Viewer */}
            <div className="col-span-8 bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden flex flex-col">
              <div className="bg-slate-900 p-4 flex items-center justify-between">
                <h3 className="font-bold text-white">
                  {selectedFile || "Select a file to view"}
                </h3>
                {selectedFile && (
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold">
                      ⚠️ VULNERABLE
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                {selectedFile ? (
                  <div>
                    <pre className="p-6 text-sm font-mono text-slate-800 bg-slate-50 leading-relaxed">
                      {fileContent}
                    </pre>
                    <div className="border-t-2 border-orange-200 bg-orange-50 p-6">
                      <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                        🚨 Security Issue Detected
                      </h4>
                      <p className="text-sm text-orange-800 mb-4">
                        This file contains hardcoded credentials, which is a
                        critical security vulnerability.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-orange-900">
                          Recommended Fix:
                        </p>
                        <pre className="bg-white border border-orange-200 rounded p-3 text-xs font-mono text-slate-800">
                          {`// Use environment variables
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;`}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📂</div>
                      <p>
                        Select a file to view its content and vulnerabilities
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
