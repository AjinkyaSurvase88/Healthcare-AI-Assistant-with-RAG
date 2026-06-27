from app.services.agent.tools import check_available_slots

def route_query(question: str) -> bool:
    """
    Returns True if the query should be routed to the appointment tool.
    Otherwise False.
    """
    appointment_keywords = ["appointment", "booking", "schedule", "availability", "doctor timings", "book", "slot"]
    question_lower = question.lower()
    for kw in appointment_keywords:
        if kw in question_lower:
            return True
    return False

def handle_appointment_query(question: str) -> str:
    """
    Handles appointment queries.
    """
    slots = check_available_slots()
    return f"Here are the details for appointment booking:\n\n{slots}\n\nPlease let me know which slot you prefer."
