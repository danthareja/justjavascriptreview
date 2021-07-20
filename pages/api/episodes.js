import { getSession } from "next-auth/client";
import redis from "@/lib/redis";

const episodes = [
  { id: "1", name: "Mental Models" },
  { id: "2", name: "The JavaScript Universe" },
  { id: "3", name: "Values and Variables" },
  { id: "4", name: "Studying from the Inside" },
  { id: "5", name: "Meeting the Primitive Values" },
  { id: "6", name: "Meeting Objects and Functions" },
  { id: "7", name: "Equality of Values" },
  { id: "8", name: "Properties" },
  { id: "9", name: "Mutation" },
  { id: "10", name: "Prototypes" },
];

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({
      error: "unauthorized",
      description: "Please sign in",
    });
  }

  if (req.method === "GET") {
    const claimed = new Set(
      await redis.hvals(`user:${session.user.id}:episodes`)
    );
    console.log("claimed", claimed);
    res.status(200).json({
      body: episodes.map((episode) => ({
        ...episode,
        claimed: claimed.has(episode.id),
      })),
    });
  } else if (req.method === "POST") {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({
        error: "invalid_body",
        description: "Missing body param 'id'",
      });
    }

    if (!episodes.find((episode) => episode.id === id)) {
      res.status(404).json({
        error: "not_found",
        description: `No episode with id ${id}`,
      });
    }

    await redis.hset(`user:${session.user.id}:episodes`, id, id);
    res.status(200).json({
      body: "success",
    });
  } else {
    return res.status(405).json({
      error: "method_not_allowed",
      description: "Method not allowed",
    });
  }
}
