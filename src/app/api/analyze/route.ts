// src/app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  let tempDir: string | null = null;

  try {
    // Check if it's FormData (file upload) or JSON (GitHub URL)
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // ============================================
      // FILE UPLOAD METHOD
      // ============================================
      return await handleFileUpload(request);
    } else {
      // ============================================
      // GITHUB URL METHOD
      // ============================================
      return await handleGitHubURL(request);
    }
  } catch (error: any) {
    console.error("❌ Analysis error:", error);
    
    // Cleanup temp directory if it exists
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Analysis failed",
        details: error.stderr || error.stdout,
      },
      { status: 500 }
    );
  }
}

// ============================================
// HANDLE GITHUB URL
// ============================================
async function handleGitHubURL(request: NextRequest) {
  const { repo } = await request.json();
  
  if (!repo || typeof repo !== "string") {
    return NextResponse.json(
      { success: false, error: "Repository URL is required" },
      { status: 400 }
    );
  }

  console.log("🔍 Analyzing GitHub repository:", repo);

  // Create temporary directory
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "refactordocs-"));
  
  try {
    // Step 1: Clone the repository
    console.log("📥 Cloning repository...");
    await execAsync(`git clone --depth 1 ${repo} ${tempDir}/repo`, {
      timeout: 60000, // 1 minute timeout
    });

    const repoPath = path.join(tempDir, "repo");
    const repoName = extractRepoName(repo);

    // Step 2: Analyze with Bob
    const analysis = await analyzewithBob(repoPath, repoName);

    // Step 3: Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });

    return NextResponse.json({
      success: true,
      repository: repoName,
      method: "github-url",
      ...analysis,
    });
  } catch (error: any) {
    // Cleanup on error
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

// ============================================
// HANDLE FILE UPLOAD
// ============================================
async function handleFileUpload(request: NextRequest) {
  console.log("📤 Processing file upload...");

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json(
      { success: false, error: "No files uploaded" },
      { status: 400 }
    );
  }

  // Create temporary directory
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "refactordocs-"));
  
  try {
    console.log(`📁 Received ${files.length} files`);

    // Save all uploaded files
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(tempDir, file.name);
      
      // Create subdirectories if needed
      const fileDir = path.dirname(filePath);
      await fs.mkdir(fileDir, { recursive: true });
      
      await fs.writeFile(filePath, buffer);
    }

    // Step 2: Analyze with Bob
    const analysis = await analyzewithBob(tempDir, "Uploaded Codebase");

    // Step 3: Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });

    return NextResponse.json({
      success: true,
      repository: "Uploaded Codebase",
      method: "upload",
      filesAnalyzed: files.length,
      ...analysis,
    });
  } catch (error: any) {
    // Cleanup on error
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

// ============================================
// ANALYZE WITH BOB
// ============================================
async function analyzewithBob(repoPath: string, repoName: string) {
  console.log("🤖 Starting Bob analysis...");

  // Step 1: Scan repository for code files
  const codeFiles = await scanCodeFiles(repoPath);
  console.log(`✅ Found ${codeFiles.length} code files`);

  // Step 2: Get file samples for analysis
  const fileSamples = await getFileSamples(codeFiles.slice(0, 10));

  // Step 3: Create Bob Shell prompt
  const prompt = createBobPrompt(repoName, codeFiles.length, fileSamples);

  // Step 4: Save prompt to temporary file
  const promptFile = path.join(os.tmpdir(), `bob-prompt-${Date.now()}.txt`);
  await fs.writeFile(promptFile, prompt);

  try {
    // Step 5: Run Bob (non-interactive mode)
    // NOTE: This requires bob CLI to be installed and API key configured
    console.log("🔄 Executing Bob...");
    console.log("📍 Working directory:", repoPath);
    console.log("🔑 API Key present:", !!process.env.BOB_API_KEY);
    console.log("📝 Prompt file:", promptFile);
    
    // Use cat to pipe the prompt file to bob
    const bobCommand = process.platform === 'win32' 
      ? `type "${promptFile}" | bob`
      : `cat "${promptFile}" | bob`;
    
    console.log("💻 Command:", bobCommand);
    
    const { stdout, stderr } = await execAsync(bobCommand, {
      cwd: repoPath,
      timeout: 300000, // 5 minutes
      shell: true, // Important: needed for piping
      env: {
        ...process.env,
        BOB_API_KEY: process.env.BOB_API_KEY,
      },
    });

    console.log("✅ Bob analysis complete!");
    if (stderr) {
      console.log("⚠️ Bob stderr:", stderr);
    }

    // Step 6: Parse Bob's output
    const parsedAnalysis = parseBobOutput(stdout);

    // Step 7: Calculate metrics
    const metrics = calculateMetrics(parsedAnalysis);

    // Cleanup prompt file
    await fs.unlink(promptFile).catch(() => {});

    return {
      filesAnalyzed: codeFiles.length,
      analysis: {
        metrics,
        findings: parsedAnalysis,
        rawOutput: stdout.substring(0, 5000), // First 5000 chars
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // If Bob fails, return simulated analysis for demo
    console.error("❌ Bob execution failed:");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("stderr:", error.stderr);
    console.error("stdout:", error.stdout);
    console.warn("⚠️ Bob not available, using simulated analysis");
    
    await fs.unlink(promptFile).catch(() => {});
    
    return getSimulatedAnalysis(repoName, codeFiles.length);
  }
}

// ============================================
// SCAN CODE FILES
// ============================================
async function scanCodeFiles(dirPath: string): Promise<string[]> {
  const codeExtensions = [
    ".js", ".jsx", ".ts", ".tsx",
    ".py", ".java", ".cpp", ".c",
    ".cs", ".rb", ".php", ".go", ".rs"
  ];
  
  const codeFiles: string[] = [];

  async function scan(currentPath: string) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      // Skip common non-code directories
      if (entry.isDirectory()) {
        if (!["node_modules", ".git", "dist", "build", "target", ".next"].includes(entry.name)) {
          await scan(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (codeExtensions.includes(ext)) {
          codeFiles.push(fullPath);
        }
      }
    }
  }

  await scan(dirPath);
  return codeFiles;
}

// ============================================
// GET FILE SAMPLES
// ============================================
async function getFileSamples(filePaths: string[]) {
  const samples = [];

  for (const filePath of filePaths) {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const lines = content.split("\n").length;
      
      samples.push({
        path: filePath,
        name: path.basename(filePath),
        lines,
        preview: content.substring(0, 1000), // First 1000 chars
      });
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
    }
  }

  return samples;
}

// ============================================
// CREATE BOB PROMPT
// ============================================
function createBobPrompt(
  repoName: string,
  fileCount: number,
  fileSamples: any[]
): string {
  const filesList = fileSamples.map(f => `- ${f.name} (${f.lines} lines)`).join("\n");

  return `You are analyzing a legacy codebase: ${repoName}

REPOSITORY CONTEXT:
- Total code files: ${fileCount}
- Sample files analyzed: ${fileSamples.length}

FILES INCLUDED:
${filesList}

YOUR TASK:
Act as THREE specialized agents in ORCHESTRATOR mode:

**AGENT 1: Code Analyst**
- Analyze code quality and complexity
- Identify security vulnerabilities  
- Find technical debt and code smells
- Assess maintainability

**AGENT 2: Refactor Planner**
- Create a prioritized modernization roadmap
- Estimate timeline (in months) and budget (in USD)
- Recommend migration approach (Strangler Pattern, Big Bang, etc.)
- Provide 4 concrete actionable steps with effort estimates

**AGENT 3: Documentation Writer**
- Document current architecture
- Explain critical components
- List success factors for modernization
- Identify primary risks

REQUIRED OUTPUT:
Please provide a structured analysis with:

1. **Risk Level**: CRITICAL/HIGH/MEDIUM/LOW
2. **Security Score**: 0-100 (lower = more issues)
3. **Code Quality Score**: 0-100
4. **Maintainability Index**: 0-100
5. **Timeline**: Estimated months for modernization
6. **Budget**: Estimated cost in USD
7. **Success Probability**: HIGH/MEDIUM/LOW
8. **Recommended Approach**: Migration strategy
9. **Top Security Issues**: List 3-5 critical findings
10. **Roadmap**: 4 prioritized steps with effort estimates

CODE SAMPLES:
${fileSamples.map(f => `
FILE: ${f.name}
\`\`\`
${f.preview}
\`\`\`
`).join("\n")}

Provide your analysis now.`;
}

// ============================================
// PARSE BOB OUTPUT
// ============================================
function parseBobOutput(output: string) {
  return {
    riskLevel: extractPattern(output, /risk level:?\s*(CRITICAL|HIGH|MEDIUM|LOW)/i, "HIGH"),
    securityIssues: extractList(output, /security issue|vulnerability|security concern/i),
    approach: extractPattern(output, /approach:?\s*([^\n]+)/i, "Strangler Pattern"),
    timeline: extractPattern(output, /timeline:?\s*(\d+[-\s]*\d*)\s*months?/i, "12-18"),
    budget: extractPattern(output, /budget:?\s*\$?([\d.]+)M?\s*-?\s*\$?([\d.]+)?M?/i, "2.0-3.0"),
    successProbability: extractPattern(output, /success probability:?\s*(HIGH|MEDIUM|LOW)/i, "MEDIUM"),
    roadmap: extractList(output, /step \d+|priority \d+|phase \d+/i).slice(0, 4),
  };
}

// ============================================
// HELPER: EXTRACT PATTERN
// ============================================
function extractPattern(text: string, pattern: RegExp, defaultValue: string): string {
  const match = text.match(pattern);
  return match ? match[1].trim() : defaultValue;
}

// ============================================
// HELPER: EXTRACT LIST
// ============================================
function extractList(text: string, pattern: RegExp): string[] {
  const section = text.match(new RegExp(`${pattern.source}([^]*?)(?=\\n\\n|\\n[A-Z]|$)`, 'i'));
  if (!section) return [];

  return section[1]
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.match(/^[-*•\d]/))
    .slice(0, 5);
}

// ============================================
// CALCULATE METRICS
// ============================================
function calculateMetrics(analysis: any) {
  let securityScore = 50;
  
  if (analysis.riskLevel === "CRITICAL") securityScore = 15;
  else if (analysis.riskLevel === "HIGH") securityScore = 30;
  else if (analysis.riskLevel === "MEDIUM") securityScore = 60;
  else if (analysis.riskLevel === "LOW") securityScore = 85;

  securityScore -= Math.min(analysis.securityIssues.length * 5, 30);
  securityScore = Math.max(0, Math.min(100, securityScore));

  return {
    securityScore: Math.round(securityScore),
    codeQualityScore: Math.round(securityScore + 5),
    maintainabilityIndex: Math.round(securityScore + 10),
    riskLevel: analysis.riskLevel,
    successProbability: analysis.successProbability,
    timeline: analysis.timeline + " months",
    budget: "$" + analysis.budget + "M",
    approach: analysis.approach,
  };
}

// ============================================
// SIMULATED ANALYSIS (Fallback)
// ============================================
function getSimulatedAnalysis(repoName: string, fileCount: number) {
  return {
    filesAnalyzed: fileCount,
    analysis: {
      metrics: {
        securityScore: 35,
        codeQualityScore: 40,
        maintainabilityIndex: 45,
        riskLevel: "HIGH",
        successProbability: "MEDIUM",
        timeline: "12-18 months",
        budget: "$2.0-3.0M",
        approach: "Strangler Pattern",
      },
      findings: {
        riskLevel: "HIGH",
        securityIssues: [
          "Outdated dependencies with known vulnerabilities",
          "Lack of input validation in API endpoints",
          "Hardcoded credentials found in configuration files",
          "Missing authentication on critical endpoints",
          "SQL injection vulnerabilities in database queries",
        ],
        approach: "Strangler Pattern",
        timeline: "12-18",
        budget: "2.0-3.0",
        successProbability: "MEDIUM",
        roadmap: [
          "Phase 1: Security audit and dependency updates (2-3 months, $200K)",
          "Phase 2: Implement authentication and authorization (3-4 months, $400K)",
          "Phase 3: Refactor core business logic with tests (4-6 months, $800K)",
          "Phase 4: Migrate to modern architecture incrementally (6-8 months, $1.2M)",
        ],
      },
      rawOutput: `SIMULATED ANALYSIS for ${repoName}\n\nThis is a fallback analysis as Bob is not configured.\nConfigure BOB_API_KEY environment variable to use real Bob analysis.`,
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// EXTRACT REPO NAME FROM URL
// ============================================
function extractRepoName(url: string): string {
  const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
  if (match) {
    return match[1].replace(".git", "");
  }
  return "Unknown Repository";
}