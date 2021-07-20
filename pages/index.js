import React from "react";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/client";
import { useQuery, useMutation, useQueryClient } from "react-query";

import styles from "@/styles/Home.module.css";

export default function Home() {
  const [session, loading] = useSession();

  if (loading) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Just JavaScript Review</title>
        <meta
          name="description"
          content="Review lessons and quizzes from Just JavaScript"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Just JavaScript Review</h1>
        {session ? (
          <>
            <p className={styles.description}>
              When you are done with an episode, click the button below to
              schedule an appointment
            </p>

            <div className={styles.grid}>
              <EpisodeCardList />
            </div>
          </>
        ) : (
          <button className={styles.card} onClick={() => signIn("github")}>
            <p>Log in to continue</p>
          </button>
        )}
      </main>

      {session && (
        <footer className={styles.footer}>
          <button onClick={() => signOut()}>Log out</button>
        </footer>
      )}
    </div>
  );
}

function EpisodeCardList() {
  const [session] = useSession();
  const { isLoading, error, data } = useQuery(
    ["episodes", session.user.id],
    () => fetch("/api/episodes").then((res) => res.json()),
    {
      enabled: !!session,
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return data.body.map((episode) => (
    <EpisodeCardItem key={episode.id} episode={episode} />
  ));
}

function EpisodeCardItem({ episode }) {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    (id) =>
      fetch("/api/episodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("episodes");
      },
    }
  );

  return (
    <button
      className={styles.card}
      disabled={episode.claimed || mutation.isLoading}
      onClick={() => {
        if (
          confirm(
            "Are you sure you are ready to review this episode? This will notify Dan and cannot be undone"
          )
        ) {
          mutation.mutate(episode.id);
        }
      }}
    >
      <h2>{episode.name}</h2>
      <p>
        {episode.claimed
          ? "Claimed!"
          : mutation.isLoading
          ? "Claiming..."
          : "Click to claim"}
      </p>
    </button>
  );
}
