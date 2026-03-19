from typing import List, Dict, Any


IT_QUESTIONS = [
    {"id": "it_gov_1", "domain": "Governance", "weight": 1.5, "max_score": 4,
     "text": "Does the supplier have a documented Information Security Policy?",
     "options": [{"value": 0, "label": "Not in place"}, {"value": 1, "label": "Planned"},
                 {"value": 2, "label": "Partially implemented"}, {"value": 3, "label": "Implemented"},
                 {"value": 4, "label": "Fully implemented and reviewed"}]},
    {"id": "it_gov_2", "domain": "Governance", "weight": 1.0, "max_score": 4,
     "text": "Is there a designated person responsible for information security?",
     "options": [{"value": 0, "label": "No"}, {"value": 1, "label": "Informal"},
                 {"value": 2, "label": "Part-time role"}, {"value": 3, "label": "Dedicated role"},
                 {"value": 4, "label": "CISO or equivalent"}]},
    {"id": "it_acc_1", "domain": "Access Control", "weight": 2.0, "max_score": 4,
     "text": "How is privileged access to systems managed?",
     "options": [{"value": 0, "label": "No controls"}, {"value": 1, "label": "Basic password policy"},
                 {"value": 2, "label": "MFA implemented"}, {"value": 3, "label": "PAM solution"},
                 {"value": 4, "label": "Full PAM with session recording"}]},
    {"id": "it_acc_2", "domain": "Access Control", "weight": 1.5, "max_score": 4,
     "text": "Is access reviewed and revoked promptly when no longer needed?",
     "options": [{"value": 0, "label": "No process"}, {"value": 1, "label": "Ad-hoc"},
                 {"value": 2, "label": "Annual review"}, {"value": 3, "label": "Quarterly review"},
                 {"value": 4, "label": "Automated provisioning/deprovisioning"}]},
    {"id": "it_vuln_1", "domain": "Vulnerability Management", "weight": 2.0, "max_score": 4,
     "text": "Does the supplier have a vulnerability scanning process?",
     "options": [{"value": 0, "label": "No scanning"}, {"value": 1, "label": "Ad-hoc"},
                 {"value": 2, "label": "Annual scans"}, {"value": 3, "label": "Monthly scans"},
                 {"value": 4, "label": "Continuous scanning with SLAs"}]},
    {"id": "it_inc_1", "domain": "Incident Response", "weight": 1.5, "max_score": 4,
     "text": "Does the supplier have an incident response plan?",
     "options": [{"value": 0, "label": "No plan"}, {"value": 1, "label": "Informal process"},
                 {"value": 2, "label": "Documented plan"}, {"value": 3, "label": "Tested plan"},
                 {"value": 4, "label": "Regularly tested with client notification SLAs"}]},
    {"id": "it_bc_1", "domain": "Business Continuity", "weight": 1.5, "max_score": 4,
     "text": "Does the supplier have a Business Continuity / DR plan?",
     "options": [{"value": 0, "label": "No plan"}, {"value": 1, "label": "Informal"},
                 {"value": 2, "label": "Documented"}, {"value": 3, "label": "Tested annually"},
                 {"value": 4, "label": "Regularly tested with defined RTO/RPO"}]},
    {"id": "it_tpm_1", "domain": "Third Party Management", "weight": 1.0, "max_score": 4,
     "text": "Does the supplier assess the security posture of their own sub-suppliers?",
     "options": [{"value": 0, "label": "No"}, {"value": 1, "label": "Contractual clauses only"},
                 {"value": 2, "label": "Questionnaires"}, {"value": 3, "label": "Audits"},
                 {"value": 4, "label": "Continuous monitoring"}]},
]

