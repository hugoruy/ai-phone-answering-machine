import { OpenAIMessage } from "../App";

export const TranscriptSection = ({
  messages,
}: {
  messages: OpenAIMessage[];
}): JSX.Element => {
  return (
    <div>
      {messages.map(({ role, content }) => (
        <div key={content}>{`${getRoleName(role)}: ${content}`}</div>
      ))}
    </div>
  );
};

const getRoleName = (role: string): string => {
  switch (role) {
    case "user":
      return "Caller";
    case "assistant":
      return "Hugal";
    default:
      return "Unknown";
  }
};
