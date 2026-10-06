import os
import random

roles = [
    "Software Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Frontend Developer",
    "Backend Developer",
    "DevOps Engineer"
]

modern_skills = ["React", "Next.js", "Tailwind CSS", "TypeScript", "Node.js", "GraphQL", "Docker", "Kubernetes", "AWS", "GCP", "FastAPI", "PyTorch", "TensorFlow", "LangChain", "Vector Databases", "Supabase", "Prisma"]
legacy_skills = ["Java 8", "SVN", "Perl", "jQuery", "SOAP XML", "Apache Ant", "PHP 5", "Struts", "Visual Basic", "Oracle DB", "CVS"]
core_skills = ["Python", "Java", "C++", "SQL", "Git", "Linux", "REST APIs", "Data Structures", "Algorithms"]

first_names = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Skyler", "Avery", "Sam", "Chris", "Pat", "Drew"]
last_names = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson"]

def generate_resume(i):
    name = f"{random.choice(first_names)} {random.choice(last_names)}"
    role = random.choice(roles)
    
    # Decide profile type: 0 = Modern, 1 = Legacy, 2 = Core/Balanced
    profile_type = random.choices([0, 1, 2], weights=[0.5, 0.2, 0.3])[0]
    
    my_skills = random.sample(core_skills, k=random.randint(2, 4))
    
    if profile_type == 0:
        my_skills += random.sample(modern_skills, k=random.randint(4, 7))
        exp_text = f"Experience: 3-5 years building highly scalable, modern applications.\nKey achievements include migrating legacy systems to microservices and setting up automated CI/CD pipelines."
    elif profile_type == 1:
        my_skills += random.sample(legacy_skills, k=random.randint(4, 7))
        exp_text = f"Experience: 10+ years maintaining enterprise infrastructure.\nKey achievements include managing large monolithic codebases and coordinating with overseas teams using SVN."
    else:
        my_skills += random.sample(modern_skills, k=random.randint(1, 3))
        my_skills += random.sample(legacy_skills, k=random.randint(1, 2))
        exp_text = f"Experience: 6 years developing software solutions.\nKey achievements include writing robust backend APIs and managing relational databases."

    random.shuffle(my_skills)
    
    content = f"""{name}
{role} | Candidate ID: #{1000 + i}

Contact: {name.lower().replace(' ', '.')}@example.com

SUMMARY
Passionate {role} with a focus on delivering high-quality software and systems. Proven track record in solving complex technical problems.

TECHNICAL SKILLS
{", ".join(my_skills)}

PROFESSIONAL EXPERIENCE
{exp_text}

EDUCATION
B.S. Computer Science, State University, 2018
"""
    return content

def main():
    out_dir = "/Users/sarah/Documents/Projects/SkillShift-main/SkillShift-main/dummy_resumes"
    os.makedirs(out_dir, exist_ok=True)
    
    num_resumes = 35
    for i in range(1, num_resumes + 1):
        content = generate_resume(i)
        filepath = os.path.join(out_dir, f"candidate_{i:03d}.txt")
        with open(filepath, "w") as f:
            f.write(content)
            
    print(f"Successfully generated {num_resumes} dummy resumes in {out_dir}")

if __name__ == "__main__":
    main()
