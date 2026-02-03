import fs from "fs";
import path from "path";

export function loadJsonFile<T>(filePath: string): T {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, "utf-8");
  return JSON.parse(content) as T;
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(path.resolve(filePath));
}
