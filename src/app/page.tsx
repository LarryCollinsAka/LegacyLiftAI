"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisMethod, setAnalysisMethod] = useState<"url" | "upload">("url");
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // ANALYZE GITHUB URL
  // ============================================
  async function handleAnalyzeURL() {
    if (!repo.trim()) return;
    
    try {
      setLoading(true);
      setUploadProgress(10);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          repo,
          method: "github-url" 
        }),
      });

      setUploadProgress(50);
      const data = await res.json();
      
      setUploadProgress(100);
      localStorage.setItem("analysis", JSON.stringify(data));
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
      
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please check the repository URL.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }

  // ============================================
  // ANALYZE UPLOADED FILES
  // ============================================
  async function handleAnalyzeUpload() {
    if (uploadedFiles.length === 0) return;

    try {
      setLoading(true);
      setUploadProgress(10);

      // Create FormData with all files
      const formData = new FormData();
      uploadedFiles.forEach((file, index) => {
        formData.append('files', file);
      });
      formData.append('method', 'upload');

      setUploadProgress(30);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(70);
      const data = await res.json();
      
      setUploadProgress(100);
      localStorage.setItem("analysis", JSON.stringify(data));
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);

    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }

  // ============================================
  // FILE UPLOAD HANDLERS
  // ============================================
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  }

  function addFiles(files: File[]) {
    // Filter for code files only
    const codeFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'rb', 'php', 'go', 'rs'];
      return codeExtensions.includes(ext || '');
    });

    setUploadedFiles(prev => [...prev, ...codeFiles]);
    setAnalysisMethod("upload");
  }

  function removeFile(index: number) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }

  // ============================================
  // DRAG & DROP HANDLERS
  // ============================================
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }

  // ============================================
  // FORMAT FILE SIZE
  // ============================================
  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4] px-6 flex items-center justify-center">
      <div className="max-w-6xl w-full text-center py-16">
        <p className="text-[#5B7CFA] font-bold mb-4 text-lg">
          Powered by IBM Bob Orchestrator
        </p>
        
        <h1 className="text-6xl md:text-7xl font-extrabold leading-tight text-slate-900">
          Turn Legacy Code Into{" "}
          <span className="bg-gradient-to-r from-[#7AA2FF] via-[#5B7CFA] to-[#3E63DD] bg-clip-text text-transparent">
            Clear Intelligence
          </span>
        </h1>
        
        <p className="text-slate-600 text-xl mt-6 mb-10 max-w-3xl mx-auto leading-8">
          Analyze any GitHub repository or upload your codebase to instantly uncover risks,
          architecture insights, technical debt, and modernization plans.
        </p>

        {/* ============================================
            ANALYSIS METHOD SELECTOR
            ============================================ */}
        <div className="flex gap-3 max-w-md mx-auto mb-6">
          <button
            onClick={() => setAnalysisMethod("url")}
            className={`flex-1 py-3 px-5 rounded-xl font-semibold transition ${
              analysisMethod === "url"
                ? "bg-white border-2 border-[#5B7CFA] text-[#5B7CFA] shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            📎 GitHub URL
          </button>
          <button
            onClick={() => setAnalysisMethod("upload")}
            className={`flex-1 py-3 px-5 rounded-xl font-semibold transition ${
              analysisMethod === "upload"
                ? "bg-white border-2 border-[#5B7CFA] text-[#5B7CFA] shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            📁 Upload Files
          </button>
        </div>

        {/* ============================================
            GITHUB URL INPUT
            ============================================ */}
        {analysisMethod === "url" && (
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm outline-none focus:ring-2 focus:ring-[#5B7CFA] text-slate-900"
            />
            <button
              onClick={handleAnalyzeURL}
              disabled={!repo.trim() || loading}
              className={`rounded-2xl px-7 py-4 text-white font-bold shadow-md transition ${
                !repo.trim() || loading
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#7AA2FF] via-[#5B7CFA] to-[#3E63DD] hover:scale-[1.02]'
              }`}
            >
              {loading ? "Analyzing..." : "Analyze Repo"}
            </button>
          </div>
        )}

        {/* ============================================
            FILE UPLOAD AREA
            ============================================ */}
        {analysisMethod === "upload" && (
          <div className="max-w-3xl mx-auto">
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => folderInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed bg-white p-12 cursor-pointer transition-all ${
                isDragging
                  ? "border-[#5B7CFA] bg-blue-50 scale-[1.02]"
                  : "border-slate-300 hover:border-slate-400"
              }`}
            >
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Drop your codebase here
              </h3>
              <p className="text-slate-600 mb-4">
                or click to browse files and folders
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-sm transition"
                >
                  📄 Select Files
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-sm transition"
                >
                  📁 Select Folder
                </button>
              </div>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.rb,.php,.go,.rs"
            />
            <input
              ref={folderInputRef}
              type="file"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6 text-left shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-900">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <button
                    onClick={() => setUploadedFiles([])}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl">📄</span>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-3 text-red-600 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAnalyzeUpload}
                  disabled={loading}
                  className={`w-full mt-6 rounded-xl px-7 py-4 text-white font-bold shadow-md transition ${
                    loading
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#7AA2FF] via-[#5B7CFA] to-[#3E63DD] hover:scale-[1.01]'
                  }`}
                >
                  {loading ? "Analyzing..." : `Analyze ${uploadedFiles.length} Files`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            PROGRESS BAR
            ============================================ */}
        {loading && uploadProgress > 0 && (
          <div className="max-w-3xl mx-auto mt-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-slate-900">
                  Analyzing with IBM Bob...
                </span>
                <span className="text-sm text-slate-600">{uploadProgress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7AA2FF] via-[#5B7CFA] to-[#3E63DD] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================
            FEATURE CARDS
            ============================================ */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="rounded-3xl bg-white border border-slate-200 p-7 shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="font-bold text-2xl text-slate-900">
              Risk Detection
            </h3>
            <p className="text-slate-600 mt-3 leading-7">
              Surface hidden security, architecture, and production risks instantly with Bob's 3-agent analysis.
            </p>
          </div>
          
          <div className="rounded-3xl bg-white border border-slate-200 p-7 shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="font-bold text-2xl text-slate-900">
              Living Docs
            </h3>
            <p className="text-slate-600 mt-3 leading-7">
              Generate comprehensive onboarding guides and documentation automatically from your codebase.
            </p>
          </div>
          
          <div className="rounded-3xl bg-white border border-slate-200 p-7 shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="font-bold text-2xl text-slate-900">
              Roadmaps
            </h3>
            <p className="text-slate-600 mt-3 leading-7">
              Get prioritized modernization plans with budget and timeline estimates in minutes.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}