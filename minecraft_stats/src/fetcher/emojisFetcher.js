const emojis = require("../config/emojis.json");

module.exports = async (client) => {
  const Grass = await client.emojis.cache.get(emojis.grass);
  const Wifi = await client.emojis.cache.get(emojis.wifi);
  const Settings = await client.emojis.cache.get(emojis.settings);
  const Users = await client.emojis.cache.get(emojis.users);
  const Pen = await client.emojis.cache.get(emojis.pen);
  const Signal = await client.emojis.cache.get(emojis.signal);

  const Emojis = {
    grass: Grass,
    wifi: Wifi,
    settings: Settings,
    users: Users,
    pen: Pen,
    signal: Signal
  }

  return Emojis;
}