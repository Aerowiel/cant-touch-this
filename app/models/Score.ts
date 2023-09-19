import prisma from "~/lib/db.server";

const getTopTenScores = async () => {
  const topTenScores = await prisma.score.findMany({
    orderBy: [
      {
        elaspedTimeInSeconds: "desc",
      },
    ],
    take: 10,
  });

  return topTenScores;
};

const addScore = async ({ pseudonyme, score, elaspedTimeInSeconds }) => {
  const topTenScores = await getTopTenScores();

  const isTopTenScore =
    topTenScores.length < 10 ||
    topTenScores.some(
      (score) => score.elaspedTimeInSeconds < elaspedTimeInSeconds
    );

  if (isTopTenScore) {
    if (topTenScores.length >= 10) {
      const scoreToDelete = topTenScores[topTenScores.length - 1];
      await prisma.score.delete({ where: { id: scoreToDelete.id } });
    }
    await prisma.score.create({
      data: { pseudonyme, score, elaspedTimeInSeconds },
    });
  }
};

const resetScores = async () => {
  await prisma.score.deleteMany();
};

export { getTopTenScores, addScore, resetScores };
