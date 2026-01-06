from prereq_gap_mapper_V3 import run, init
import json

# Initialize the model
init()

# Sample data from the user
test_data = {
    "syllabus": """Introduction to Programming: Computer languages, creating and running programs,
Preprocessor, Compilation process, role of linker, idea of invocation and execution of a
programme. Algorithms: Representation using flowcharts, pseudocode.
Introduction to C language: Basic structure of C programs, process of compiling and
running a C program, tokens, keywords, identifiers, constants, strings, special symbols,
variables, data types, 1/0 statements. Interconversion of variables.
‘C’ Standard Libraries: stdio.h, stdlib.h, assert.h, math.h, time.h, ctype.h, setjmp.h, string.h,
stdarg.h, unistd.h""",
    "lecture_notes": """What is C?
 C is a programming language developed at AT & T‟s Bell Laboratories of USA in 1972.
 It was developed and written by Dennis Ritchie.
 C is a High Level Language with some Low Level features. So it is called Middle Level
Language.
 Major parts of popular operating systems like Windows, UNIX, Linux are still written in
C.
 C is a case-sensitive language.
11.1 History of C:
 The root of all modern languages is ALGOL, introduced in early 1960s.
 In 1967, Martin Richards developed a language BCPL (Basic Combined Programming
Language) especially for writing system software.
 In 1970, Ken Thompson created a language using many features of BCPL and called it
simply B.
 C was evolved from ALGOL, BCPL, and B by Dennis Ritchie at the Bell Laboratories in
C uses many concepts from these languages and added the concept of data types
and other powerful features.
11.2 Structure of a C Program:
Preprocessor Directives
Global Declarations
main( )
{
 Local Declarations
 Statements
}
Other functions as required.
11.3 Constants:
Constants in C refer to fixed value that does not change during the execution of a program.""",
    "test_performance": {
        "total_marks": 100,
        "obtained_marks": 80,
        "wrong_questions": [
            {"question": "what is datatype", "marks": 20}
        ],
        "correct_questions": []
    }
}

print("Running analysis...")
result = run(test_data)
print(json.dumps(result, indent=2))
