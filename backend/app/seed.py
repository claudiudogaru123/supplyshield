import asyncio
import uuid
from datetime import datetime
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, init_db
from app.models.supplier import Supplier, SupplierType, AccessType, Criticality, RiskCategory

DEMO_SUPPLIERS = [
    {
        "name": "Siemens Industrial Networks",
        "country": "Germany",
        "sector": "Industrial Automation",
        "supplier_type": SupplierType.OT,
        "access_type": AccessType.REMOTE,
        "criticality": Criticality.CRITICAL,
        "contact_name": "Hans Mueller",
        "contact_email": "h.mueller@siemens-industrial.de",
        "description": "OT network infrastructure and SCADA systems provider",
        "risk_score": 78.5,
        "risk_category": RiskCategory.HIGH,
        "inherent_risk": 85.0,
        "residual_risk": 72.0,
        "assessment_count": 3,
    },
    {
        "name": "CyberArk Solutions",
        "country": "Israel",
        "sector": "Cybersecurity",
        "supplier_type": SupplierType.IT,
        "access_type": AccessType.PRIVILEGED,
        "criticality": Criticality.CRITICAL,
        "contact_name": "Yael Cohen",
        "contact_email": "y.cohen@cyberark-solutions.com",
        "description": "Privileged access management and identity security",
        "risk_score": 42.0,
        "risk_category": RiskCategory.MEDIUM,
        "inherent_risk": 60.0,
        "residual_risk": 38.0,
        "assessment_count": 5,
    },
    {
        "name": "Rockwell Automation",
        "country": "United States",
        "sector": "Industrial Control Systems",
        "supplier_type": SupplierType.HYBRID,
        "access_type": AccessType.REMOTE,
        "criticality": Criticality.HIGH,
        "contact_name": "James Carter",
        "contact_email": "j.carter@rockwell-auto.com",
        "description": "PLC and industrial automation systems integrator",
        "risk_score": 65.0,
        "risk_category": RiskCategory.HIGH,
        "inherent_risk": 75.0,
        "residual_risk": 58.0,
        "assessment_count": 2,
    },
    {
        "name": "SAP Romania SRL",
        "country": "Romania",
        "sector": "Enterprise Software",
        "supplier_type": SupplierType.IT,
        "access_type": AccessType.REMOTE,
        "criticality": Criticality.HIGH,
        "contact_name": "Andrei Popescu",
        "contact_email": "a.popescu@sap-ro.com",
        "description": "ERP and enterprise resource planning solutions",
        "risk_score": 35.0,
        "risk_category": RiskCategory.MEDIUM,
        "inherent_risk": 50.0,
        "residual_risk": 30.0,
        "assessment_count": 4,
    },
    {
        "name": "Schneider Electric SE",
        "country": "France",
        "sector": "Energy Management",
        "supplier_type": SupplierType.OT,
        "access_type": AccessType.PHYSICAL,
        "criticality": Criticality.CRITICAL,
        "contact_name": "Pierre Dupont",
        "contact_email": "p.dupont@schneider-electric.fr",
        "description": "Energy management and industrial automation provider",
        "risk_score": 82.0,
        "risk_category": RiskCategory.CRITICAL,
        "inherent_risk": 90.0,
        "residual_risk": 75.0,
        "assessment_count": 1,
    },
    {
        "name": "Microsoft Azure Services",
        "country": "United States",
        "sector": "Cloud Infrastructure",
        "supplier_type": SupplierType.IT,
        "access_type": AccessType.REMOTE,
        "criticality": Criticality.CRITICAL,
        "contact_name": "Sarah Johnson",
        "contact_email": "s.johnson@microsoft-azure.com",
        "description": "Cloud computing and infrastructure services",
        "risk_score": 28.0,
        "risk_category": RiskCategory.LOW,
        "inherent_risk": 45.0,
        "residual_risk": 22.0,
        "assessment_count": 6,
    },
    {
        "name": "Fortinet Romania",
        "country": "Romania",
        "sector": "Network Security",
        "supplier_type": SupplierType.IT,
        "access_type": AccessType.REMOTE,
        "criticality": Criticality.MEDIUM,
        "contact_name": "Mihai Ionescu",
        "contact_email": "m.ionescu@fortinet-ro.com",
        "description": "Network security and firewall solutions provider",
        "risk_score": 22.0,
        "risk_category": RiskCategory.LOW,
        "inherent_risk": 35.0,
        "residual_risk": 18.0,
        "assessment_count": 3,
    },
    {
        "name": "ABB Process Automation",
        "country": "Switzerland",
        "sector": "Process Automation",
        "supplier_type": SupplierType.HYBRID,
        "access_type": AccessType.PRIVILEGED,
        "criticality": Criticality.CRITICAL,
        "contact_name": "Thomas Weber",
        "contact_email": "t.weber@abb-process.ch",
        "description": "Process automation and robotics for industrial environments",
        "risk_score": 71.0,
        "risk_category": RiskCategory.HIGH,
        "inherent_risk": 80.0,
        "residual_risk": 65.0,
        "assessment_count": 2,
    },
]


async def seed():
    await init_db()
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Supplier))
        existing = result.scalars().all()
        if existing:
            print(f"⏭️  Database already has {len(existing)} suppliers, skipping seed.")
            return

        for data in DEMO_SUPPLIERS:
            supplier = Supplier(
                id=str(uuid.uuid4()),
                **data,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(supplier)

        await session.commit()
        print(f"✅ Seeded {len(DEMO_SUPPLIERS)} demo suppliers successfully.")


if __name__ == "__main__":
    asyncio.run(seed())