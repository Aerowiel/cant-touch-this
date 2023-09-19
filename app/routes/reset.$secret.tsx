import { json } from "react-router";
import { resetScores } from "~/models/Score";

export const loader = async ({ params }) => {
  if (params.secret === process.env.RESET_SCOREBOARD_SECRET) {
    await resetScores();

    return json({ success: true }, 200);
  }

  return null;
};
