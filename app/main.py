from fastapi import FastAPI
from routers import router
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Crypto AI Analyser")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://87.228.8.46"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