OT_QUESTIONS = [
    {"id": "ot_acc_1", "domain": "OT Access Control", "weight": 2.5, "max_score": 4,
     "text": "How is remote access to OT/SCADA systems controlled?",
     "options": [{"value": 0, "label": "No controls"}, {"value": 1, "label": "VPN only"},
                 {"value": 2, "label": "VPN + MFA"}, {"value": 3, "label": "Jump server + MFA"},
                 {"value": 4, "label": "Dedicated secure remote access with full session logging"}]},
    {"id": "ot_seg_1", "domain": "Network Segmentation", "weight": 2.0, "max_score": 4,
     "text": "Is there network segmentation between IT and OT environments?",
     "options": [{"value": 0, "label": "No segmentation"}, {"value": 1, "label": "Logical separation"},
                 {"value": 2, "label": "VLAN separation"}, {"value": 3, "label": "Firewall between IT/OT"},
                 {"value": 4, "label": "Air-gap or DMZ with strict controls"}]},
    {"id": "ot_patch_1", "domain": "Patch Management", "weight": 1.5, "max_score": 4,
     "text": "How are patches and updates managed for OT systems?",
     "options": [{"value": 0, "label": "No process"}, {"value": 1, "label": "Vendor-driven only"},
                 {"value": 2, "label": "Scheduled maintenance windows"},
                 {"value": 3, "label": "Risk-based patching process"},
                 {"value": 4, "label": "Formal OT patch management with testing"}]},
    {"id": "ot_mon_1", "domain": "OT Monitoring", "weight": 2.0, "max_score": 4,
     "text": "Is there monitoring of OT network traffic for anomalies?",
     "options": [{"value": 0, "label": "No monitoring"}, {"value": 1, "label": "Basic logging"},
                 {"value": 2, "label": "SIEM integration"}, {"value": 3, "label": "OT-specific IDS"},
                 {"value": 4, "label": "Continuous OT threat detection with SOC"}]},
    {"id": "ot_safe_1", "domain": "Safety Impact", "weight": 2.5, "max_score": 4,
     "text": "Has a safety impact assessment been performed for supplier access?",
     "options": [{"value": 0, "label": "No"}, {"value": 1, "label": "Informal assessment"},
                 {"value": 2, "label": "Documented assessment"}, {"value": 3, "label": "Formal HAZOP/risk assessment"},
                 {"value": 4, "label": "Certified safety assessment with periodic review"}]},
    {"id": "ot_maint_1", "domain": "Maintenance Controls", "weight": 1.5, "max_score": 4,
     "text": "Are maintenance activities on OT systems supervised and logged?",
     "options": [{"value": 0, "label": "No supervision"}, {"value": 1, "label": "Informal supervision"},
                 {"value": 2, "label": "Logged activities"}, {"value": 3, "label": "Supervised + logged"},
                 {"value": 4, "label": "Full change management with approval workflow"}]},
]

COMMON_QUESTIONS = [
    {"id": "com_cert_1", "domain": "Certifications", "weight": 1.0, "max_score": 4,
     "text": "Does the supplier hold relevant security certifications?",
     "options": [{"value": 0, "label": "No certifications"}, {"value": 1, "label": "ISO 9001 only"},
                 {"value": 2, "label": "ISO 27001"}, {"value": 3, "label": "ISO 27001 + IEC 62443"},
                 {"value": 4, "label": "Multiple certs including sector-specific"}]},
    {"id": "com_train_1", "domain": "Security Awareness", "weight": 1.0, "max_score": 4,
     "text": "Does the supplier conduct security awareness training for staff?",
     "options": [{"value": 0, "label": "No training"}, {"value": 1, "label": "Onboarding only"},
                 {"value": 2, "label": "Annual training"}, {"value": 3, "label": "Regular training + phishing tests"},
                 {"value": 4, "label": "Continuous security culture program"}]},
]


def get_questions_for_supplier(supplier_type: str, access_type: str) -> List[Dict[str, Any]]:
    questions = list(COMMON_QUESTIONS)
    if supplier_type in ("IT", "HYBRID"):
        questions.extend(IT_QUESTIONS)
    if supplier_type in ("OT", "HYBRID"):
        questions.extend(OT_QUESTIONS)
    if access_type == "PRIVILEGED":
        for q in questions:
            if q["domain"] in ("Access Control", "OT Access Control"):
                q = dict(q)
                q["weight"] = q["weight"] * 1.5
    return questions