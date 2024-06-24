import { useRef, useState } from "react";

import { BACKEND_URL } from "../constants";

export const AudioRecorder = ({
  addMessage,
}: {
  addMessage: (role: string, content: string) => void;
}): JSX.Element => {
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };
    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });

      const formData = new FormData();
      formData.append("file", audioBlob);

      const currentTranscriptResponse = await fetch(
        `${BACKEND_URL}/transcribe`,
        {
          method: "POST",
          body: formData,
        }
      );
      const jsonResp = (await currentTranscriptResponse.json()) as {
        transcript: string;
      };
      const transcript = jsonResp.transcript;
      addMessage("user", transcript);
      audioChunks.current = [];
    };
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
};
