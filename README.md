# Creating an AI-powered phone answering machine talking with your own voice

This repo contains the code for the small project described here: Article_link

## Running the project

To run the project:
- Frontend: Install the dependencies with `pnpm install` in the frontend directory, then run `pnpm dev` to start the frontend.
- Backend:
    - Install the required packages in the backend with `pip install`
        - openai
        - fastapi
        - elevenlabs
    - Modify the file `main.py` to include your API key from OpenAI, ElevenLabs, as well as the voice id you want to use from the ElevenLabs web app (you can clone your voice on the ElevenLabs web app as well)
    - Run `fastapi dev main.py` in the backend folder
