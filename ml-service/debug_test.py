from prereq_gap_mapper_V3 import run, init
import json

# Initialize the model
init()

# Sample data from the frontend
test_data = {
    "syllabus": """Course: Introduction to Machine Learning
Week 1: Linear Regression - requires knowledge of calculus and linear algebra
Week 2: Logistic Regression - builds on linear regression
Week 3: Neural Networks - requires understanding of gradient descent and backpropagation
Week 4: Deep Learning - extends neural networks""",
    "lecture_notes": """Neural Networks build on linear regression concepts.
Backpropagation depends on understanding of chain rule from calculus.
Gradient Descent is an optimization algorithm used in machine learning.
Convolutional Neural Networks extend basic neural networks for image processing.""",
    "test_performance": {
        "total_marks": 100,
        "obtained_marks": 65,
        "wrong_questions": [
            {"question": "Explain backpropagation algorithm in neural networks", "marks": 10},
            {"question": "Derive gradient descent update rule using calculus", "marks": 15}
        ],
        "correct_questions": []
    }
}

print("Running analysis...")
result = run(test_data)
print(json.dumps(result, indent=2))
