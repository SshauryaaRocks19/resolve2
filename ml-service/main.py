from fastapi import FastAPI
from prereq_gap_mapper_V3 import run
# from lecture_memory_rebuilder import router as lecture_router

app = FastAPI()

@app.post("/analyze")
def analyze_endpoint(data: dict):
    return run(data)

# app.include_router(lecture_router)
