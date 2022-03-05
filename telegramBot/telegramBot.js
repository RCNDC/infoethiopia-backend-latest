require("dotenv").config();

const {
  Telegraf,
  session,
  Scenes: { WizardScene, Stage },
  Markup,
} = require("telegraf");
const Handlers = require("./createCompany");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    `Hello ${ctx.from.first_name},👋👋👋 Greetings and Welcome to INFOETHIOPIA, infoethiopia is a free website and application-based system that provide companies info, detail, and address-based in Ethiopia.This telegram bot is developed mainly to enable users to register
   their own company to our system`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Add New Company ➕", "AddComapany"),
        Markup.button.callback("Back to menu", "BACK"),
      ],
      [Markup.button.url("Visit our official website 🌐", "infoethiopia.net")],
    ]).resize()
  );
});
bot.action("AddComapany", async (ctx) => {
  ctx.deleteMessage();
  ctx.reply(
    `your are starting the process of adding new company to info ethiopia (add explanatory description on how to add)
    click proceed 👇 button to start`,
    Markup.inlineKeyboard([
      [Markup.button.callback("Proceed", "Proceed")],
    ]).resize()
  );
});

bot.action("BACK", async (ctx) => {
  await ctx.reply(`Glad I could help`);
  // ctx.deleteMessage();
  // ctx.scene.leave("add_company");
  ctx.reply(
    `Do you need something else, ${ctx.from.first_name}?`,
    Markup.inlineKeyboard([
      Markup.button.callback("Add New Company ➕", "AddComapany"),
      Markup.button.url("Visit our official website 🌐", "infoethiopia.net"),
    ]).extra()
  );
});

const add_company = new WizardScene(
  "add_company",
  (ctx) => {
    ctx.reply(
      "Please, enter your company name",
      Markup.inlineKeyboard([
        Markup.button.callback("Cancel ❌", "BACK"),
      ]).resize()
    );
    return ctx.wizard.next();
  },

  Handlers.name,
  Handlers.licence,
  Handlers.email,
  (ctx) => {
    ctx.replyWithHTML(
      `<b> Your Company detail is summerized as follows </b>
        <b>Company Name :</b>${ctx.wizard.state?.name}
        <b>Company description :</b>${ctx.wizard.state?.description}
        `,
      Markup.inlineKeyboard([
        [
          Markup.button.callback("Submit", "SUBMIT"),
          Markup.button.callback("Back to menu", "BACK"),
        ],
        [
          Markup.button.url(
            "Visit our official website 🌐",
            "infoethiopia.net"
          ),
        ],
      ]).resize()
    );

    return ctx.wizard.next();
  },
  (ctx) => {
    const {
      name,
      description,
      // city,
      // state,
      // street,
      // kebele,
      // lat,
      // long,
      // wereda,
      // subCity,
      // web,
      // pobox,
      // email,
    } = ctx.wizard.state;
    console.log(name, description);
    //   // const point = { type: "Point", coordinates: [lat, long] };
    //   // return db.Company.findOne({ where: { name } })
    //   //   .then((result) => {
    //   //     if (result) {
    //   //       return res
    //   //         .status(400)
    //   //         .json({ err: "There is already a company with this name." });
    //   //     }
    //   //     return db.Company.create({
    //   //       name,
    //   //       description,
    //   //       web,
    //   //       email,
    //   //       slug: slugify(name),
    //   //     })
    //   //       .then((result) => {
    //   //         return db.Address.create({
    //   //           city,
    //   //           state,
    //   //           street_no: street,
    //   //           kebele,
    //   //           wereda,
    //   //           sub_city: subCity,
    //   //           location: point,
    //   //           companyId: result.Id,
    //   //           pobox,
    //   //         })
    //   //           .then(() => {
    //   //             return res.json({ message: "Company successfully created." });
    //   //           })
    //   //           .catch((err) => {
    //   //             return res
    //   //               .status(400)
    //   //               .json({ err: "Error creating the company." });
    //   //           });
    //   //       })
    //   //       .catch((err) => {
    //   //         return res.status(400).json({ err: "Error creating the company." });
    //   //       });
    //   //   })
    //   //   .catch((err) => {
    //   //     return res.status(400).json({ err: "Error finding the company." });
    //   //   });
    //   // ctx.reply("Success ... Your company request is submitted", {
    //   //   reply_markup: {
    //   //     inline_keyboard: [
    //   //       [{ text: "Go back to previous to menu", callback_data: "Go-back" }],
    //   //     ],
    //   //   },
    //   // });
  }
);

bot.hears("Proceed", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.enter("add_company");
});
bot.help((ctx) => {
  ctx.reply(
    "this bot can perform the following commands\n -/start \n -/help \n -/AddNewCompany"
  );
});
// const secretPath = `/telegraf/${bot.secretPathComponent()}`;
// app.use(bot.webhookCallback(secretPath));
const stage = new Stage([add_company], { default: "add_company" }); // Scene registration
bot.use(session());
bot.use(stage.middleware());

bot.launch();
// module.exports = bot;

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
