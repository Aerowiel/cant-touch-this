import CantTouchThis from "~/src/CantTouchThis";
import { addScore, getTopTenScores } from "~/models/Score";
import { useLoaderData } from "@remix-run/react";
import {
  createPlayerSession,
  getCurrentGame,
  getPlayer,
} from "~/session.server";
import { MetaFunction, redirect } from "@remix-run/node";
import { BALL_SPAWN_RATE } from "~/src/CantTouchThis/CantTouchThis";
import { useEffect, useState } from "react";
import MobileNotSupported from "~/src/CantTouchThis/Designs/MobileNotSupported";
import CryptoJS from "crypto-js";

export const loader = async ({ request }) => {
  const data = {
    player: await getPlayer(request),
    scores: await getTopTenScores(),
  };
  return data;
};

export const action = async ({ request }) => {
  const formData = await request.formData();

  const action = formData.get("action") as string;

  switch (action) {
    case "startNewGame": {
      const pseudonyme = formData.get("pseudonyme") as string;

      if (!pseudonyme) {
        return redirect("/");
      }

      const trimmedPseudonyme = pseudonyme.substring(0, 20);

      return createPlayerSession({
        request,
        pseudonyme: trimmedPseudonyme,
      });
    }
    case "endGame": {
      const endedAt = Date.now();

      const player = await getPlayer(request);
      const pseudonyme = player.pseudonyme;

      const currentGame = await getCurrentGame(request);
      const startedAt = currentGame.startedAt;

      if (!currentGame) {
        return null;
      }

      const score = Number(formData.get("score") as string);
      const encryptedScore = formData.get("userId") as string;
      const encryptedScoreBytes = CryptoJS.AES.decrypt(
        encryptedScore,
        "jVAriiJYoR7OZBW"
      );
      const decryptedScore = Number(
        encryptedScoreBytes.toString(CryptoJS.enc.Utf8)
      );

      const elaspedTimeInSeconds = (endedAt - startedAt) / 1000;
      const calculatedScore = Math.floor(
        elaspedTimeInSeconds / BALL_SPAWN_RATE + 1
      );

      const scoreSeemsLegit =
        score === decryptedScore && score === calculatedScore;

      /* Debug suspicious score */
      if (score > 20 || !scoreSeemsLegit) {
        console.log({
          pseudonyme,
          elaspedTimeInSeconds,
          score,
          decryptedScore,
          calculatedScore,
          scoreSeemsLegit,
        });
      }

      if (score > 100 || !scoreSeemsLegit) return null;

      await addScore({ pseudonyme, score, elaspedTimeInSeconds });
      await getTopTenScores();

      return null;
    }
  }

  return null;
};

export const meta: MetaFunction = () => {
  return [{ title: "Can't touch this !" }];
};

export default function Index() {
  const { player, scores } = useLoaderData<typeof loader>();
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) setIsDesktop(false);
  }, []);

  return isDesktop ? (
    <CantTouchThis player={player} scores={scores} />
  ) : (
    <MobileNotSupported />
  );
}
