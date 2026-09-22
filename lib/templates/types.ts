export type TemplateCategory = "birthday" | "anniversary" | "valentine" | "friendship" | "general";
export type TemplateStatus = "draft" | "published" | "disabled";
export type TemplateFieldType = "text" | "textarea" | "image" | "audio" | "video" | "password" | "number" | "color" | "boolean";
export interface TemplateField { key: string; label: string; type: TemplateFieldType; required?: boolean; defaultValue?: string | number | boolean; placeholder?: string; description?: string; }
export interface TemplatePage { id: string; title: string; order: number; fields: string[]; }
export interface TemplateSchema { version: string; fields: TemplateField[]; pages?: TemplatePage[]; autoEditable?: boolean; }
export interface WebsiteTemplate { id: string; name: string; slug: string; category: TemplateCategory; description?: string | null; thumbnailUrl?: string | null; packagePath: string; schema?: TemplateSchema | null; status: TemplateStatus; version: string; createdAt?: string; updatedAt?: string; }
export function isSafeTemplatePath(filePath: string): boolean {
  if (!filePath || typeof filePath !== "string") return false;
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized.startsWith("/") || /^[a-zA-Z]:\//.test(normalized) || normalized.includes("\0")) return false;
  return !normalized.split("/").some((part) => part === "..");
}
