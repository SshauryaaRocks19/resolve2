from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import re
import json

# Initialize router
router = APIRouter(prefix="/lecture", tags=["Lecture Memory Rebuilder"])

# Global model variables (load once at startup)
model = None
tokenizer = None
text_generator = None

class LectureInput(BaseModel):
    text: str
    max_concepts: Optional[int] = 7
    num_flashcards: Optional[int] = 10
    difficulty_levels: Optional[List[str]] = ["basic", "intermediate", "advanced"]

class Concept(BaseModel):
    name: str
    definition: str
    importance: str

class Flashcard(BaseModel):
    question: str
    answer: str
    concept_related: str

class SpacedQuestion(BaseModel):
    question: str
    answer: str
    difficulty: str
    question_type: str

class LectureOutput(BaseModel):
    concepts: List[Concept]
    flashcards: List[Flashcard]
    spaced_questions: List[SpacedQuestion]

def load_phi_model():
    """Load Microsoft Phi model on startup"""
    global model, tokenizer, text_generator
    
    try:
        model_name = "microsoft/Phi-3-mini-4k-instruct"
        
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None,
            trust_remote_code=True
        )
        
        text_generator = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            max_new_tokens=1000,
            temperature=0.7,
            do_sample=True
        )
        
        print("✅ Phi model loaded successfully")
        
    except Exception as e:
        print(f"❌ Error loading Phi model: {e}")
        raise e

def chunk_text(text: str, max_chunk_size: int = 2000) -> List[str]:
    """Split long lecture text into manageable chunks"""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) < max_chunk_size:
            current_chunk += sentence + " "
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

def generate_with_phi(prompt: str) -> str:
    """Generate text using Phi model"""
    try:
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        # Format for Phi-3 instruct model
        formatted_prompt = tokenizer.apply_chat_template(
            messages, 
            tokenize=False, 
            add_generation_prompt=True
        )
        
        response = text_generator(
            formatted_prompt,
            max_new_tokens=1000,
            temperature=0.7,
            do_sample=True,
            top_p=0.9
        )
        
        generated_text = response[0]['generated_text']
        # Extract only the new generated content after the prompt
        result = generated_text.split(formatted_prompt)[-1].strip()
        
        return result
        
    except Exception as e:
        print(f"Error in generation: {e}")
        return ""

