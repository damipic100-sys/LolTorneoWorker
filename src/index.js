export default {
  async fetch(req, env) {
    const summoners = ["DAMI#ARG", "RaviolesConCrema#Queso", "N1GHTMA#zzz"];
    const region = "la2"; // tu server

    for (const name of summoners) {
      // 1) Datos de summoner
      const sRes = await fetch(
        `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`,
        { headers: { "X-Riot-Token": env.RGAPI-5e226843-f286-4190-bac3-9561e757101e } }
      );
      const summoner = await sRes.json();

      // 2) Datos de league
      const lRes = await fetch(
        `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`,
        { headers: { "X-Riot-Token": env.RGAPI-5e226843-f286-4190-bac3-9561e757101e } }
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

      await fetch(`${env.https://klnnytucxqfojusrkaya.supabase.co}/rest/v1/players`, {
        method: "POST",
        headers: {
          "apikey": env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsbm55dHVjeHFmb2p1c3JrYXlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgwMTAyOSwiZXhwIjoyMDgyMzc3MDI5fQ.o3oNktCG0BP6PlPZGEmugrOTwvIM-3d02eFQWS7EFmU,
          "Authorization": `Bearer ${env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsbm55dHVjeHFmb2p1c3JrYXlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjgwMTAyOSwiZXhwIjoyMDgyMzc3MDI5fQ.o3oNktCG0BP6PlPZGEmugrOTwvIM-3d02eFQWS7EFmU}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(body)
      });
    }

    return new Response(JSON.stringify({ ok: true }));
  }
};
