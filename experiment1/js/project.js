// project.js - A generative recipe machine
// Author: Scott Miller
// Date: 4-7-2025

// Recipe Generator Class
class RecipeGenerator {
  constructor() {
    this.fillers = {
      chef: ["Chef", "Food Person", "Soup Master", "Food Lord", "Culinary Beast", "Fool", "Yo, you"],
      intro: ["listen here", "brace yourself", "take notes", "ignore all instincts and prepare"],
      utensil: ["spatula", "cauldron", "plastic fork", "blender", "whisk", "bare hands", "tiny spoon"],
      ingredient: ["onion", "banana", "pickle juice", "instant ramen", "ketchup", "meat of some kind", "sawdust", "marshmallow fluff", "protein powder", "expired yogurt"],
      action: ["smoosh", "gently massage", "incinerate", "destroy", "politely mix", "stare at", "overcook", "dance with", "sit on"],
      dish: ["casserole", "stew", "breakfast taco", "smoothie", "suspicious pie", "pizza", "lasagna"],
      time: ["2 minutes", "an hour", "exactly 42 seconds", "... however long you feel like it", "a day"],
      outcome: ["instant regret", "wonderful tastes", "a new favorite dish", "an explosion", "a trip to the ER", "happiness"]
    };

    this.template = `
<p>$chef, $intro for the art of cooking.</p>

<p>Step 1: Take your $utensil and $action the $ingredient.</p>

<p>Step 2: Add some $ingredient to the mix, then let it sit for $time.</p>

<p>Step 3: Finally, put your $dish on a plate and get ready to eat!</p>

<p>Outcome? Expect $outcome. Bon appetit (...right)?</p>
`;
  }

  replacer(match, name) {
    const options = this.fillers[name];
    return options
      ? options[Math.floor(Math.random() * options.length)]
      : `<UNKNOWN:${name}>`;
  }

  generate() {
    const slotPattern = /\$(\w+)/;
    let story = this.template;

    while (story.match(slotPattern)) {
      story = story.replace(slotPattern, match => this.replacer(match, match.slice(1)));
    }

    $("#box").html(story);
  }
}

function main() {
  const generator = new RecipeGenerator();
  $("#clicker").click(() => generator.generate());
  generator.generate();
}

main();
