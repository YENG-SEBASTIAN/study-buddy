// Shared shape for one turn in the conversation. `sources` and `isError`
// are optional because a user message never has either - only assistant
// replies do.
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  isError?: boolean;
};

// Matches the JSON shape the Lambda returns on success - see the
// `respond(200, { answer, sources })` call in backend/lambda_function.py.
export type AskResponse = {
  answer: string;
  sources: string[];
};

// One DynamoDB item from GET /history - see handle_history in
// backend/lambda_function.py.
export type HistoryItem = {
  userId: string;
  timestamp: string;
  question: string;
  answer: string;
  sources: string[];
};
