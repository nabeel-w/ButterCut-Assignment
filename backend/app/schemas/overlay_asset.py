from pydantic import BaseModel, ConfigDict
from enum import Enum
from datetime import datetime


class OverlayAssetType(str, Enum):
    image = "image"
    video = "video"


class OverlayAssetBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    original_name: str
    type: OverlayAssetType
    path: str
    created_at: datetime
