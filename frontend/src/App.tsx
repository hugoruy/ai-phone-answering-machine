import { useEffect, useState } from "react";

import { AudioRecorder } from "./components/AudioRecorder";
import { TranscriptSection } from "./components/TranscriptSection";
import "./App.css";
import { BACKEND_URL } from "./constants";

export type OpenAIMessage = {
  role: string;
  content: string;
};

const getSpeech = async (text: string) => {
  const response = await fetch(`${BACKEND_URL}/synthesize?text=${text}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    void audio.play();
  }
};

export const App = (): JSX.Element => {
  const [messages, setMessages] = useState<OpenAIMessage[]>([
    {
      role: "assistant",
      content: "Allo ?",
    },
  ]);

  const addMessage = (role: string, content: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role,
        content,
      },
    ]);
  };

  useEffect(() => {
    const getAnswer = async () => {
      if (messages[messages.length - 1].role === "assistant") {
        return;
      }
      const response = await fetch(`${BACKEND_URL}/getAnswer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messages }),
      });
      const jsonResponse = (await response.json()) as { message: string };
      await getSpeech(jsonResponse.message);
      addMessage("assistant", jsonResponse.message);
    };

    void getAnswer();
  }, [messages]);

  return (
    <>
      <div>
        <AudioRecorder addMessage={addMessage} />
        <TranscriptSection messages={messages} />
      </div>
    </>
  );
};
