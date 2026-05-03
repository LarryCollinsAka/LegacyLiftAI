import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "results", "current.json");

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({
      ready: false,
    });
  }

  const raw = fs.readFileSync(filePath, "utf-8");

  return NextResponse.json({
    ready: true,
    data: JSON.parse(raw),
  });
}