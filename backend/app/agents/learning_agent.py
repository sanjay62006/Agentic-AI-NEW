LEARNING_RESOURCES = {
    "python": [
        {"title": "Python for Everybody", "platform": "Coursera", "url": "https://coursera.org/specializations/python", "type": "course", "duration": "8 weeks"},
        {"title": "Python Full Course", "platform": "YouTube (freeCodeCamp)", "url": "https://youtube.com/watch?v=rfscVS0vtbw", "type": "video", "duration": "4 hours"},
        {"title": "Python Docs", "platform": "python.org", "url": "https://docs.python.org/3/tutorial/", "type": "documentation", "duration": "Self-paced"},
    ],
    "react": [
        {"title": "React - The Complete Guide", "platform": "Udemy", "url": "https://udemy.com/course/react-the-complete-guide-incl-redux/", "type": "course", "duration": "40 hours"},
        {"title": "React Docs", "platform": "react.dev", "url": "https://react.dev/learn", "type": "documentation", "duration": "Self-paced"},
    ],
    "machine learning": [
        {"title": "Machine Learning Specialization", "platform": "Coursera (Andrew Ng)", "url": "https://coursera.org/specializations/machine-learning-introduction", "type": "course", "duration": "3 months"},
        {"title": "Kaggle ML Courses", "platform": "Kaggle", "url": "https://kaggle.com/learn", "type": "practice", "duration": "Self-paced"},
    ],
    "docker": [
        {"title": "Docker Mastery", "platform": "Udemy", "url": "https://udemy.com/course/docker-mastery/", "type": "course", "duration": "20 hours"},
        {"title": "Docker Docs", "platform": "docs.docker.com", "url": "https://docs.docker.com/get-started/", "type": "documentation", "duration": "Self-paced"},
    ],
    "aws": [
        {"title": "AWS Cloud Practitioner", "platform": "AWS Training", "url": "https://aws.amazon.com/training/", "type": "certification", "duration": "40 hours"},
        {"title": "AWS Solutions Architect", "platform": "Udemy (Stephane Maarek)", "url": "https://udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/", "type": "course", "duration": "30 hours"},
    ],
    "sql": [
        {"title": "SQL for Data Science", "platform": "Coursera", "url": "https://coursera.org/learn/sql-for-data-science", "type": "course", "duration": "4 weeks"},
        {"title": "SQLZoo", "platform": "sqlzoo.net", "url": "https://sqlzoo.net", "type": "practice", "duration": "Self-paced"},
    ],
    "javascript": [
        {"title": "JavaScript Algorithms and Data Structures", "platform": "freeCodeCamp", "url": "https://freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "type": "course", "duration": "300 hours"},
        {"title": "The Modern JavaScript Tutorial", "platform": "javascript.info", "url": "https://javascript.info", "type": "documentation", "duration": "Self-paced"},
    ],
    "kubernetes": [
        {"title": "Kubernetes for Beginners", "platform": "YouTube (TechWorld with Nana)", "url": "https://youtube.com/watch?v=X48VuDVv0do", "type": "video", "duration": "4 hours"},
        {"title": "CKA Certification", "platform": "Linux Foundation", "url": "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", "type": "certification", "duration": "3 months"},
    ],
    "default": [
        {"title": "LeetCode Practice", "platform": "LeetCode", "url": "https://leetcode.com", "type": "practice", "duration": "Self-paced"},
        {"title": "GitHub Learning Lab", "platform": "GitHub", "url": "https://github.com/apps/github-learning-lab", "type": "practice", "duration": "Self-paced"},
    ]
}

def recommend_learning(missing_skills: list, level: str) -> list:
    recommendations = []
    for skill in missing_skills[:6]:
        skill_lower = skill.lower()
        resources = LEARNING_RESOURCES.get(skill_lower, LEARNING_RESOURCES["default"])
        for r in resources:
            recommendations.append({**r, "skill": skill})
    return recommendations
