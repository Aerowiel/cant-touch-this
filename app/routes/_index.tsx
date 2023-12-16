import CantTouchThis from "~/src/CantTouchThis";
import { addScore, getScoreBySeed, getTopTenScores } from "~/models/Score";
import { useLoaderData } from "@remix-run/react";
import { createPlayerSession, getPlayer } from "~/session.server";
import { MetaFunction, redirect } from "@remix-run/node";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "~/src/CantTouchThis/CantTouchThis";
import { useContext, useEffect, useState } from "react";
import MobileNotSupported from "~/src/CantTouchThis/Designs/MobileNotSupported";
import Game from "~/src/CantTouchThis/Game/Game";
import GameCompressor from "~/src/CantTouchThis/Utils/GameCompressor";
import { wsContext } from "~/ws-context";

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

      const trimmedPseudonyme = pseudonyme.substring(0, 3);

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
      const compressedGameState = formData.get("h") as string;
      const {
        score: clientScore,
        seed,
        snapshots,
      } = GameCompressor.decompress(compressedGameState);

      /* check snapshots, delay between 2 frames shouldn't be > 100 or so */

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

      const scoreSeemsLegit =
        clientScore === serverScore && !scoreAlreadyExists;

      console.log({ clientScore, serverScore });

      if (!scoreSeemsLegit) {
        /* Rickroll cheaters */
        console.log({
          pseudonyme,
          clientScore,
          serverScore,
          scoreAlreadyExists,
        });

        return null;
        /*return redirect(
          "https://www.youtube.com/watch?v=oHg5SJYRHA0&ab_channel=cotter548"
        );*/
      }

      await addScore({
        pseudonyme,
        score: serverScore,
        seed,
        replay: compressedGameState,
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
  const [numberOfPlayers, setNumberOfPlayers] = useState(null);

  let socket = useContext(wsContext);

  useEffect(() => {
    if (window.innerWidth < 1024) setIsDesktop(false);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("update-number-of-players", ({ numberOfPlayers }) => {
      setNumberOfPlayers(numberOfPlayers);
    });
  }, [socket]);

  return isDesktop ? (
    <CantTouchThis
      player={player}
      scores={scores}
      numberOfPlayers={numberOfPlayers}
    />
  ) : (
    <MobileNotSupported />
  );
}
