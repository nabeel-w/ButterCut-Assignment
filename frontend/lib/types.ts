export type JobStatus = "pending" | "processing" | "done" | "error";

export interface Job {
  id: string;
  status: JobStatus;
  message?: string | null;
  progress: number;
  created_at?: string;
}

export type OverlayType = "text" | "image" | "video";

export interface Overlay {
  id?: string; // frontend-only ID
  type: OverlayType;
  content: string;
  x: number; // 0–1
  y: number; // 0–1
  start_time: number;
  end_time: number;

  // text styling
  color?: string;
  font_size?: number;
  box?: boolean;
  box_color?: string;
  box_borderw?: number;
}
