from typing import List, Dict, Any


RECOMMENDATIONS = {
    "it_gov_1": {
        0: {"priority": "CRITICAL", "action": "Develop and implement an Information Security Policy immediately.", "timeline": "30 days"},
        1: {"priority": "HIGH", "action": "Accelerate ISP development and set approval deadline.", "timeline": "60 days"},
        2: {"priority": "MEDIUM", "action": "Complete ISP implementation and schedule annual review.", "timeline": "90 days"},
        3: {"priority": "LOW", "action": "Schedule periodic ISP review cycle.", "timeline": "180 days"},
    },
    "it_acc_1": {
        0: {"priority": "CRITICAL", "action": "Implement MFA and privileged access management immediately.", "timeline": "14 days"},
        1: {"priority": "CRITICAL", "action": "Deploy MFA for all privileged accounts.", "timeline": "30 days"},
        2: {"priority": "HIGH", "action": "Implement PAM solution for privileged account management.", "timeline": "60 days"},
        3: {"priority": "MEDIUM", "action": "Add session recording to existing PAM solution.", "timeline": "90 days"},
    },
    "it_vuln_1": {
        0: {"priority": "CRITICAL", "action": "Implement vulnerability scanning program immediately.", "timeline": "30 days"},
        1: {"priority": "HIGH", "action": "Establish regular scanning schedule with remediation SLAs.", "timeline": "45 days"},
        2: {"priority": "MEDIUM", "action": "Increase scanning frequency to monthly minimum.", "timeline": "60 days"},
        3: {"priority": "LOW", "action": "Move towards continuous scanning with automated alerting.", "timeline": "90 days"},
    },
    "it_inc_1": {
        0: {"priority": "CRITICAL", "action": "Develop Incident Response Plan with client notification procedures.", "timeline": "30 days"},
        1: {"priority": "HIGH", "action": "Formalize and document incident response procedures.", "timeline": "45 days"},
        2: {"priority": "MEDIUM", "action": "Conduct tabletop exercise to test IR plan.", "timeline": "60 days"},
        3: {"priority": "LOW", "action": "Schedule annual IR plan testing with client involvement.", "timeline": "120 days"},
    },
    "ot_acc_1": {
        0: {"priority": "CRITICAL", "action": "IMMEDIATE: Restrict all remote OT access until controls are in place.", "timeline": "IMMEDIATE"},
        1: {"priority": "CRITICAL", "action": "Implement MFA for all OT remote access sessions.", "timeline": "14 days"},
        2: {"priority": "HIGH", "action": "Deploy dedicated jump server for OT remote access.", "timeline": "30 days"},
        3: {"priority": "MEDIUM", "action": "Implement full session logging and alerting for OT access.", "timeline": "60 days"},
    },
    "ot_seg_1": {
        0: {"priority": "CRITICAL", "action": "IMMEDIATE: Implement network segmentation between IT and OT.", "timeline": "IMMEDIATE"},
        1: {"priority": "CRITICAL", "action": "Implement firewall controls between IT and OT segments.", "timeline": "30 days"},
        2: {"priority": "HIGH", "action": "Upgrade to dedicated firewall with OT-aware rules.", "timeline": "45 days"},
        3: {"priority": "MEDIUM", "action": "Evaluate DMZ implementation for supplier access.", "timeline": "90 days"},
    },
    "ot_safe_1": {
        0: {"priority": "CRITICAL", "action": "Conduct safety impact assessment before any supplier OT access.", "timeline": "IMMEDIATE"},
        1: {"priority": "HIGH", "action": "Formalize safety assessment with documented methodology.", "timeline": "30 days"},
        2: {"priority": "MEDIUM", "action": "Conduct HAZOP or formal risk assessment for supplier interfaces.", "timeline": "60 days"},
        3: {"priority": "LOW", "action": "Schedule periodic safety assessment review.", "timeline": "180 days"},
    },
}

CONTRACTUAL_REQUIREMENTS = {
    "CRITICAL": [
        "Mandatory ISO 27001 certification within 12 months",
        "Right to audit clause with 5 business days notice",
        "Incident notification within 4 hours of detection",
        "Dedicated security contact available 24/7",
        "Security improvement plan with monthly reporting",
        "Penalty clauses for security breaches",
    ],
    "HIGH": [
        "ISO 27001 certification or equivalent required",
        "Annual third-party security assessment",
        "Incident notification within 24 hours",
        "Quarterly security status reporting",
        "Right to audit with 10 business days notice",
    ],
    "MEDIUM": [
        "Security questionnaire completion annually",
        "Incident notification within 72 hours",
        "Bi-annual security status update",
        "Compliance with client security policies",
    ],
    "LOW": [
        "Annual security questionnaire",
        "Incident notification within 5 business days",
        "Compliance with applicable regulations",
    ],
}


def generate_recommendations(
    answers: Dict[str, Any],
    questions: List[Dict],
    risk_category: str
) -> Dict[str, Any]:
    technical_actions = []
    for q in questions:
        qid = q["id"]
        answer = answers.get(qid)
        if answer is not None and int(answer) < 4:
            score = int(answer)
            if qid in RECOMMENDATIONS and score in RECOMMENDATIONS[qid]:
                rec = RECOMMENDATIONS[qid][score]
                technical_actions.append({
                    "question_id": qid,
                    "domain": q["domain"],
                    "question": q["text"],
                    "current_score": score,
                    "max_score": q["max_score"],
                    "priority": rec["priority"],
                    "action": rec["action"],
                    "timeline": rec["timeline"],
                })

    technical_actions.sort(
        key=lambda x: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].index(x["priority"])
    )

    return {
        "technical_actions": technical_actions,
        "contractual_requirements": CONTRACTUAL_REQUIREMENTS.get(risk_category, CONTRACTUAL_REQUIREMENTS["LOW"]),
        "reevaluation_timeline": {
            "CRITICAL": "30 days",
            "HIGH": "90 days",
            "MEDIUM": "180 days",
            "LOW": "365 days",
        }.get(risk_category, "365 days"),
        "summary": {
            "total_actions": len(technical_actions),
            "critical_actions": len([a for a in technical_actions if a["priority"] == "CRITICAL"]),
            "high_actions": len([a for a in technical_actions if a["priority"] == "HIGH"]),
            "medium_actions": len([a for a in technical_actions if a["priority"] == "MEDIUM"]),
            "low_actions": len([a for a in technical_actions if a["priority"] == "LOW"]),
        }
    }