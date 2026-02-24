from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.kpi_data import KPIData
from app.utils.calculations import recalculate_from_target_cover, recalculate_from_additional_inwards


def get_kpi_data(db: Session, otb_id: str) -> list[KPIData]:
    return (
        db.query(KPIData)
        .filter(KPIData.otb_id == otb_id)
        .order_by(KPIData.kpi_name, KPIData.week_number)
        .all()
    )


def update_projected_kpis(db: Session, otb_id: str, updates: list[dict]) -> list[KPIData]:
    updated_records = []
    for update in updates:
        record = (
            db.query(KPIData)
            .filter(
                KPIData.otb_id == otb_id,
                KPIData.kpi_name == update["kpi_name"],
                KPIData.week_number == update["week_number"],
                KPIData.period_type == "projected",
            )
            .first()
        )
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"KPI '{update['kpi_name']}' week {update['week_number']} not found",
            )
        if not record.is_editable:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"KPI '{update['kpi_name']}' week {update['week_number']} is not editable",
            )
        record.value = update["value"]
        updated_records.append(record)

    db.commit()
    for r in updated_records:
        db.refresh(r)
    return updated_records


def preview_change(params: dict) -> dict:
    """Preview the impact of a KPI change without saving."""
    kpi_name = params["kpi_name"]
    week = params["week_number"]
    new_value = params["new_value"]
    column_name = f"W{week}"

    if kpi_name == "target_cover":
        result = recalculate_from_target_cover(
            new_target_cover=new_value,
            avg_weekly_sales=params.get("avg_weekly_sales", 0),
            closing_inventory=params.get("closing_inventory", 0),
            expected_sales=params.get("expected_sales", 0),
            additional_inwards=params.get("additional_inwards", 0),
            avg_cost_per_unit=params.get("avg_cost_per_unit", 756.0),
        )
    elif kpi_name == "additional_inwards":
        result = recalculate_from_additional_inwards(
            new_additional_inwards=new_value,
            target_inventory=params.get("target_inventory", 0),
            closing_inventory=params.get("closing_inventory", 0),
            expected_sales=params.get("expected_sales", 0),
            avg_cost_per_unit=params.get("avg_cost_per_unit", 756.0),
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Preview not supported for KPI '{kpi_name}'",
        )

    return {"column_name": column_name, "changes": result}
