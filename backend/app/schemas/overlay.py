from pydantic import BaseModel, ConfigDict
from typing import Literal, Optional


OverlayType = Literal["text", "image", "video"]


class Overlay(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    type: OverlayType
    content: str   # text or relative path / filename for image/video
    x: float       # 0–1
    y: float       # 0–1
    start_time: float
    end_time: float
    # TEXT STYLING (used only when type == "text")
    color: Optional[str] = None          # e.g. "white", "yellow", "#ffcc00"
    font_size: Optional[int] = None      # e.g. 24, 36
    box: Optional[bool] = None           # enable/disable background box
    box_color: Optional[str] = None      # e.g. "black@0.5"
    box_borderw: Optional[int] = None    # box padding/border width