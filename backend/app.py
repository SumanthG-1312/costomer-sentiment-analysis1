import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.rfm_analysis import perform_rfm_segmentation

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Python": "on Vercel"}

@app.post("/analyze")
async def analyze_data(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.json', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV, JSON, or Excel files are allowed.")
    
    contents = await file.read()
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents), encoding="unicode_escape")
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_json(io.BytesIO(contents))
            
        result = perform_rfm_segmentation(df)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
