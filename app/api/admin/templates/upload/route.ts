import { NextResponse } from "next/server";
import * as unzipper from "unzipper";
import { isSafeTemplatePath } from "@/lib/templates/types";

export const runtime = "nodejs";

const MAX_ZIP_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_FILES = 100;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_FILES = new Set([
  "index.html",
  "style.css",
  "script.js",
  "schema.json",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".html",
  ".css",
  ".js",
  ".json",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".mp3",
  ".wav",
  ".ogg",
  ".mp4",
  ".woff",
  ".woff2",
  ".ttf",
]);

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");

  if (lastDot === -1) {
    return "";
  }

  return fileName.slice(lastDot).toLowerCase();
}

function normalizeEntryPath(fileName: string) {
  return fileName.replace(/\\/g, "/").replace(/^\.\/+/, "");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "ZIP file is required.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_ZIP_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "ZIP file is too large. Maximum size is 25 MB.",
        },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith(".zip")) {
      return NextResponse.json(
        {
          success: false,
          error: "Only .zip files are allowed.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const directory = await unzipper.Open.buffer(buffer);

    if (directory.files.length > MAX_FILES) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many files. Maximum allowed is ${MAX_FILES}.`,
        },
        { status: 400 }
      );
    }

    const files: string[] = [];

    let hasHtml = false;
    let hasCss = false;
    let hasJs = false;

    for (const entry of directory.files) {
      const entryPath = normalizeEntryPath(entry.path);

      // Ignore empty directory entries.
      if (!entryPath || entry.type === "Directory") {
        continue;
      }

      // Security: prevent ../ and absolute paths.
      if (!isSafeTemplatePath(entryPath)) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsafe file path detected: ${entryPath}`,
          },
          { status: 400 }
        );
      }

      const extension = getExtension(entryPath);

      if (!ALLOWED_EXTENSIONS.has(extension)) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported file type: ${entryPath}`,
          },
          { status: 400 }
        );
      }

      const entryBuffer = await entry.buffer();

      if (entryBuffer.length > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File is too large: ${entryPath}`,
          },
          { status: 400 }
        );
      }

      const baseName = entryPath.split("/").pop()?.toLowerCase();

      if (baseName === "index.html") {
        hasHtml = true;
      }

      if (baseName === "style.css") {
        hasCss = true;
      }

      if (baseName === "script.js") {
        hasJs = true;
      }

      files.push(entryPath);
    }

    if (!hasHtml) {
      return NextResponse.json(
        {
          success: false,
          error: "Template must contain index.html.",
        },
        { status: 400 }
      );
    }

    if (!hasCss) {
      return NextResponse.json(
        {
          success: false,
          error: "Template must contain style.css.",
        },
        { status: 400 }
      );
    }

    if (!hasJs) {
      return NextResponse.json(
        {
          success: false,
          error: "Template must contain script.js.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Template ZIP validated successfully.",
      template: {
        files,
        fileCount: files.length,
        hasHtml,
        hasCss,
        hasJs,
      },
    });
  } catch (error) {
    console.error("Template upload validation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Could not read the template ZIP.",
      },
      { status: 500 }
    );
  }
}