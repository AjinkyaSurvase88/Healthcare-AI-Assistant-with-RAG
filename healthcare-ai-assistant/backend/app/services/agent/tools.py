import random
from datetime import datetime, timedelta
from typing import Optional


# Mock appointment database
DEPARTMENT_SLOTS = {
    "cardiology": {
        "days": ["Monday", "Wednesday", "Friday"],
        "hours": ["9:00 AM", "10:30 AM", "11:00 AM", "2:00 PM", "3:30 PM"],
        "location": "Block A, Room 204",
        "contact": "ext. 1201",
        "requires_referral": True,
    },
    "general practice": {
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "hours": ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"],
        "location": "Block B, Room 101",
        "contact": "ext. 1001",
        "requires_referral": False,
    },
    "dermatology": {
        "days": ["Tuesday", "Thursday"],
        "hours": ["10:00 AM", "11:00 AM", "11:30 AM", "2:00 PM", "3:00 PM"],
        "location": "Block C, Room 312",
        "contact": "ext. 1305",
        "requires_referral": False,
    },
    "orthopedics": {
        "days": ["Monday", "Tuesday", "Thursday"],
        "hours": ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"],
        "location": "Block D, Room 108",
        "contact": "ext. 1408",
        "requires_referral": True,
    },
    "pediatrics": {
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "hours": ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM"],
        "location": "Block B, Room 205",
        "contact": "ext. 1205",
        "requires_referral": False,
    },
    "neurology": {
        "days": ["Tuesday", "Friday"],
        "hours": ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"],
        "location": "Block A, Room 310",
        "contact": "ext. 1310",
        "requires_referral": True,
    },
    "psychiatry": {
        "days": ["Monday", "Wednesday", "Thursday"],
        "hours": ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
        "location": "Block E, Room 402 (Telehealth preferred)",
        "contact": "ext. 1402",
        "requires_referral": False,
    },
    "gynecology": {
        "days": ["Monday", "Wednesday", "Friday"],
        "hours": ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:30 PM"],
        "location": "Block C, Room 210",
        "contact": "ext. 1210",
        "requires_referral": False,
    },
}

# Keyword aliases for departments
DEPARTMENT_ALIASES = {
    "cardiology": ["cardiology", "cardiologist", "heart", "cardiac", "cardiovascular", "chest pain", "ecg", "echocardiogram"],
    "general practice": ["general", "gp", "primary care", "family doctor", "general practice", "physician", "general physician"],
    "dermatology": ["dermatology", "dermatologist", "skin", "rash", "acne", "eczema", "psoriasis"],
    "orthopedics": ["orthopedics", "orthopedic", "bone", "joint", "fracture", "knee", "hip", "spine", "back pain", "ortho"],
    "pediatrics": ["pediatrics", "pediatrician", "child", "children", "baby", "infant", "kid"],
    "neurology": ["neurology", "neurologist", "brain", "nerve", "migraine", "headache", "seizure", "stroke"],
    "psychiatry": ["psychiatry", "psychiatrist", "mental health", "depression", "anxiety", "therapy", "counseling", "behavioral"],
    "gynecology": ["gynecology", "gynecologist", "ob/gyn", "obgyn", "obstetrics", "women's health", "pregnancy", "pap smear"],
}


def detect_department(question: str) -> Optional[str]:
    """
    Detects the medical department from a free-text question using keyword matching.
    Returns the department name or None if not detected.
    """
    q = question.lower()
    for dept, aliases in DEPARTMENT_ALIASES.items():
        for alias in aliases:
            if alias in q:
                return dept
    return None


def get_upcoming_dates(target_days: list[str], count: int = 3) -> list[str]:
    """
    Returns the next `count` dates that fall on any of the target_days of the week.
    """
    today = datetime.now()
    day_map = {
        "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
        "friday": 4, "saturday": 5, "sunday": 6,
    }
    target_indices = {day_map[d.lower()] for d in target_days}
    upcoming = []
    for i in range(1, 30):  # Look up to 30 days ahead
        candidate = today + timedelta(days=i)
        if candidate.weekday() in target_indices:
            upcoming.append(candidate.strftime("%A, %d %B %Y"))
        if len(upcoming) >= count:
            break
    return upcoming


def check_available_slots(department: Optional[str] = None, date: Optional[str] = None) -> str:
    """
    Mock Tool: Returns available appointment slots for a given department and date.
    If department is None, returns all departments. If date is None, returns next available dates.

    Args:
        department: The medical department (e.g., 'cardiology', 'dermatology')
        date: Optional target date string (e.g., 'Monday', 'next Friday')

    Returns:
        A formatted string of available appointment slots.
    """
    if department and department.lower() in DEPARTMENT_SLOTS:
        depts_to_show = {department.lower(): DEPARTMENT_SLOTS[department.lower()]}
    else:
        # Show all departments when none specified or not recognized
        depts_to_show = DEPARTMENT_SLOTS

    lines = ["📅 **Available Appointment Slots**\n"]
    lines.append("=" * 50)

    for dept_name, info in depts_to_show.items():
        upcoming_dates = get_upcoming_dates(info["days"], count=2)
        # Randomly select 2–3 time slots to simulate real availability
        available_hours = random.sample(info["hours"], min(3, len(info["hours"])))

        lines.append(f"\n🏥 **{dept_name.title()}**")
        lines.append(f"   📍 Location: {info['location']}")
        lines.append(f"   📞 Contact: {info['contact']}")
        if info["requires_referral"]:
            lines.append(f"   ⚠️  Referral Required: Yes (from your Primary Care Physician)")
        else:
            lines.append(f"   ✅ Referral Required: No")
        lines.append(f"   📆 Next Available Dates:")
        for date_str in upcoming_dates:
            lines.append(f"      • {date_str}")
        lines.append(f"   🕐 Available Time Slots: {', '.join(available_hours)}")

    lines.append("\n" + "=" * 50)
    lines.append("ℹ️  To confirm your appointment, please call the department directly or use the Patient Portal.")
    lines.append("ℹ️  Please bring your insurance card and a valid photo ID to your appointment.")

    return "\n".join(lines)
