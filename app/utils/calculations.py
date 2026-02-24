"""KPI auto-calculation logic ported from the React prototype."""


def calculate_target_inventory(avg_weekly_sales: float, target_cover: float) -> float:
    """Target Inventory = Average Weekly Sales * Target Cover (weeks)."""
    return round(avg_weekly_sales * target_cover, 2)


def calculate_otb_units(
    target_inventory: float,
    closing_inventory: float,
    expected_sales: float,
    additional_inwards: float,
) -> float:
    """OTB Units = Target Inventory - Closing Inventory + Expected Sales - Additional Inwards."""
    return round(target_inventory - closing_inventory + expected_sales - additional_inwards, 2)


def calculate_otb_cogs(otb_units: float, avg_cost_per_unit: float) -> float:
    """OTB COGS = OTB Units * Average Cost Per Unit."""
    return round(otb_units * avg_cost_per_unit, 2)


def recalculate_from_target_cover(
    new_target_cover: float,
    avg_weekly_sales: float,
    closing_inventory: float,
    expected_sales: float,
    additional_inwards: float,
    avg_cost_per_unit: float,
) -> dict:
    """Recalculate all dependent KPIs when Target Cover changes."""
    target_inventory = calculate_target_inventory(avg_weekly_sales, new_target_cover)
    otb_units = calculate_otb_units(target_inventory, closing_inventory, expected_sales, additional_inwards)
    otb_cogs = calculate_otb_cogs(otb_units, avg_cost_per_unit)

    return {
        "target_cover": new_target_cover,
        "target_inventory": target_inventory,
        "otb_units": otb_units,
        "otb_cogs": otb_cogs,
    }


def recalculate_from_additional_inwards(
    new_additional_inwards: float,
    target_inventory: float,
    closing_inventory: float,
    expected_sales: float,
    avg_cost_per_unit: float,
) -> dict:
    """Recalculate OTB Units and COGS when Additional Inwards changes."""
    otb_units = calculate_otb_units(target_inventory, closing_inventory, expected_sales, new_additional_inwards)
    otb_cogs = calculate_otb_cogs(otb_units, avg_cost_per_unit)

    return {
        "additional_inwards": new_additional_inwards,
        "otb_units": otb_units,
        "otb_cogs": otb_cogs,
    }
