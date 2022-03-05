const { Telegraf, Markup } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const name = Telegraf.on("text", (ctx) => {
  ctx.scene.state.name = ctx.message.text;
  ctx.reply(
    "Please, enter your company description",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const licence = Telegraf.on("text", (ctx) => {
  ctx.wizard.state.description = ctx.message.text;
  ctx.reply(
    "Please, enter your company licence",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const email = Telegraf.on("text", (ctx) => {
  ctx.wizard.state.description = ctx.message.text;
  ctx.reply(
    "Please, enter your company licence",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});

const web = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.web = ctx.message.text;
  await ctx.reply(
    "Enter Company pobox...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const pobox = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.pobox = ctx.message.text;
  await ctx.reply(
    "Enter Company wereda...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const wereda = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.wereda = ctx.message.text;
  await ctx.reply(
    "Enter Company city...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const city = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.city = ctx.message.text;
  await ctx.reply(
    "Enter Company subcity...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const subcity = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.subcity = ctx.message.text;
  await ctx.reply(
    "Enter Company state...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const state = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.state = ctx.message.text;
  await ctx.reply(
    "Enter Company phonenumber...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const phonenumber = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.phonenumber = ctx.message.text;
  await ctx.reply(
    "Enter Company officenumber...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const officenumber = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.officenumber = ctx.message.text;
  await ctx.reply(
    "Enter Company faxnumber...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const faxnumber = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.faxnumber = ctx.message.text;
  await ctx.reply(
    "Enter Company latitiue...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const latitiue = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.latitiue = ctx.message.text;
  await ctx.reply(
    "Enter Company longtiude...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const longtiude = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.longtiude = ctx.message.text;
  await ctx.reply(
    "Enter Company kebele...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const kebele = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.kebele = ctx.message.text;
  await ctx.reply(
    "Enter Company street...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
const street = Telegraf.on("text", async (ctx) => {
  ctx.scene.state.street = ctx.message.text;
  await ctx.reply(
    "Enter Company logo...?",
    Markup.inlineKeyboard([
      Markup.button.callback("Cancel ❌", "BACK"),
    ]).resize()
  );
  return ctx.wizard.next();
});
module.exports = {
  name,
  licence,
  email,
};
