import os
import subprocess
from typing import List, Tuple, Optional

from sqlalchemy.orm import Session

from app.models.job import RenderJob, JobStatusEnum
from app.schemas.overlay import Overlay
from app.core.config import get_settings

settings = get_settings()


def get_video_duration_seconds(input_path: str) -> float | None:
    """Use ffprobe to get input video duration in seconds."""
    try:
        proc = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                input_path,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        if proc.returncode != 0:
            return None

        out = proc.stdout.decode("utf-8", errors="ignore").strip()
        # Sometimes ffprobe returns N/A or empty
        try:
            return float(out)
        except (TypeError, ValueError):
            return None
    except Exception:
        return None


def resolve_overlay_path(content: str) -> str:
    """
    Resolve overlay.content (filename or path) to an absolute path.

    Expectation:
    - If `content` is an absolute path and exists → use it.
    - Else, treat it as a filename relative to ASSETS_DIR.
    """
    if os.path.isabs(content) and os.path.exists(content):
        return content

    candidate = os.path.join(settings.ASSETS_DIR, content)
    if os.path.exists(candidate):
        return candidate

    raise FileNotFoundError(
        f"Overlay asset not found: {content} (looked in {candidate})"
    )


def build_filter_complex(
    overlays: List[Overlay],
) -> Tuple[str, List[str], Optional[str]]:
    """
    Build ffmpeg filter_complex graph sequentially, in the same order as overlays:

      base label starts at [0:v]
      for each overlay:
        - text  → drawtext
        - image/video → overlay filter with extra input index

    Returns:
      - filter_complex: the filter graph string
      - extra_inputs: list of asset paths (mapped as extra -i inputs)
      - final_label: label of the last video output (e.g. '[v3]')
    """

    if not overlays:
        return "", [], None

    extra_inputs: List[str] = []
    chains: List[str] = []

    current_label = "[0:v]"
    label_index = 0

    for o in overlays:
        out_label = f"[v{label_index}]"

        # TEXT OVERLAY
        if o.type == "text":
            x_expr = f"w*{o.x}"
            y_expr = f"h*{o.y}"
            text = (
                o.content.replace(":", "\\:")
                .replace("'", "\\'")
            )

            # Defaults
            font_color = (o.color or "white").strip()
            font_color = font_color.replace(":", "\\:").replace("'", "\\'")

            font_size = o.font_size or 36

            # Box settings
            box_enabled = o.box if o.box is not None else True
            box_color = (o.box_color or "black@0.5").strip()
            box_color = box_color.replace(":", "\\:").replace("'", "\\'")

            box_borderw = o.box_borderw if o.box_borderw is not None else 5

            # Build drawtext options
            draw_opts = [
                f"text='{text}'",
                f"x={x_expr}",
                f"y={y_expr}",
                f"fontcolor={font_color}",
                f"fontsize={font_size}",
                f"enable='between(t,{o.start_time},{o.end_time})'",
            ]

            if box_enabled:
                draw_opts.append("box=1")
                draw_opts.append(f"boxcolor={box_color}")
                draw_opts.append(f"boxborderw={box_borderw}")

            chain = (
                f"{current_label}"
                f"drawtext=" + ":".join(draw_opts) +
                f"{out_label}"
            )

        # IMAGE/VIDEO OVERLAY
        elif o.type in ("image", "video"):
            asset_path = resolve_overlay_path(o.content)
            extra_inputs.append(asset_path)
            input_index = len(extra_inputs)

            x_expr = f"w*{o.x}"
            y_expr = f"h*{o.y}"

            scaled_label = f"[ov{label_index}]"
            padded_label = f"[pad{label_index}]"

            chain = (
                # scale to fit inside 100x100 while preserving aspect ratio
                f"[{input_index}:v]scale=100:100:force_original_aspect_ratio=decrease{scaled_label};"
                # pad to exactly 100x100 and center the image
                f"{scaled_label}pad=100:100:(ow-iw)/2:(oh-ih)/2:color=black@0.0{padded_label};"
                # overlay on video
                f"{current_label}{padded_label}"
                f"overlay=x={x_expr}:y={y_expr}:"
                f"enable='between(t,{o.start_time},{o.end_time})'"
                f"{out_label}"
            )

        else:
            # Unknown type → just skip it
            continue

        chains.append(chain)
        current_label = out_label
        label_index += 1

    filter_complex = "; ".join(chains)
    final_label = current_label

    return filter_complex, extra_inputs, final_label


def render_job(db: Session, job_id: str) -> None:
    """
    Main function called in background / thread pool to process a job.
    Uses ffmpeg -progress pipe:2 and updates job.progress (0–100).
    """
    job: RenderJob | None = db.query(RenderJob).filter(RenderJob.id == job_id).first()
    if job is None:
        return

    job.status = JobStatusEnum.processing
    job.message = "Processing with ffmpeg"
    job.progress = 1.0
    db.commit()

    input_path = job.input_path
    overlays_data = job.overlays or []
    overlays = [Overlay(**o) for o in overlays_data]

    output_filename = f"{job.id}_output.mp4"
    output_path = os.path.join(settings.OUTPUT_DIR, output_filename)

    try:
        filter_complex, extra_inputs, final_label = build_filter_complex(overlays)
        duration = get_video_duration_seconds(input_path)

        # Build ffmpeg command
        if not filter_complex:
            cmd = [
                "ffmpeg",
                "-y",
                "-i",
                input_path,
                "-c:v",
                "copy",
                "-c:a",
                "copy",
                "-progress",
                "pipe:2",
                "-nostats",
                "-v",
                "error",
                output_path,
            ]
        else:
            cmd = ["ffmpeg", "-y", "-i", input_path]
            for path in extra_inputs:
                cmd += ["-i", path]

            cmd += [
                "-filter_complex",
                filter_complex,
                "-map",
                final_label,
                "-map",
                "0:a?",
                "-c:v",
                "libx264",
                "-c:a",
                "aac",
                "-progress",
                "pipe:2",   # progress key=value lines to stderr (FD 2)
                "-nostats",
                "-v",
                "error",
                output_path,
            ]

        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.DEVNULL,   # we don't need stdout
            stderr=subprocess.PIPE,      # -progress pipe:2 writes here
            text=True,
            bufsize=1,
        )

        if proc.stderr is not None:
            for line in proc.stderr:
                line = line.strip()
                # Debug (you can comment this out later)
                # print(f"[FFMPEG PROGRESS] {line}")

                # ffmpeg -progress pipe:2 emits:
                # out_time_ms=1234567
                # out_time=00:00:01.23
                # progress=continue/end
                if line.startswith("out_time_ms=") and duration and duration > 0:
                    raw_val = line.split("=", 1)[1].strip()

                    # Sometimes ffmpeg prints out_time_ms=N/A
                    try:
                        ms = int(raw_val)
                    except ValueError:
                        continue

                    t_seconds = ms / 1_000_000.0
                    pct = min(99.0, (t_seconds / duration) * 100.0)
                    print(f"[FFMPEG PROGRESS] → {pct}%")

                    job.progress = pct
                    db.commit()

        proc.wait()

        if proc.returncode != 0:
            job.status = JobStatusEnum.error
            job.message = "FFmpeg failed"
        else:
            job.status = JobStatusEnum.done
            job.message = "Rendering complete"
            job.output_path = output_path
            job.progress = 100.0

        db.commit()

    except FileNotFoundError as e:
        job.status = JobStatusEnum.error
        job.message = str(e)
        db.commit()
    except Exception as e:
        job.status = JobStatusEnum.error
        job.message = f"Exception: {e}"
        db.commit()
