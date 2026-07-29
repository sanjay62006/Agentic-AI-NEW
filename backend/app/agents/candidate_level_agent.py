def classify_candidate(overall_score: float, skills_count: int) -> dict:
    # Bonus for having many skills
    adjusted = overall_score + min(skills_count * 0.5, 10)
    adjusted = min(adjusted, 100)

    if adjusted < 40:
        level = "Beginner"
        description = "You are at the beginning of your career journey. Focus on building core fundamentals."
        color = "#ef4444"
    elif adjusted < 70:
        level = "Intermediate"
        description = "You have a solid foundation. Focus on deepening expertise and building real-world projects."
        color = "#f59e0b"
    else:
        level = "Advanced"
        description = "You demonstrate strong technical knowledge. Focus on leadership, system design, and specialization."
        color = "#10b981"

    return {
        "level": level,
        "overall_score": overall_score,
        "adjusted_score": adjusted,
        "description": description,
        "color": color
    }
