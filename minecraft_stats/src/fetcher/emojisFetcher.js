const emojis = require("../config/emojis.json");

module.exports = async (client) => {
  try {
    const Grass = await client.emojis.cache.get(emojis.grass);
    const Wifi = await client.emojis.cache.get(emojis.wifi);
    const Settings = await client.emojis.cache.get(emojis.settings);
    const Users = await client.emojis.cache.get(emojis.users);
    const Pen = await client.emojis.cache.get(emojis.pen);
    const Signal = await client.emojis.cache.get(emojis.signal);
    const Branch = await client.emojis.cache.get(emojis.branch);
    const BranchLine = await client.emojis.cache.get(emojis.branchLine);
    const BranchEnd = await client.emojis.cache.get(emojis.branchEnd);
    const FiveM = await client.emojis.cache.get(emojis.fiveM);
    const SAMP = await client.emojis.cache.get(emojis.samp);

    const Emojis = {
      grass: Grass,
      wifi: Wifi,
      settings: Settings,
      users: Users,
      pen: Pen,
      signal: Signal,
      branch: Branch,
      branchLine: BranchLine,
      branchEnd: BranchEnd,
      fiveM: FiveM,
      samp: SAMP,
    };

    return Emojis;
  } catch (error) {
    console.log(error);
  }
};
