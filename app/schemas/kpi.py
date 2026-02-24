from pydantic import BaseModel


class KPIDataResponse(BaseModel):
    id: str
    kpi_name: str
    week_number: int
    month: str | None = None
    period_type: str
    value: float
    is_editable: bool

    class Config:
        from_attributes = True


class KPIUpdateItem(BaseModel):
    kpi_name: str
    week_number: int
    value: float


class KPIBulkUpdateRequest(BaseModel):
    updates: list[KPIUpdateItem]


class KPIReviewRequest(BaseModel):
    kpi_name: str
    week_number: int
    new_value: float
    avg_weekly_sales: float = 0.0
    closing_inventory: float = 0.0
    expected_sales: float = 0.0
    additional_inwards: float = 0.0
    avg_cost_per_unit: float = 756.0


class KPIReviewResponse(BaseModel):
    column_name: str
    changes: dict
