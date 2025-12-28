export default {
  async fetch(req, env) {
    const res = await fetch(
      "https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-name/NOMBRE",
      {
        headers: {
          "X-Riot-Token": env.RIOT_API_KEY
        }
      }
    );

    const data = await res.json();
    return Response.json(data);
  }
};
