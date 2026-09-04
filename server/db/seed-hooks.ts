import { db, initDatabase } from "./database.js";
import crypto from "crypto";

const SEED_HOOKS = [
  // EDUCATIONAL
  { category: "Educational", template: "This represents your {X} before, during, and after {X}", source_url: "https://www.instagram.com/p/C-ta_pvhfvK/" },
  { category: "Educational", template: "Here’s exactly how much {insert action/item} you need to {insert result}", source_url: "https://www.instagram.com/reel/C9vqgHxuz1E/" },
  { category: "Educational", template: "Can you tell us how to {insert result} in 60 seconds?", source_url: "https://www.instagram.com/p/C8dJXv1PjzF/" },
  { category: "Educational", template: "This is what {insert thing} looks like when you’re {insert action}. And this is what they look like when you’re not.", source_url: "https://www.instagram.com/reel/C4tAzeYL8yA/" },
  { category: "Educational", template: "I’m going to tell you how to get {insert result}, {insert mind blowing method}.", source_url: "https://www.instagram.com/p/C7WV9_TI5dT/" },
  { category: "Educational", template: "It took me 10 years to learn this but I’ll teach it to you in less than 1 minute.", source_url: "https://www.instagram.com/p/C-sSyDpoyMX/" },
  { category: "Educational", template: "When you get {insert item/result} here are the {number} things you got to do right away.", source_url: "https://www.instagram.com/p/C9bUq2CtvUv/" },
  { category: "Educational", template: "If you don’t have {insert item/action}, do {insert item/action}.", source_url: "https://www.instagram.com/p/C8rJipAy8I8/" },
  { category: "Educational", template: "My money rules as a {insert description} working towards financial independence.", source_url: "https://www.instagram.com/p/C_-u411xe4m/" },
  { category: "Educational", template: "Money can buy you {insert item} but it can not buy you {insert result}.", source_url: "https://www.instagram.com/p/DBkvHncxD2t/" },
  { category: "Educational", template: "Here's how to develop a {insert skill} so strong that you physically can't stop {doing skill}.", source_url: "https://www.instagram.com/reel/C-CPzwMReyb/" },
  { category: "Educational", template: "If I woke up {insert pain point} tomorrow, and wanted to {insert dream result} by {insert time} here’s exactly what I would do.", source_url: "https://www.instagram.com/p/DGOZZYhS1cj/" },
  { category: "Educational", template: "If you're a {insert target audience} and you want {insert dream result} by {insert avenue} then listen to this video.", source_url: "https://www.instagram.com/reel/DE9tW4dyxlJ/" },
  { category: "Educational", template: "3 YouTube channels that will teach you more than any {insert industry/niche} degree.", source_url: "https://www.instagram.com/p/DBfqo-0zxTb/" },
  { category: "Educational", template: "I think I just found the biggest {insert niche/industry} cheat code.", source_url: "https://www.instagram.com/p/DB6kCMQR0oX/" },
  { category: "Educational", template: "Everyone tells you to {insert action} but nobody actually tells you how to do it. Here is a {number} second step by step tutorial.", source_url: "https://www.instagram.com/reel/DC2pqKUpy7C/" },
  { category: "Educational", template: "If I were starting over in my {insert age range} with no {insert item} here are the top {number} things I would do to {insert dream result}.", source_url: "https://www.tiktok.com/t/ZT2MLqDUQ/" },
  { category: "Educational", template: "Here are some slightly unethical {insert industry/niche} hacks that you should know if you're {insert target audience}.", source_url: "https://www.instagram.com/reel/C-8RO71JxRv/" },
  { category: "Educational", template: "This is harder than getting into Harvard.", source_url: "https://www.instagram.com/p/DFNdSUruSOQ/" },
  { category: "Educational", template: "This is why no one remembers you.", source_url: "https://www.instagram.com/p/DFaQuJYueF1/" },

  // COMPARISON
  { category: "Comparison", template: "This is an {insert noun}, and this is an {insert noun}.", source_url: "https://www.instagram.com/p/DHiMzqvR_MQ/" },
  { category: "Comparison", template: "This {insert noun} and this {insert noun} have the same amount of {insert metric}.", source_url: "https://www.instagram.com/fitfoodieliving/reel/DBHpSdgRdvh/" },
  { category: "Comparison", template: "A lot of people ask me what's better: {option 1} or {option 2} for {dream result}. I achieved {dream result} doing one of these and it's not even close.", source_url: "https://www.instagram.com/p/DHGn-H-xNeV/" },
  { category: "Comparison", template: "For this {insert item} you could have all of these {insert item}.", source_url: "https://www.instagram.com/reel/C27sCLIxGIu/" },
  { category: "Comparison", template: "This group didn't {insert action} and this group did.", source_url: "https://www.instagram.com/reel/C9wOIgSJZG1/" },
  { category: "Comparison", template: "This is {insert noun} before you {insert action}, this is {insert noun} after you {insert action}.", source_url: "https://www.instagram.com/p/DDfEcIyTncw/" },
  { category: "Comparison", template: "Both these {insert noun} are exactly the same. But this one is {metric} and this one is {metric}.", source_url: "https://www.instagram.com/p/DB67qDIih-2/" },
  { category: "Comparison", template: "Cheap vs. Expensive {insert noun}.", source_url: "https://www.instagram.com/reel/DFXKXBaPyn0/" },

  // MYTH BUSTING
  { category: "Myth Busting", template: "This is why doing {insert action} actually makes you {insert pain point}.", source_url: "https://www.instagram.com/p/C8BpxhQNKCj/" },
  { category: "Myth Busting", template: "If you're really a {insert dream result}, why aren’t you doing {insert common belief}?", source_url: "https://www.instagram.com/reel/DEPpiQkobO7/" },
  { category: "Myth Busting", template: "Just because you do {insert action} doesn't make you a good {insert label}.", source_url: "https://www.instagram.com/reel/DHrRQ2uv22F/" },
  { category: "Myth Busting", template: "They said, '{insert famous cliché or quote}'. That's a lie.", source_url: "https://www.instagram.com/reel/DDmm7AXxKLa/" },
  { category: "Myth Busting", template: "More {insert target audience} need to hear this: {insert common belief} will not {insert result}.", source_url: "https://www.instagram.com/reel/C_oaRbkuJaG/" },
  { category: "Myth Busting", template: "You are not bad at {insert action}, you probably were just never taught how to {insert action}.", source_url: "https://www.instagram.com/p/DHYuMQYp0Kv/"},
  { category: "Myth Busting", template: "There is absolutely no reason for you to be {insert pain point} every single day just because you are trying to {insert dream result}.", source_url: "https://www.instagram.com/p/DHaw56FzsOe/" },

  // STORYTELLING
  { category: "Storytelling", template: "I started my {insert business} when I was {insert age} with ${insert amount}.", source_url: "https://www.instagram.com/p/C9GHw6MO48j/" },
  { category: "Storytelling", template: "{number} years ago my {insert person} told me '{insert quote}'.", source_url: "https://www.instagram.com/p/C84meBcM9NB/" },
  { category: "Storytelling", template: "I don’t have a backup plan so this kind of needs to work...", source_url: "https://www.instagram.com/p/C7XpT7tPwCP/" },
  { category: "Storytelling", template: "In {insert time}, I went from {insert before state} to {insert after state}.", source_url: "https://www.instagram.com/reel/DFfnKFWusVf/" },
  { category: "Storytelling", template: "This is probably the scariest thing I have ever done.", source_url: "https://www.instagram.com/reel/DAYtnokvm-J/" },
  { category: "Storytelling", template: "I did everything right. And I still failed.", source_url: "https://www.instagram.com/p/DDohj4MI-7U/" },
  { category: "Storytelling", template: "{number} months into my {insert action}, my worst nightmare became my reality.", source_url: "https://www.instagram.com/p/DETO9Z0u5cN/" },
  { category: "Storytelling", template: "I am leaving my ${insert salary} dream job at {insert company} to {insert action}.", source_url: "https://www.instagram.com/p/DH542doMca8/" },
  { category: "Storytelling", template: "I developed an addiction to {insert thing} so strong I physically cannot stop {doing action}.", source_url: "https://www.instagram.com/reel/C-CPzwMReyb/" },
  { category: "Storytelling", template: "I damaged a customer's property and here’s how I handled it.", source_url: "https://www.instagram.com/reel/DI8xeTdOCGp/" },

  // AUTHORITY
  { category: "Authority", template: "My {insert metric} used to look like this and now they look like this.", source_url: "https://www.instagram.com/reel/DE7cjKBNcY4/" },
  { category: "Authority", template: "10 YEARS it took me from {insert before state} to {insert after state}.", source_url: "https://www.instagram.com/p/C8Cpii4PB1u/" },
  { category: "Authority", template: "Just {number} {insert items/actions} took my client from {insert before} to {insert after}.", source_url: "https://www.instagram.com/p/C9XVmDQS2z-/" },
  { category: "Authority", template: "In {year} my business made ${insert dollar amount}. Here is the exact breakdown.", source_url: "https://www.instagram.com/p/DEhk6r4ydum/" },
  { category: "Authority", template: "Nobody believes me if I say I went from this to this completely natural.", source_url: "https://www.instagram.com/p/DIL_hAYIF-z/" },
  { category: "Authority", template: "How I took this client from 0 to {number} of {metric} in 1 week.", source_url: "https://www.instagram.com/p/DIMxxBuP23X/" },

  // DAY IN THE LIFE
  { category: "Day in the Life", template: "We all have the same 24 hours in a day so here I am putting my 24 hours to work.", source_url: "https://www.instagram.com/reel/DAq-UDcITU5/" },
  { category: "Day in the Life", template: "Day 1 of starting over my whole entire life.", source_url: "https://www.instagram.com/reel/DEc3jW6p1Ws/" },
  { category: "Day in the Life", template: "Welcome back to the day in the life of two {insert label} trying to build the next {insert business}.", source_url: "https://www.instagram.com/p/DEnSkHQJwIx/" },
  { category: "Day in the Life", template: "Come with me to earn ${amount} per day with {insert avenue}.", source_url: "https://www.instagram.com/reel/DHXVJGsRKa1/" },
  { category: "Day in the Life", template: "Day in the life of a future millionaire.", source_url: "https://www.instagram.com/reel/DF1Kq5CuULS/" }
];

async function seed() {
  initDatabase();
  console.log("[Seed] Seeding viral hooks into database...");

  const check = db.prepare("SELECT COUNT(*) as count FROM hooks").get() as { count: number };
  if (check.count > 0) {
    console.log(`[Seed] Hooks table already contains ${check.count} hooks. Skipping duplication.`);
    return;
  }

  const insert = db.prepare(`
    INSERT INTO hooks (id, category, template, example, source_url, tags)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((hooksList: typeof SEED_HOOKS) => {
    for (const item of hooksList) {
      const id = "hook_" + crypto.randomUUID().slice(0, 8);
      const tags = JSON.stringify([item.category.toLowerCase(), "proven_viral", "swipe_file"]);
      insert.run(id, item.category, item.template, item.template, item.source_url, tags);
    }
  });

  insertMany(SEED_HOOKS);
  console.log(`[Seed] Successfully seeded ${SEED_HOOKS.length} proven viral hooks!`);
}

seed().catch(err => {
  console.error("[Seed] Error seeding hooks:", err);
  process.exit(1);
});
