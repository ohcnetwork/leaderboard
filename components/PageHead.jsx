import Head from "next/head";
export default function PageHead({title}){

    return (
        <Head>
            <title>{title && title+" | "}Coronasafe Leaderboard</title>
            <meta name="description" content="Coronasafe Leaderboard tracks the weekly progress of all coronasafe contributors." />
            <link rel="icon" href="/favicon.ico" />
        </Head>
    )
    
}