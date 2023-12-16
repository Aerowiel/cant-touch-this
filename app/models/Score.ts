import prisma from "~/lib/db.server";

const getTopTenScores = async () => {
  const topTenScores = await prisma.score.findMany({
    orderBy: [
      {
        score: "desc",
      },
    ],
    select: {
      id: true,
      pseudonyme: true,
      score: true,
      replay: true,
    },
    take: 10,
  });

  return topTenScores;
};

const addScore = async ({ pseudonyme, score, seed, replay }) => {
  const topTenScores = await getTopTenScores();

  const isTopTenScore =
    topTenScores.length < 10 ||
    topTenScores.some((topTenScore) => topTenScore.score < score);

  if (isTopTenScore) {
    if (topTenScores.length >= 10) {
      const scoreToDelete = topTenScores[topTenScores.length - 1];
      await prisma.score.delete({ where: { id: scoreToDelete.id } });
    }
    await prisma.score.create({
      data: { pseudonyme, score, seed, replay },
    });
  }
};

const getScoreBySeed = async (seed) => {
  const score = await prisma.score.findFirst({ where: { seed } });

  return score;
};

const resetScores = async () => {
  await prisma.score.deleteMany();
};

export { getTopTenScores, addScore, resetScores, getScoreBySeed };
