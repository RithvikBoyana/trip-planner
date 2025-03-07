from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv

load_dotenv()

# FastAPI initialization
app = FastAPI()

# Load OpenAI API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

if not openai.api_key:
    print("⚠️ OpenAI API key is missing! Make sure to set it in the environment variables.")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://10.212.3.66:3000"],  # Include both origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Define request model
class TripRequest(BaseModel):
    destination: str
    interests: list
    days: int

@app.post("/generate-itinerary")
def generate_itinerary(request: TripRequest):
    print(request)  # Debugging line to print the incoming data
    prompt = f"Create a {request.days}-day travel itinerary for {request.destination} based on these interests: {', '.join(request.interests)}. No description of the day needed go straight into Morning: ..."
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": prompt}]
    )

    return {"itinerary": response["choices"][0]["message"]["content"]}
