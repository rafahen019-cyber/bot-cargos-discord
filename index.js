const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// 🔧 CONFIGURAÇÃO
const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;


let MESSAGE_ID = null;

// 🔢 Pega limite do cargo pelo nome (ex: LIDER [2])
function getRoleLimit(roleName) {
  const match = roleName.match(/\[(\d+)\]/);
  return match ? parseInt(match[1]) : null;
}

// 🔄 Atualiza o painel
async function updateRolesEmbed() {
  const guild = await client.guilds.fetch(GUILD_ID);
  await guild.members.fetch();

  const roles = guild.roles.cache
    .filter(r => !r.managed && r.name !== "@everyone")
    .sort((a, b) => b.position - a.position);

  const embeds = [];

  for (const role of roles.values()) {
    if (role.members.size === 0) continue;

    const members = role.members.map(
      m => `➜ <@${m.id}>`
    );

    const limit = getRoleLimit(role.name);
    const countText = limit
      ? `(${members.length}/${limit})`
      : `(${members.length}/∞)`;

    const embed = new EmbedBuilder()
      .setTitle(`${role.name.replace(/\[\d+\]/, "").toUpperCase()} - ${countText}`)
      .setDescription(members.join("\n"))
      .setColor(role.color || 0x2b2d31)
      .setFooter({ text: "━━━━━━━━━━━━━━━━━━━━" });

    embeds.push(embed);
  }

  const channel = await client.channels.fetch(CHANNEL_ID);

  if (!MESSAGE_ID) {
    const msg = await channel.send({ embeds });
    MESSAGE_ID = msg.id;
  } else {
    const msg = await channel.messages.fetch(MESSAGE_ID);
    await msg.edit({ embeds });
  }
}

// ⏱ Atualiza a cada 1 minuto
setInterval(updateRolesEmbed, 60 * 1000);

// 🔔 Atualiza quando alguém muda de cargo
client.on("guildMemberUpdate", () => {
  updateRolesEmbed();
});

// ▶ Bot ligado
client.once("ready", () => {
  console.log(`✅ Bot ligado como ${client.user.tag}`);
  updateRolesEmbed();
});

client.login(TOKEN);
