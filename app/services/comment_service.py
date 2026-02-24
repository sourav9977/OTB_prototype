from collections import defaultdict

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.comment import Comment
from app.models.user import User
from app.models.brand import UserBrandRole


def get_comments(db: Session, otb_id: str) -> list[dict]:
    """Get all comments for an OTB, grouped by cell."""
    comments = (
        db.query(Comment, User)
        .join(User, Comment.author_id == User.id)
        .filter(Comment.otb_id == otb_id)
        .order_by(Comment.created_at.desc())
        .all()
    )

    grouped = defaultdict(lambda: {"cell_label": "", "comments": []})
    for comment, user in comments:
        role = _get_user_role_for_comment(db, user.id)
        grouped[comment.cell_id]["cell_label"] = comment.cell_label
        grouped[comment.cell_id]["comments"].append({
            "id": comment.id,
            "otb_id": comment.otb_id,
            "author_id": comment.author_id,
            "author_name": user.name,
            "author_role": role,
            "cell_id": comment.cell_id,
            "cell_label": comment.cell_label,
            "content": comment.content,
            "parent_id": comment.parent_id,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
        })

    return [
        {"cell_id": cell_id, "cell_label": data["cell_label"], "comments": data["comments"]}
        for cell_id, data in grouped.items()
    ]


def create_comment(db: Session, otb_id: str, user: User, data: dict) -> Comment:
    comment = Comment(
        otb_id=otb_id,
        author_id=user.id,
        cell_id=data["cell_id"],
        cell_label=data["cell_label"],
        content=data["content"],
        parent_id=data.get("parent_id"),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def update_comment(db: Session, comment_id: str, user: User, content: str) -> Comment:
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.author_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own comments")
    comment.content = content
    db.commit()
    db.refresh(comment)
    return comment


def delete_comment(db: Session, comment_id: str, user: User) -> None:
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.author_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own comments")
    # Also delete replies
    db.query(Comment).filter(Comment.parent_id == comment_id).delete()
    db.delete(comment)
    db.commit()


def _get_user_role_for_comment(db: Session, user_id: str) -> str | None:
    role = db.query(UserBrandRole).filter(UserBrandRole.user_id == user_id).first()
    return role.role if role else None
