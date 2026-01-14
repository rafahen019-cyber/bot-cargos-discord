const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// 🔧 CONFIGURAÇÃO
const GUILD_ID = "1328568366893498368";
const CHANNEL_ID = "1460762390722253026";

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

// ⏱ Atualiza a cada 1 minuto (continua igual)
setInterval(updateRolesEmbed, 60 * 1000);

// 🔔 ATUALIZA AUTOMÁTICO QUANDO MUDA CARGO (o que você pediu)
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  // Se os cargos mudaram
  if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
    try {
      await updateRolesEmbed();
      console.log("Cargos atualizados automaticamente");
    } catch (err) {
      console.error("Erro ao atualizar cargos:", err);
    }
  }
});

// ▶ Bot ligado
client.once("ready", () => {
  console.log(`✅ Bot ligado como ${client.user.tag}`);
  updateRolesEmbed();
});

// 🔑 TOKEN vem do Render
client.login(process.env.TOKEN);
