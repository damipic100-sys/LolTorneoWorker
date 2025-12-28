// src/index.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

export default {
  async fetch(req, env) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE);

    const summoners = ["Jugador1", "Jugador2", "Jugador3"]; // lista de jugadores
    const region = "la2"; // cambiá por tu servidor

    let results = [];

    for (const name of summoners) {
      try {
        // 1️⃣ Obtener datos del summoner
        const sRes = await fetch(
          `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(name)}`,
          { headers: { "X-Riot-Token": env.RIOT_API_KEY } }
        );
        if (!sRes.ok) throw new Error(`Riot summoner fetch failed: ${sRes.status}`);
        const summoner = await sRes.json();

        // 2️⃣ Obtener datos de league
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

        // 3️⃣ Guardar/upsert en Supabase
        const { error } = await supabase.from("players").upsert({
          riot_id: summoner.name,
          player_rank: `${soloq.tier} ${soloq.rank}`,
          lp: soloq.leaguePoints,
          elo: soloq.leaguePoints,
          updated_at: new Date()
        }, { onConflict: ["riot_id"] });

        if (error) throw new Error(`Supabase upsert failed: ${error.message}`);

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
