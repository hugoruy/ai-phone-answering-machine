import io
from typing import List
import openai

from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel


origins = ["http://localhost:3000"]
app = FastAPI(title="AI-Powered Phone Answering Machine", summary="Article link")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openAIClient = openai.OpenAI(
    api_key="<YOUR_OPENAI_API_KEY>"
)


@app.post("/transcribe")
async def transcribe(file: UploadFile):
    audio = await file.read()

    buffer = io.BytesIO(audio)
    buffer.name = "audio.m4a"

    transcript = openAIClient.audio.transcriptions.create(
        model="whisper-1", file=buffer
    )

    return {"transcript": transcript.text}


class MessageOpenAI(BaseModel):
    role: str
    content: str


class MessagesInput(BaseModel):
    messages: List[MessageOpenAI]


systemMessage = [
    {
        "role": "system",
        "content": """
                Tu es Hugo, mon double virtuel, en charge de prendre mes appels quand je ne suis pas disponible. Ton but est de te faire passer pour moi. Tu dois répondre de manière concise à ton interlocuteur téléphonique en lui demandant comment il va, attendre sa réponse, répondre à ses questions s'il s'agit de small talk puis lui expliquer que je ne suis pas disponible et lui proposer que je le rappelle plus tard entre 9h et 18h en semaine. Adapte toi à ses contraintes jusqu'à trouver un créneau disponible.

                Utilise le tutoiement et parle de manière informelle et décontractée, sauf si ton interlocuteur te vouvoie. N'utilise pas "Malheureusement".

                Voici un exemple de conversation (Interlocutor: I, Hugo;: H):
                I - "Salut Hugo, comment tu vas?"
                H - "Au top, merci! Et toi?"
                I - "Super aussi! J'avais une question par rapport à ton devis, je ne comprends pas certaines infos ..."
                H - "Ha mince, désolé de ne pas avoir été clair. Juste, je suis en rendez-vous actuellement, je peux te rappeler plus tard, à 14h par exemple?"
                I - "Non j'ai un offsite toute l'après-midi, demain plutôt ?"
                H - "Yes, 14h demain du coup ?"
                I - "Top, 14h demain c'est parfait pour moi, j'attends ton appel"
                H - "Génial, à demain 14h alors!"
            """,
    }
]


@app.post("/getAnswer")
async def chat(body: MessagesInput):
    messages = body.messages
    completion = openAIClient.chat.completions.create(
        model="gpt-4o",
        messages=systemMessage + messages,
    )

    response = completion.choices[0].message

    return {"message": response.content}


elevenLabsClient = ElevenLabs(
    api_key="<YOUR_ELEVEN_LABS_API_KEY>",
)

CHUNK_SIZE = 1024


@app.get("/synthesize")
async def synthesize(text: str):
    response = elevenLabsClient.text_to_speech.convert(
        voice_id="<THE_ID_OF_YOUR_VOICE>",
        optimize_streaming_latency="1",
        output_format="mp3_22050_32",
        text=text,
        model_id="eleven_multilingual_v2",
        voice_settings=VoiceSettings(
            stability=0.7,
            similarity_boost=0.7,
            style=0.0,
            use_speaker_boost=True,
        ),
    )

    audio_stream = io.BytesIO()

    for chunk in response:
        if chunk:
            audio_stream.write(chunk)

    audio_stream.seek(0)

    return StreamingResponse(audio_stream, media_type="audio/mpeg")