def parse_concepts(response: str) -> List[Concept]:
    """Parse concept extraction response"""
    concepts = []
    
    try:
        # Try to parse as JSON first
        if "{" in response and "}" in response:
            json_match = re.search(r'\{.*\}|\[.*\]', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                if isinstance(data, list):
                    for item in data:
                        concepts.append(Concept(**item))
                    return concepts
        
        # Fallback: parse structured text
        concept_blocks = re.split(r'\n\s*\d+[\.)]\s*|\n\s*-\s*', response)
        
        for block in concept_blocks:
            if not block.strip():
                continue
                
            lines = [line.strip() for line in block.split('\n') if line.strip()]
            
            name = ""
            definition = ""
            importance = ""
            
            for line in lines:
                if line.startswith("Name:") or line.startswith("Concept:"):
                    name = re.sub(r'^(Name:|Concept:)\s*', '', line).strip()
                elif line.startswith("Definition:"):
                    definition = re.sub(r'^Definition:\s*', '', line).strip()
                elif line.startswith("Importance:") or line.startswith("Why it matters:"):
                    importance = re.sub(r'^(Importance:|Why it matters:)\s*', '', line).strip()
                elif not name:
                    name = line
                elif not definition:
                    definition = line
                elif not importance:
                    importance = line
            
            if name and definition:
                concepts.append(Concept(
                    name=name,
                    definition=definition,
                    importance=importance or "Key concept for understanding the topic"
                ))
        
    except Exception as e:
        print(f"Error parsing concepts: {e}")
    
    return concepts

def parse_flashcards(response: str, concepts: List[Concept]) -> List[Flashcard]:
    """Parse flashcard generation response"""
    flashcards = []
    
    try:
        # Try JSON parsing first
        if "{" in response and "}" in response:
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                for item in data:
                    flashcards.append(Flashcard(**item))
                return flashcards
        
        # Parse Q&A format
        lines = response.split('\n')
        current_q = ""
        current_a = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if line.startswith('Q:') or line.startswith('Question:') or re.match(r'^\d+\.', line):
                if current_q and current_a:
                    concept_name = concepts[len(flashcards) % len(concepts)].name if concepts else "General"
                    flashcards.append(Flashcard(
                        question=current_q,
                        answer=current_a,
                        concept_related=concept_name
                    ))
                current_q = re.sub(r'^(Q:|Question:|\d+\.)\s*', '', line)
                current_a = ""
            elif line.startswith('A:') or line.startswith('Answer:'):
                current_a = re.sub(r'^(A:|Answer:)\s*', '', line)
            elif '|' in line:
                parts = line.split('|')
                if len(parts) == 2:
                    concept_name = concepts[len(flashcards) % len(concepts)].name if concepts else "General"
                    flashcards.append(Flashcard(
                        question=parts[0].strip(),
                        answer=parts[1].strip(),
                        concept_related=concept_name
                    ))
        
        if current_q and current_a:
            concept_name = concepts[len(flashcards) % len(concepts)].name if concepts else "General"
            flashcards.append(Flashcard(
                question=current_q,
                answer=current_a,
                concept_related=concept_name
            ))
            
    except Exception as e:
        print(f"Error parsing flashcards: {e}")
    
    return flashcards

def parse_spaced_questions(response: str) -> List[SpacedQuestion]:
    """Parse spaced repetition questions"""
    questions = []
    
    try:
        # Parse structured questions
        sections = re.split(r'\n(?=Basic:|Intermediate:|Advanced:)', response)
        
        for section in sections:
            lines = section.split('\n')
            difficulty = "basic"
            
            if section.startswith('Intermediate:'):
                difficulty = "intermediate"
            elif section.startswith('Advanced:'):
                difficulty = "advanced"
            
            for line in lines[1:]:
                if not line.strip() or line.startswith(('Basic:', 'Intermediate:', 'Advanced:')):
                    continue
                
                if '|' in line:
                    parts = line.split('|')
                    if len(parts) >= 2:
                        questions.append(SpacedQuestion(
                            question=parts[0].strip(),
                            answer=parts[1].strip(),
                            difficulty=difficulty,
                            question_type="recall"
                        ))
                elif line.startswith(('Q:', '-', '*')):
                    q_text = re.sub(r'^(Q:|-|\*)\s*', '', line)
                    questions.append(SpacedQuestion(
                        question=q_text,
                        answer="[Answer to be provided]",
                        difficulty=difficulty,
                        question_type="open-ended"
                    ))
                    
    except Exception as e:
        print(f"Error parsing spaced questions: {e}")
    
    return questions

@router.post("/extract-concepts", response_model=List[Concept])
async def extract_concepts(lecture: LectureInput):
    """Extract key concepts from lecture text"""
    
    if not text_generator:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        chunks = chunk_text(lecture.text)
        all_concepts = []
        
        for chunk in chunks[:2]:  # Process first 2 chunks to avoid long processing
            prompt = f"""Extract the {lecture.max_concepts} most important key concepts from this lecture text. 
For each concept, provide:
1. Name (concise title)
2. Definition (clear explanation)
3. Importance (why it matters)

Lecture text:
{chunk}

Format your response as a structured list."""

            response = generate_with_phi(prompt)
            concepts = parse_concepts(response)
            all_concepts.extend(concepts)
        
        # Remove duplicates and limit to max_concepts
        unique_concepts = []
        seen_names = set()
        
        for concept in all_concepts:
            if concept.name.lower() not in seen_names:
                unique_concepts.append(concept)
                seen_names.add(concept.name.lower())
                
                if len(unique_concepts) >= lecture.max_concepts:
                    break
        
        return unique_concepts
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting concepts: {str(e)}")

@router.post("/generate-flashcards", response_model=List[Flashcard])
async def generate_flashcards(lecture: LectureInput):
    """Generate flashcards from lecture content"""
    
    if not text_generator:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # First extract concepts
        concepts_response = await extract_concepts(lecture)
        concepts = concepts_response if isinstance(concepts_response, list) else concepts_response
        
        concepts_text = "\n".join([f"- {c.name}: {c.definition}" for c in concepts])
        
        prompt = f"""Create {lecture.num_flashcards} flashcards based on these concepts:

{concepts_text}

Format each flashcard as:
Question | Answer

Make questions specific, clear, and answers concise. Cover different aspects of the concepts."""

        response = generate_with_phi(prompt)
        flashcards = parse_flashcards(response, concepts)
        
        return flashcards[:lecture.num_flashcards]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating flashcards: {str(e)}")

@router.post("/spaced-repetition-questions", response_model=List[SpacedQuestion])
async def generate_spaced_questions(lecture: LectureInput):
    """Generate questions optimized for spaced repetition"""
    
    if not text_generator:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        chunks = chunk_text(lecture.text)
        chunk_sample = chunks[0]
        
        prompt = f"""Create spaced repetition questions at three difficulty levels from this lecture:

{chunk_sample}

Generate questions for:
Basic: Simple recall questions
Intermediate: Understanding and application questions  
Advanced: Analysis and synthesis questions

Format: Question | Answer | Difficulty"""

        response = generate_with_phi(prompt)
        questions = parse_spaced_questions(response)
        
        return questions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating spaced questions: {str(e)}")

@router.post("/process-lecture", response_model=LectureOutput)
async def process_complete_lecture(lecture: LectureInput):
    """Process lecture and generate all outputs: concepts, flashcards, and spaced questions"""
    
    try:
        concepts = await extract_concepts(lecture)
        flashcards = await generate_flashcards(lecture)
        spaced_questions = await generate_spaced_questions(lecture)
        
        return LectureOutput(
            concepts=concepts,
            flashcards=flashcards,
            spaced_questions=spaced_questions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing lecture: {str(e)}")

# Startup event to load model
@router.on_event("startup")
async def startup_event():
    """Load Phi model when API starts"""
    load_phi_model()