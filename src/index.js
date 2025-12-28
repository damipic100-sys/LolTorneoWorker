export default {
  async fetch(req, env) {
    const res = await fetch(
      "https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-name/NOMBRE",
      {
        headers: {
          "X-Riot-Token": env.RGAPI-5e226843-f286-4190-bac3-9561e757101e
        }
      }
    );
    const summoners = ["DAMI#ARG", "RaviolesConCrema#Queso", "N1GHTMA#zzz"];


    const data = await res.json();
    return Response.json(data);
  }
};
