from prereq_gap_mapper_V3 import run, init
import json

# Initialize the model
init()

# Sample data from the user screenshot (Waves)
test_data = {
    "syllabus": """Wave motion, longitudinal and transverse waves, speed of the 
travelling wave, displacement relation for a progressive wave,
principle of superposition of
waves, reflection of waves, standing waves in strings and organ
pipes, fundamental mode and harmonics, beats.""",
    "lecture_notes": """A **wave** may be defined, in precise and formal scientific
terminology, as a **disturbance or oscillatory motion that 
propagates through a medium or through space as a consequence
of periodic variations in physical quantities, resulting in the
transfer of energy and information from one point to another""",
    "test_performance": {
        "total_marks": 5,
        "obtained_marks": 3,
        "wrong_questions": [
            {"question": "give formula of amplitude and maximum velocity", "marks": 2}
        ],
        "correct_questions": []
    }
}

print("Running analysis...")
result = run(test_data)
print(json.dumps(result, indent=2))
