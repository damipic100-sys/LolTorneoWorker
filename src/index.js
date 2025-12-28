
export default {
  async fetch(req, env) {
    const summoners = ["DAMI#ARG", "RaviolesConCrema#Queso", "N1GHTMA#zzz"];
    const region = "la2"; // cambiá por tu servidor

    let results = [];

    for (const name of summoners) {
      try {
        // 1️⃣ Datos del summoner
        const sRes = await fetch(
          `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`,
          { headers: { "X-Riot-Token": env.RIOT_API_KEY } }
        );
        if (!sRes.ok) throw new Error(`Riot summoner fetch failed: ${sRes.status}`);
        const summoner = await sRes.json();

        // 2️⃣ Datos de league
        const lRes = await fetch(
          `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`,
          { headers: { "X-Riot-Token": env.RIOT_API_KEY } }
        );
        if (!lRes.ok) throw new Error(`Riot league fetch failed: ${lRes.status}`);
        const leagues = await lRes.json();

        const soloq = leagues.find(l => l.queueType === "RANKED_SOLO_5x5");
        if (!soloq) {
          results.push({ name, status: "No SoloQ" });
          continue;
        }

        // 3️⃣ Guardar en Supabase
        const body = {
          riot_id: summoner.name,
          "rank": `${soloq.tier} ${soloq.rank}`,
          lp: soloq.leaguePoints,
          elo: soloq.leaguePoints
        };

        const upsert = await fetch(`${env.SUPABASE_URL}/rest/v1/players`, {
          method: "POST",
          headers: {
            "apikey": env.SUPABASE_SERVICE_ROLE,
            "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
          },
          body: JSON.stringify(body)
        });

        if (!upsert.ok) {
          const text = await upsert.text();
          throw new Error(`Supabase upsert failed: ${upsert.status} - ${text}`);
        }

        results.push({ name, status: "Updated" });
      } catch (err) {
        results.push({ name, status: "Error", message: err.message });
      }
    }

    return new Response(JSON.stringify(results, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
