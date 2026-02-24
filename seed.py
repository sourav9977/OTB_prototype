"""Seed the database with sample data matching the prototype."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import SessionLocal, engine, Base
from app.models import User, Brand, Project, UserBrandRole, OTBVersion, KPIData
from app.utils.security import hash_password


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(User).first():
            print("Database already seeded. Skipping.")
            return

        # --- Users ---
        users = [
            User(id="user-1", email="sourav@fynd.team", name="Sourav Nayak", hashed_password=hash_password("password123")),
            User(id="user-2", email="testuser@fynd.team", name="Test User", hashed_password=hash_password("password123")),
            User(id="user-3", email="anusha@fynd.team", name="Chinta Anusha", hashed_password=hash_password("password123")),
        ]
        db.add_all(users)

        # --- Brands ---
        brands = [
            Brand(id="brand-netplay", name="Netplay", is_active=True),
            Brand(id="brand-azorte", name="Azorte", is_active=True),
            Brand(id="brand-performax", name="Performax", is_active=True),
            Brand(id="brand-ajile", name="Ajile", is_active=False),
        ]
        db.add_all(brands)

        # --- Projects ---
        project = Project(id="proj-1", brand_id="brand-netplay", name="azorte_sourav")
        db.add(project)

        # --- User-Brand Roles ---
        roles = [
            UserBrandRole(id="ubr-1", user_id="user-1", brand_id="brand-netplay", role="maker"),
            UserBrandRole(id="ubr-2", user_id="user-2", brand_id="brand-netplay", role="checker"),
            UserBrandRole(id="ubr-3", user_id="user-3", brand_id="brand-netplay", role="approver"),
            UserBrandRole(id="ubr-4", user_id="user-1", brand_id="brand-azorte", role="maker"),
        ]
        db.add_all(roles)

        # --- OTB Versions ---
        otbs = [
            OTBVersion(id="otb-1", project_id="proj-1", created_by="user-1", version_name="OTB_31_10_2025_120804", hit="H1", drop_month="January", year=2025, status="in_progress"),
            OTBVersion(id="otb-2", project_id="proj-1", created_by="user-1", version_name="OTB_01_10_2025_171500", hit="H1", drop_month="January", year=2025, status="change_requested"),
            OTBVersion(id="otb-3", project_id="proj-1", created_by="user-2", version_name="OTB_22_10_2025_190523", hit="H1", drop_month="January", year=2025, status="in_review"),
            OTBVersion(id="otb-4", project_id="proj-1", created_by="user-3", version_name="OTB_17_10_2025_130922", hit="H1", drop_month="January", year=2025, status="change_requested"),
            OTBVersion(id="otb-5", project_id="proj-1", created_by="user-1", version_name="OTB_14_10_2025_123327", hit="H1", drop_month="January", year=2025, status="pending_approval"),
            OTBVersion(id="otb-6", project_id="proj-1", created_by="user-2", version_name="OTB_9_10_2025_style", hit="H1", drop_month="January", year=2025, status="approved"),
        ]
        db.add_all(otbs)

        # --- KPI Data for OTB-1 (matching prototype) ---
        weeks_actual = list(range(19, 29))   # W19–W28
        weeks_projected = list(range(29, 32))  # W29–W31
        months_actual = ["Jul-2025"] * 4 + ["Aug-2025"] * 4 + ["Sep-2025"] * 2
        months_projected = ["Sep-2025"] * 3

        kpi_rows = {
            "aop_net_sales": {
                "actual": [1910346, 1914576, 2043876, 2010151, 1958544, 1988075, 1926119, 1866663, 1423494, 1354700],
                "projected": [1491407, 1454577, 1368922],
            },
            "cy_net_sales": {
                "actual": [2307036, 2140249, 2169656, 2245244, 2243000, 2207987, 2184799, 324193, 0, 0],
                "projected": [1491407, 1454577, 1368922],
            },
            "ly_net_sales": {
                "actual": [2670127, 2594354, 2817312, 2682451, 2756552, 2762970, 2797071, 2681219, 2723994, 2754145],
                "projected": [2828723, 2781883, 2753462],
            },
            "aop_mrp": {
                "actual": [1357, 1422, 1371, 1384, 1307, 1290, 1311, 1315, 1219, 1241],
                "projected": [1212, 1209, 1226],
            },
            "cy_mrp": {
                "actual": [1362, 1355, 1358, 1370, 1356, 1340, 1333, 1324, 0, 0],
                "projected": [1212, 1209, 1226],
            },
            "ly_mrp": {
                "actual": [1270, 1251, 1262, 1277, 1264, 1252, 1257, 1249, 1240, 1229],
                "projected": [1216, 1210, 1219],
            },
            "aop_cogs": {
                "actual": [960000, 965000, 970000, 975000, 980000, 985000, 990000, 995000, 1000000, 1005000],
                "projected": [1010000, 1015000, 1020000],
            },
            "opening_inventory": {
                "actual": [120000, 118000, 115000, 112000, 110000, 108000, 105000, 102000, 100000, 98000],
                "projected": [96000, 94000, 92000],
            },
            "closing_inventory": {
                "actual": [118000, 115000, 112000, 110000, 108000, 105000, 102000, 100000, 98000, 96000],
                "projected": [94000, 92000, 90000],
            },
            "additional_inwards": {
                "actual": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                "projected": [0, 0, 0],
                "editable_projected": True,
            },
            "target_cover": {
                "actual": [8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
                "projected": [8, 8, 8],
                "editable_projected": True,
            },
            "target_inventory": {
                "actual": [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000],
                "projected": [6019, 6019, 6019],
            },
            "otb_units": {
                "actual": [-113450, -118423, -123099, -125748.50, -128628.33, -131662.89, -136457.89, -141186.89, 6019.11, 6019.11],
                "projected": [-1012.89, -8297.39, -12382.56],
            },
            "otb_cogs": {
                "actual": [-34207003.48, -35375361.87, -37021849.06, -37396368.25, -37903476.02, -39221436.13, -40993699.09, -42461009.17, 0, 0],
                "projected": [-765813.26, -6295195.29, -9441583.07],
            },
        }

        kpi_records = []
        for kpi_name, data in kpi_rows.items():
            is_editable = data.get("editable_projected", False)

            for i, week in enumerate(weeks_actual):
                kpi_records.append(KPIData(
                    otb_id="otb-1",
                    kpi_name=kpi_name,
                    week_number=week,
                    month=months_actual[i],
                    period_type="actual",
                    value=data["actual"][i],
                    is_editable=False,
                ))

            for i, week in enumerate(weeks_projected):
                kpi_records.append(KPIData(
                    otb_id="otb-1",
                    kpi_name=kpi_name,
                    week_number=week,
                    month=months_projected[i],
                    period_type="projected",
                    value=data["projected"][i],
                    is_editable=is_editable,
                ))

        db.add_all(kpi_records)
        db.commit()
        print(f"Seeded: {len(users)} users, {len(brands)} brands, {len(otbs)} OTBs, {len(kpi_records)} KPI records")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
