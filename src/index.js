export default {
  async fetch(req, env) {
    const summoners = ["DAMI#ARG", "RaviolesConCrema#Queso", "N1GHTMA#zzz"];
    const region = "la2"; // tu server

    for (const name of summoners) {
      // 1) Datos de summoner
      const sRes = await fetch(
        `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`,
        { headers: { "X-Riot-Token": env.RIOT_API_KEY } }
      );
      const summoner = await sRes.json();

      // 2) Datos de league
      const lRes = await fetch(
        `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`,
        { headers: { "X-Riot-Token": env.RIOT_API_KEY } }
      );
      const leagues = await lRes.json();

      const soloq = leagues.find(l => l.queueType === "RANKED_SOLO_5x5");
      if (!soloq) continue;

      // 3) Guardar en Supabase
      const body = {
        riot_id: summoner.name,
        rank: `${soloq.tier} ${soloq.rank}`,
        lp: soloq.leaguePoints,
        elo: soloq.leaguePoints // lo podés ajustar
      };

      await fetch(`${env.SUPABASE_URL}/rest/v1/players`, {
        method: "POST",
        headers: {
          "apikey": env.SUPABASE_SERVICE_ROLE,
          "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(body)
      });
    }

    return new Response(JSON.stringify({ ok: true }));
  }
};
