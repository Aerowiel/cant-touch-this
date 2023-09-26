import { createCookieSessionStorage, redirect } from "@remix-run/node";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const SESSION_KEY = "ctt_player_session";

export async function createPlayerSession({
  request,
  pseudonyme,
}: {
  request: Request;
  pseudonyme: string;
}) {
  const session = await getSession(request);
  session.set(SESSION_KEY, {
    player: { pseudonyme },
  });
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
      }),
    },
  });
}

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getPlayer(
  request: Request
): Promise<{ pseudonyme: string } | undefined> {
  const session = await getSession(request);

  const data = session.get(SESSION_KEY);
  return data?.player;
}
