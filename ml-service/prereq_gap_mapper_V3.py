"""
Prerequisite Gap Mapper for Azure ML Deployment
Analyzes syllabus, lecture notes, and test performance to identify knowledge gaps
"""

import json
import re
import numpy as np
from typing import Dict, List, Tuple, Set
from collections import defaultdict
import logging
import onnxruntime as ort
# ONNX Runtime session (Microsoft AI)



# For Azure ML deployment
#from inference_schema.schema_decorators import input_schema, output_schema
#from inference_schema.parameter_types.standard_py_parameter_type import StandardPythonParameterType

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ConceptExtractor:
    """Extract concepts from text using NLP patterns"""
    
    def __init__(self):
        # Compile regex patterns once for performance
        self.concept_patterns = [
            re.compile(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:theorem|algorithm|method|principle|law|rule|equation|formula|model|technique|process))\b'),
            re.compile(r'\b(?:linear|binary|depth|breadth|dynamic|greedy|divide|quantum|neural|machine|deep|gradient|stochastic|genetic|evolutionary)\s+[a-z]+(?:\s+[a-z]+)*\b', re.IGNORECASE),
            re.compile(r'\b[A-Z]{2,}\b'),
        ]
        
        # Prerequisite indicator words
        self.prereq_indicators = {
            'requires', 'assumes', 'builds on', 'depends on', 
            'prerequisite', 'foundation', 'based on', 'extends',
            'requires understanding of', 'assumes knowledge of'
        }
        
        # Domain-specific keywords for categorization
        self.domain_keywords = {
            'mathematics': {'calculus', 'algebra', 'geometry', 'statistics', 'probability', 'theorem', 'equation', 'logic', 'formula'},
            'programming': {'algorithm', 'data structure', 'coding', 'programming', 'function', 'class', 'loop', 'compiler', 'interpreter', 'preprocessor', 'linker', 'compilation', 'execution', 'token', 'keyword', 'identifier', 'constant', 'variable', 'data type', 'string', 'pointer', 'array', 'structure', 'union', 'file'},
            'ml_ai': {'neural network', 'machine learning', 'deep learning', 'optimization', 'gradient', 'model', 'backpropagation', 'regression', 'classification', 'clustering', 'ai', 'gpt', 'llm', 'transformer'},
            'data_science': {'analysis', 'visualization', 'regression', 'classification', 'clustering', 'data mining'},
            'physics': {'wave', 'longitudinal', 'transverse', 'speed', 'velocity', 'displacement', 'superposition', 'reflection', 'standing wave', 'harmonic', 'beat', 'amplitude', 'frequency', 'period', 'wavelength', 'oscillation', 'motion', 'energy', 'force', 'acceleration', 'momentum'},
        }
        
        # Flatten domain keywords for direct extraction
        self.known_concepts = set()
        for keywords in self.domain_keywords.values():
            self.known_concepts.update(keywords)
    
    def extract_concepts(self, text: str) -> List[str]:
        """Extract key concepts from text, preserving order"""
        # Limit text length for performance
        text = text[:10000] if len(text) > 10000 else text
        text_lower = text.lower()
        
        # Normalize common variations
        text_lower = text_lower.replace('datatype', 'data type')
        text_lower = text_lower.replace('programing', 'programming')
        text_lower = text_lower.replace('modeling', 'modelling')
        
        # Store matches as (start_index, concept_text)
        matches = []
        
        # 1. Regex patterns
        for pattern in self.concept_patterns:
            for match in pattern.finditer(text):
                matches.append((match.start(), match.group().lower()))
        
        # 2. Known concepts (domain keywords)
        for concept in self.known_concepts:
            # Find all occurrences of the concept
            for m in re.finditer(r'\b' + re.escape(concept) + r'\b', text_lower):
                matches.append((m.start(), concept))
                
        # 3. Capitalized phrases
        cap_text = text[:5000]
        for m in re.finditer(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b', cap_text):
            matches.append((m.start(), m.group().lower()))
            
        # Sort by position
        matches.sort(key=lambda x: x[0])
        
        # Dedup preserving order
        unique_concepts = []
        seen = set()
        for _, concept in matches:
            if concept not in seen:
                seen.add(concept)
                unique_concepts.append(concept)
                
        return unique_concepts[:100]
    
    def extract_prerequisites(self, text: str) -> List[Tuple[str, str]]:
        """Extract prerequisite relationships from text"""
        # Limit text length for performance
        text = text[:10000] if len(text) > 10000 else text
        
        prereq_relations = []
        sentences = text.split('.')[:50]  # Limit to first 50 sentences
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            
            # Check for prerequisite indicators
            for indicator in self.prereq_indicators:
                if indicator in sentence_lower:
                    concepts = self.extract_concepts(sentence)
                    if len(concepts) >= 2:
                        # First concept depends on subsequent concepts
                        main_concept = concepts[0]
                        for prereq in concepts[1:3]:  # Limit to 2 prereqs per sentence
                            prereq_relations.append((main_concept, prereq))
                    break  # Only process first matching indicator
        
        return prereq_relations[:100]  # Limit total relations
    
    def categorize_concept(self, concept: str) -> str:
        """Categorize concept into domain"""
        concept_lower = concept.lower()
        
        for domain, keywords in self.domain_keywords.items():
            if any(kw in concept_lower for kw in keywords):
                return domain
        
        return 'general'


class KnowledgeGraph:
    """Lightweight knowledge graph for prerequisite relationships"""
    
    def __init__(self):
        self.graph = defaultdict(set)  # concept -> set of prerequisites
        self.reverse_graph = defaultdict(set)  # prerequisite -> set of concepts
        self.concepts = set()
    
    def add_relationship(self, concept: str, prerequisite: str):
        """Add a prerequisite relationship"""
        self.graph[concept].add(prerequisite)
        self.reverse_graph[prerequisite].add(concept)
        self.concepts.add(concept)
        self.concepts.add(prerequisite)
    
    def get_prerequisites(self, concept: str, depth: int = 2, max_depth: int = 5) -> Set[str]:
        """
        Get all prerequisites for a concept up to specified depth
        
        Args:
            concept: The concept to get prerequisites for
            depth: Current depth to traverse (default: 2)
            max_depth: Maximum recursion depth guard (default: 5)
        
        Returns:
            Set of all prerequisite concepts
        """
        # Recursion guard
        if depth == 0 or depth > max_depth or concept not in self.graph:
            return set()
        
        direct_prereqs = self.graph[concept]
        all_prereqs = set(direct_prereqs)
        
        for prereq in direct_prereqs:
            all_prereqs.update(self.get_prerequisites(prereq, depth - 1, max_depth))
        
        return all_prereqs
    
    def get_dependent_concepts(self, prerequisite: str) -> Set[str]:
        """Get all concepts that depend on this prerequisite"""
        return self.reverse_graph.get(prerequisite, set())


class GapAnalyzer:
    """Analyze knowledge gaps based on test performance"""
    
    def __init__(self):
        self.concept_extractor = ConceptExtractor()
        self.knowledge_graph = KnowledgeGraph()
    
    def build_knowledge_graph(self, syllabus_text: str, notes_text: str):
        """Build knowledge graph from syllabus and notes"""
        combined_text = f"{syllabus_text}\n\n{notes_text}"
        
        # Extract prerequisite relationships
        prereq_relations = self.concept_extractor.extract_prerequisites(combined_text)
        
        for concept, prereq in prereq_relations:
            self.knowledge_graph.add_relationship(concept, prereq)
        
        # Add concepts without explicit prerequisites
        all_concepts = self.concept_extractor.extract_concepts(combined_text)
        for concept in all_concepts:
            self.knowledge_graph.concepts.add(concept)
        
        logger.info(f"Built knowledge graph with {len(self.knowledge_graph.concepts)} concepts")
    
    def analyze_test_performance(self, test_data: Dict) -> Dict[str, float]:
        """Analyze test performance to identify weak concepts"""
        concept_scores = defaultdict(list)
        
        # Extract total marks and score
        total_marks = test_data.get('total_marks', 100)
        obtained_marks = test_data.get('obtained_marks', 0)
        overall_performance = obtained_marks / total_marks if total_marks > 0 else 0
        
        # Analyze wrong questions
        wrong_questions = test_data.get('wrong_questions', [])
        
        for question in wrong_questions:
            question_text = question.get('question', '')
            concepts = self.concept_extractor.extract_concepts(question_text)
            
            # Mark these concepts as weak (score 0)
            for concept in concepts:
                concept_scores[concept].append(0.0)
        
        # Analyze correct questions if provided
        correct_questions = test_data.get('correct_questions', [])
        for question in correct_questions:
            question_text = question.get('question', '')
            concepts = self.concept_extractor.extract_concepts(question_text)
            
            for concept in concepts:
                concept_scores[concept].append(1.0)
        
        # Calculate average score per concept
        concept_performance = {}
        for concept, scores in concept_scores.items():
            concept_performance[concept] = np.mean(scores)
        
        return concept_performance
    
    def identify_gaps(self, concept_performance: Dict[str, float], 
                      threshold: float = 0.6) -> List[Dict]:
        """Identify knowledge gaps and missing prerequisites"""
        gaps = []
        
        # Find weak concepts
        weak_concepts = {
            concept: score 
            for concept, score in concept_performance.items() 
            if score < threshold
        }
        
        logger.info(f"Found {len(weak_concepts)} weak concepts")
        
        # For each weak concept, find missing prerequisites
        for weak_concept, score in weak_concepts.items():
            prerequisites = self.knowledge_graph.get_prerequisites(weak_concept)
            
            # Check if prerequisites are also weak
            missing_prereqs = []
            for prereq in prerequisites:
                prereq_score = concept_performance.get(prereq, 0.0)
                if prereq_score < threshold:
                    missing_prereqs.append({
                        'prerequisite': prereq,
                        'score': prereq_score,
                        'category': self.concept_extractor.categorize_concept(prereq)
                    })
            
            gap_info = {
                'concept': weak_concept,
                'performance_score': score,
                'category': self.concept_extractor.categorize_concept(weak_concept),
                'missing_prerequisites': missing_prereqs,
                'all_prerequisites': list(prerequisites),
                'priority': self._calculate_priority(weak_concept, score, missing_prereqs)
            }
            
            gaps.append(gap_info)
        
        # Sort by priority
        gaps.sort(key=lambda x: x['priority'], reverse=True)
        
        return gaps
    
    def _calculate_priority(self, concept: str, score: float, 
                           missing_prereqs: List[Dict]) -> float:
        """Calculate priority for addressing this gap"""
        # Priority based on:
        # 1. How many concepts depend on this (more = higher priority)
        # 2. How poorly performed (lower score = higher priority)
        # 3. Number of missing prerequisites
        
        dependent_count = len(self.knowledge_graph.get_dependent_concepts(concept))
        performance_factor = 1.0 - score
        prereq_factor = len(missing_prereqs) * 0.1
        
        priority = float((dependent_count * 0.5) + (performance_factor * 0.3) + prereq_factor)
        return priority


# Global instances for shared resources only (stateless components)
concept_extractor = None


def init():
    """Initialize the model (called once when endpoint starts)"""
    global concept_extractor
    # Only initialize stateless, shared components
    concept_extractor = ConceptExtractor()
    logger.info("Prerequisite Gap Mapper initialized successfully")


# Define input/output schema for Azure ML
input_sample = {
    "syllabus": "Introduction to Machine Learning. Topics: Linear Regression, requires knowledge of calculus and linear algebra...",
    "lecture_notes": "Neural Networks build on understanding of linear regression and optimization...",
    "test_performance": {
        "total_marks": 100,
        "obtained_marks": 65,
        "wrong_questions": [
            {"question": "Explain backpropagation in neural networks", "marks": 10},
            {"question": "Derive the gradient descent update rule", "marks": 15}
        ],
        "correct_questions": [
            {"question": "What is linear regression?", "marks": 10}
        ]
    }
}

output_sample = {
    "gaps": [],
    "summary": {
        "total_gaps": 0,
        "high_priority_gaps": 0,
        "categories": {}
    }
}

def run(data):
    """
    Main inference function for Azure ML
    
    Args:
        data: Dictionary with 'syllabus', 'lecture_notes', and 'test_performance'
    
    Returns:
        Dictionary with identified gaps and recommendations
    """
    try:
        logger.info("Processing prerequisite gap analysis request")
        
        # Create a NEW analyzer instance for THIS request (thread-safe)
        analyzer = GapAnalyzer()
        
        # Extract inputs
        syllabus = data.get('syllabus', '')
        lecture_notes = data.get('lecture_notes', '')
        test_performance = data.get('test_performance', {})
        
        # Validate inputs
        if not syllabus and not lecture_notes:
            return {
                "error": "At least one of syllabus or lecture_notes must be provided",
                "gaps": [],
                "summary": {}
            }
        
        # Build knowledge graph
        analyzer.build_knowledge_graph(syllabus, lecture_notes)
        
        # Analyze test performance
        concept_performance = analyzer.analyze_test_performance(test_performance)
        
        # Identify gaps
        gaps = analyzer.identify_gaps(concept_performance)
        
        # Generate summary
        high_priority = [g for g in gaps if g['priority'] > 1.0]
        
        categories = defaultdict(int)
        for gap in gaps:
            categories[gap['category']] += 1
        
        summary = {
            "total_gaps": len(gaps),
            "high_priority_gaps": len(high_priority),
            "categories": dict(categories),
            "overall_performance": test_performance.get('obtained_marks', 0) / 
                                 test_performance.get('total_marks', 1)
        }
        
        result = {
            "gaps": gaps,
            "summary": summary,
            "recommendations": _generate_recommendations(gaps[:5])  # Top 5 gaps
        }
        
        logger.info(f"Analysis complete. Found {len(gaps)} gaps")
        return result
        
    except Exception as e:
        logger.error(f"Error in gap analysis: {str(e)}")
        return {
            "error": str(e),
            "gaps": [],
            "summary": {}
        }


def _generate_recommendations(top_gaps: List[Dict]) -> List[str]:
    """Generate learning recommendations based on gaps"""
    recommendations = []
    
    for gap in top_gaps:
        concept = gap['concept']
        missing_prereqs = gap['missing_prerequisites']
        
        if missing_prereqs:
            prereq_names = ', '.join([p['prerequisite'] for p in missing_prereqs[:3]])
            recommendations.append(
                f"Review foundational concepts ({prereq_names}) before studying {concept}"
            )
        else:
            recommendations.append(
                f"Focus on improving understanding of {concept} through practice problems"
            )
    
    return recommendations


if __name__ == "__main__":
    # Test locally (init not needed for local testing since we create instance in run())
    init()
    
    test_data = {
        "syllabus": """
        Course: Introduction to Machine Learning
        
        Week 1: Linear Regression - requires knowledge of calculus and linear algebra
        Week 2: Logistic Regression - builds on linear regression
        Week 3: Neural Networks - requires understanding of gradient descent and backpropagation
        Week 4: Deep Learning - extends neural networks
        """,
        "lecture_notes": """
        Neural Networks build on linear regression concepts.
        Backpropagation depends on understanding of chain rule from calculus.
        Gradient Descent is an optimization algorithm used in machine learning.
        Convolutional Neural Networks extend basic neural networks for image processing.
        """,
        "test_performance": {
            "total_marks": 100,
            "obtained_marks": 65,
            "wrong_questions": [
                {"question": "Explain backpropagation algorithm in neural networks", "marks": 10},
                {"question": "Derive gradient descent update rule using calculus", "marks": 15},
                {"question": "Implement a convolutional layer", "marks": 10}
            ],
            "correct_questions": [
                {"question": "What is linear regression and its assumptions?", "marks": 10},
                {"question": "Explain logistic regression", "marks": 8}
            ]
        }
    }
    
    result = run(test_data)
    print(json.dumps(result, indent=2))