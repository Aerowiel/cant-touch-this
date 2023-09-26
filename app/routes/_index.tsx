import CantTouchThis from "~/src/CantTouchThis";
import { addScore, getScoreBySeed, getTopTenScores } from "~/models/Score";
import { useLoaderData } from "@remix-run/react";
import { createPlayerSession, getPlayer } from "~/session.server";
import { MetaFunction, redirect } from "@remix-run/node";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "~/src/CantTouchThis/CantTouchThis";
import { useEffect, useState } from "react";
import MobileNotSupported from "~/src/CantTouchThis/Designs/MobileNotSupported";
import GameCompresser from "~/src/CantTouchThis/Utils/GameCompressor";
import GameEncoder from "~/src/CantTouchThis/Utils/GameEncoder";
import Game from "~/src/CantTouchThis/Game/Game";

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
      const player = await getPlayer(request);

      if (!player) {
        return null;
      }

      const pseudonyme = player.pseudonyme;

      /* Replay */
      const clientScore = Number(formData.get("score") as string);
      const seed = formData.get("s") as string;
      const compressedSnapshots = formData.get("h") as string;
      const encodedSnapshots = GameCompresser.decompress(compressedSnapshots);
      const snapshots = GameEncoder.decodeSnapshots(encodedSnapshots);
      console.log({ snapshots });
      console.log({ seed });

      const canvas = {
        width: CANVAS_HEIGHT,
        height: CANVAS_WIDTH,
        context: null,
      };

      const game = new Game({
        seed,
        canvas,
        callbacks: {},
        server: true,
      });

      game.serverReplay(snapshots);

      const serverScore = game.score;

      const scoreAlreadyExists = await getScoreBySeed(seed);

      console.log({ scoreAlreadyExists });
      const scoreSeemsLegit =
        clientScore === serverScore && !scoreAlreadyExists;

      if (!scoreSeemsLegit) {
        /* Rickroll cheaters */
        return redirect(
          "https://www.youtube.com/watch?v=oHg5SJYRHA0&ab_channel=cotter548"
        );
      }

      await addScore({
        pseudonyme,
        score: serverScore,
        seed,
        replay: compressedSnapshots,
      });
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
