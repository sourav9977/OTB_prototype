from datetime import datetime
from pydantic import BaseModel


class CommentCreateRequest(BaseModel):
    cell_id: str
    cell_label: str
    content: str
    parent_id: str | None = None


class CommentUpdateRequest(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: str
    otb_id: str
    author_id: str
    author_name: str | None = None
    author_role: str | None = None
    cell_id: str
    cell_label: str
    content: str
    parent_id: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommentGroupResponse(BaseModel):
    cell_id: str
    cell_label: str
    comments: list[CommentResponse]
