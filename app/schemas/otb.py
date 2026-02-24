from datetime import datetime
from pydantic import BaseModel


class OTBCreateRequest(BaseModel):
    project_id: str
    version_name: str
    hit: str
    drop_month: str
    year: int


class OTBStatusUpdateRequest(BaseModel):
    new_status: str


class OTBResponse(BaseModel):
    id: str
    project_id: str
    created_by: str
    creator_name: str | None = None
    version_name: str
    hit: str
    drop_month: str
    year: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OTBListResponse(BaseModel):
    items: list[OTBResponse]
    total: int


class StatusHistoryEntry(BaseModel):
    id: str
    from_status: str
    to_status: str
    changed_by: str
    changer_name: str | None = None
    changed_at: datetime

    class Config:
        from_attributes = True
