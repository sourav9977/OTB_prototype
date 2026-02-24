from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.comment import (
    CommentCreateRequest,
    CommentUpdateRequest,
    CommentResponse,
    CommentGroupResponse,
)
from app.services.comment_service import get_comments, create_comment, update_comment, delete_comment
from app.utils.security import get_current_user

router = APIRouter()


@router.get("/", response_model=list[CommentGroupResponse])
def list_comments(
    otb_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_comments(db, otb_id)


@router.post("/", response_model=CommentResponse)
def add_comment(
    otb_id: str,
    payload: CommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = create_comment(db, otb_id, current_user, payload.model_dump())
    return CommentResponse(
        id=comment.id,
        otb_id=comment.otb_id,
        author_id=comment.author_id,
        author_name=current_user.name,
        cell_id=comment.cell_id,
        cell_label=comment.cell_label,
        content=comment.content,
        parent_id=comment.parent_id,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.patch("/{comment_id}", response_model=CommentResponse)
def edit_comment(
    otb_id: str,
    comment_id: str,
    payload: CommentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = update_comment(db, comment_id, current_user, payload.content)
    return CommentResponse(
        id=comment.id,
        otb_id=comment.otb_id,
        author_id=comment.author_id,
        author_name=current_user.name,
        cell_id=comment.cell_id,
        cell_label=comment.cell_label,
        content=comment.content,
        parent_id=comment.parent_id,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.delete("/{comment_id}")
def remove_comment(
    otb_id: str,
    comment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delete_comment(db, comment_id, current_user)
    return {"detail": "Comment deleted"}
