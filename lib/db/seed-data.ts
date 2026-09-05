export const SEED_PASSWORD = "SeedPass1!";

function unsplash(photoId: string, width = 1600) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

export type SeedPost = {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  coverImage: string;
  featured?: boolean;
  daysAgo: number;
};

export type SeedAuthor = {
  username: string;
  name: string;
  email: string;
  image: string;
  posts: SeedPost[];
};

export const SEED_AUTHORS: SeedAuthor[] = [
  {
    username: "mira",
    name: "Mira Chen",
    email: "mira@blogly.dev",
    image: unsplash("photo-1438761681033-6461ffad8d80", 400),
    posts: [
      {
        title: "The city that taught me how to look",
        excerpt:
          "I moved for work and stayed because the streets kept giving me sentences I had not earned yet. Looking, it turns out, is a practice you can learn from pavement.",
        coverImage: unsplash("photo-1449824913935-59a10b8d2000"),
        tags: ["#cities", "#attention", "#essays"],
        featured: true,
        daysAgo: 18,
        content: `I used to think looking was something that happened to you. You opened your eyes and the world arrived, already arranged, already named. Then I moved to a city I did not love and the world refused to arrive that way.

The first months were a blur of errands. I learned the grocery store before I learned the river. I learned which subway stairs smelled like rain and which ones smelled like fried oil. I could have lived there for years and still been a tourist of my own days.

What changed was not a revelation. It was a route. I started walking the long way home from the library, not because I had extra time, but because the short way had become a tunnel. Same bodega, same scaffolding, same man selling mangoes from a cart that never seemed to move. The long way had a bakery with a window full of unfrosted cakes, a block of houses with stoops too narrow for two people, and a vacant lot where someone had planted sunflowers in a stolen shopping cart.

I began to keep a list in the back of a receipt. Not a journal. A list of things that had edges: a dog with one white paw, a mural that had been painted over except for a single yellow bird, the particular green of the pharmacy awning after a storm. The list did not make me wiser. It made the city stop being a backdrop.

People talk about flânerie as if it were a personality. I think it is closer to a muscle. You use it or the city uses you. On the days I walked with headphones, the streets flattened into a corridor between tasks. On the days I walked without them, even the ugly parts had a kind of grammar. A delivery truck blocking the crosswalk was not an inconvenience so much as a sentence with too many clauses.

I am not arguing for romance. Cities are loud and unfair and they will take your attention if you do not decide where to put it. What I am arguing for is a slower kind of greed. The greed of wanting the block to be particular. The greed of refusing to let a place become only the time it takes to cross it.

There is a corner near my apartment where the light hits a brick wall at 4:17 in October and nowhere else. I know this because I missed it twice and then I started leaving the office twelve minutes earlier. That is a ridiculous thing to organize a life around. It is also the first time the city felt like it was speaking back.

Looking, I have learned, is not the same as seeing. Seeing is accidental. Looking is a decision you keep making after the novelty wears off. The city taught me that by being too large to finish. There is always another street. There is always a window you have not stood in front of yet. The work is not to collect them. The work is to remain available.

I still get the groceries on the short way. I still put on headphones when the day has already asked enough. But I keep the long way in my pocket like a key. When I use it, the city is not prettier. It is simply more there. And being there, it turns out, is the whole assignment.`,
      },
      {
        title: "A notebook is not a second brain",
        excerpt:
          "I tried to outsource my thinking to apps, tags, and a cathedral of linked notes. The page that actually changed my work was the one I could lose on a bus.",
        coverImage: unsplash("photo-1455390582262-044cdead277a"),
        tags: ["#writing", "#notebooks", "#craft"],
        daysAgo: 41,
        content: `For two years I maintained a second brain. That is what the essays called it. A vault of notes, tagged and backlinked, a garden I was supposed to wander through whenever I needed an idea. I had capture inboxes and weekly reviews and a graph that looked, if you squinted, like intelligence.

What I actually had was a museum of thoughts I never returned to. The notes were well-dressed and lonely. I would open the graph, feel a brief pride, and then go write in a cheap notebook because the graph did not want a sentence. It wanted a system.

A notebook, the paper kind, is a terrible database. It cannot search. It cannot remind you. It will not surface a quote from March when you need it in November. That used to feel like a flaw. Now it feels like the point.

When I write in a notebook, I am forced to decide what is worth the ink. The page does not expand. My handwriting gets worse when I am excited and smaller when I am unsure. There is a physical record of hesitation that no markdown file can keep. Later, when I reread it, I do not just retrieve a thought. I retrieve the weather of the thought.

I am not against tools. I still keep dates and drafts on a computer because computers are good at not losing things. But I stopped asking software to think on my behalf. Thinking, for me, happens in the ugly middle of a paragraph, when I do not know the next word and the notebook has no autocomplete to offer. That stall is the work. A second brain is often a way to skip the stall.

There is also the matter of privacy. A notebook you can lose on a bus is a notebook you can be honest in. I write worse when I imagine an audience, even an audience of future-me with a search bar. The paper page is slightly embarrassing, which is useful. Embarrassment is a filter. It keeps the performance out.

People ask how I organize it. I do not, not really. I date the top of the page. I copy a sentence I like into the next notebook when I start a new one. The rest is allowed to remain a pile. If an idea is important, it will bother me until I write it again, better, in a different room. Recurrence is a better ranking algorithm than any tag I ever invented.

I used to fear forgetting. I treated memory like a leaking roof. Now I think forgetting is part of how an idea earns its keep. The notes that survive the walk home, the shower, the week of not opening the book — those are the notes that wanted to be essays. The rest were just me being busy with myself.

A notebook is not a second brain. It is a first conversation. It is slower, ruder, and less impressive than a knowledge graph. It also, inconveniently, is where my actual writing still begins. I open the cheap book. I write a line that is not ready. I stay there long enough for the line to disagree with me. That disagreement is thinking. No app has learned how to host it yet.`,
      },
      {
        title: "What remains after you leave a neighborhood",
        excerpt:
          "I packed the books and the good pan and still found myself missing a laundry cycle, a particular sidewalk tree, and the woman who sold flowers that were always almost dead.",
        coverImage: unsplash("photo-1477959858617-67f85cf4f1df"),
        tags: ["#place", "#memory", "#home"],
        daysAgo: 62,
        content: `When people leave a neighborhood they talk about the restaurants. I did too, at first. There was a dumpling place with a line that meant the broth was honest, and a bar where the bartender remembered that I did not want ice. Those are easy losses. You can put them on a list. You can even go back.

What remains is smaller and harder to visit.

I miss the laundry room in the basement that smelled like hot metal and someone else's detergent. I miss the ten minutes of waiting for a dryer, leaning against a machine that vibrated through my coat, reading the community board where the same piano teacher had posted the same flyer for three years. I miss knowing which stairwell door stuck in August.

A neighborhood is not a collection of amenities. It is a set of repetitions you did not choose and then came to need. The tree on the corner that dropped sticky fruit onto the sidewalk every June. The bus driver who opened the door a second time if he saw you running. The woman with the flower cart whose roses were always a day past their best and who would still tell you they would last the week.

I did not know I was attached to any of this until the moving truck was already in the street. Attachment, in cities, often disguises itself as annoyance. You complain about the fruit. You complain about the dryer that eats quarters. Then you live somewhere with a quieter basement and a cleaner sidewalk and you find that your days have lost a kind of friction that was, it turns out, a form of company.

I have a theory that we do not miss places so much as we miss being known by them. Not known in the social media sense. Known in the sense that the deli man started making the sandwich before you finished ordering. Known in the sense that the building super knocked in a particular pattern. Known in the sense that your body had a map of the block that did not require looking at a phone.

After I left, I went back once. The dumpling place had a new awning. The tree had been cut down to a stump with a little iron fence around it, as if the absence needed protecting. The flower woman was gone. I stood on the corner and tried to feel the old neighborhood, and what I felt was a polite version of it, like a museum replica. The repetitions had continued without me. That is the correct order of things. It still stung.

What remains, then, is not the street. It is a set of gestures my body still makes. I still walk toward the old subway entrance when I am tired. I still expect the sticky fruit in June, even in a city that does not grow it. I still buy flowers that are a little too far gone, because that is what a good week used to look like.

I do not think we should freeze neighborhoods in amber. People need to leave. Rents rise. Lives change. The honest thing is to admit that some of what we call home is just a choreography we learned by accident, and that when the choreography ends, we keep dancing a few steps in the new kitchen, looking a little foolish, and also a little loyal.

If you are about to leave a place, take a walk that is not for errands. Notice the ugly parts. They are the ones that will follow you. The beautiful parts you can find again. The stuck door, the almost-dead roses, the dryer that hummed through your coat — those are the souvenirs that do not fit in a box.`,
      },
      {
        title: "On reading slowly in a loud century",
        excerpt:
          "Speed-reading was a party trick. The books that changed me were the ones I had to put down, walk around the room, and return to as if they were a person I had interrupted.",
        coverImage: unsplash("photo-1481627834876-b7833e8f5570"),
        tags: ["#reading", "#attention", "#books"],
        daysAgo: 87,
        content: `I used to finish books the way some people finish meals: efficiently, with a kind of pride in the empty plate. I could tell you how many I read in a year. I had a spreadsheet. The spreadsheet was not a reader. It was a scoreboard.

The century is loud, and it rewards the scoreboard. There is always another tab, another summary, another person who has already processed the book into five takeaways and a joke. I have used those takeaways. They are useful in the way a postcard is useful. They prove you went somewhere. They do not prove you stayed.

Slow reading began for me as a failure. I hit a novel that would not yield to speed. Every time I tried to hurry, the sentences went slippery. I put the book down and felt irritated, as if the author had been rude. Then I did something I had not done since school. I read a page twice. The second time, a character I had treated as furniture turned out to be the point.

There is a humility in not getting it the first time. Our tools are built to erase that humility. Autoplay, infinite scroll, the little animation that congratulates you for finishing. I am not against any of this in the abstract. I am against the way it trained me to treat difficulty as a defect in the text rather than a demand on my attention.

When I read slowly now, I do it with a pencil, not because I am a scholar, but because the pencil makes me late. I underline a phrase and the delay is the whole method. I walk around the room. I let a paragraph become a mood. Sometimes I copy a sentence into the notebook just to feel the words in my hand, which is a different knowledge than recognizing them with my eyes.

People worry that slow reading is elitist, a luxury of people with quiet houses. I have read slowly on a crowded train. The point is not the furniture. The point is refusing to skim a mind that spent years arriving at a page. Most books are not sacred. A few are. You find out which by giving them more time than they can immediately repay.

I still read fast when the book is a tool. A manual should be fast. A recipe should be fast. An essay about a life, or a city, or the inside of someone else's grief — that should cost you something. If it does not cost you an afternoon, it will not stay.

There is a sentence I have been sitting with for months, from a writer who is no longer alive to explain it. I have not tweeted it. I have not filed it under a tag. I just keep meeting it, the way you keep meeting a neighbor in the stairwell until one of you finally says a real thing. That is what slow reading is: remaining in the stairwell.

A loud century will not stop being loud because I turned a page more carefully. But the page can still be a small room. In that room, I am not a consumer of content. I am a person being addressed. I would like to remain addressable. The spreadsheet never asked me to be.`,
      },
    ],
  },
  {
    username: "julian",
    name: "Julian Okonkwo",
    email: "julian@blogly.dev",
    image: unsplash("photo-1500648767791-00dcc994a43e", 400),
    posts: [
      {
        title: "The first meal that made me stay",
        excerpt:
          "I had a ticket home and a bowl of pepper soup that refused to be a stopover. Some dinners are logistics. This one was an argument for remaining.",
        coverImage: unsplash("photo-1504674900247-0877df9cc836"),
        tags: ["#food", "#memory", "#travel"],
        featured: true,
        daysAgo: 11,
        content: `I did not mean to stay in that city. I had a return ticket folded in the front of my notebook and a list of places I was supposed to see, which is another way of saying I was passing through with an itinerary for proof.

The meal that ruined the itinerary was not famous. There was no line, no camera-facing plating, no story on the menu about a grandmother. There was a plastic table on a sidewalk that was more oil stain than sidewalk, a woman with a pot the size of a drum, and a heat that made my eyes water before I had tasted anything.

Pepper soup. Goat, I think, though I would not have argued with her if she had said otherwise. The broth was the color of late afternoon and it tasted like someone had decided that comfort and danger should share a bowl. I burned my mouth and then I burned it again. A man at the next table laughed without looking at me, which is the kindest kind of welcome: you are here, you are not special, keep eating.

I had been traveling in a way that made every meal a photograph. This one refused. My phone felt rude. The woman refilled the bowl without asking, then set down a bottle of malt and a look that said I should stop pretending I was in a hurry. I was in a hurry. I had a museum to see and a train to consider. The soup did not care.

What made me stay was not the spice, or not only the spice. It was the feeling that the city had a private life that did not require my review. I had been collecting experiences as if they were stamps. The pot on the sidewalk was not an experience. It was a Tuesday for everyone else. Being allowed to sit inside someone else's Tuesday is a rare permission. I did not want to cash it in for a postcard.

I went back the next night. The woman nodded as if I had finally understood the assignment. I learned the names of two other regulars by accident, which is how you learn anything that matters. I learned that the soup was hotter on Thursdays because the market fish had not come in and she was in a mood. I learned that staying is often just returning to the same table until the table starts returning you.

People ask for the name of the place. I could give it, but the name is not the point, and anyway it may have moved. The point is that a meal can change the scale of a trip. Before that bowl, the city was a list. After it, the city was a set of hours I wanted more of. I cancelled the ticket. I found a room with a window that faced a wall. I ate the soup until I could tell, without looking, when she had added extra scent leaf.

I still cook a version of it at home, and it is never right, which is also right. A copied recipe is a letter to a place. The original was a conversation. I burn my mouth on purpose sometimes, to remember that I was not a visitor that night. I was a person with a bowl, sitting still long enough to be kept.`,
      },
      {
        title: "Markets as a kind of map",
        excerpt:
          "Skip the monument. Walk the market until you know what is in season, who is arguing, and which stall would feed you if you lived here instead of passing through.",
        coverImage: unsplash("photo-1488459716781-31db52582fe9"),
        tags: ["#markets", "#travel", "#food"],
        daysAgo: 29,
        content: `If I have one afternoon in a city I have not been to, I do not go to the monument. I go to the market. The monument will still be there, performing the past. The market is the present tense, and it will tell you more about a place than any bronze horse.

A good market is a map you can eat. The first thing I look for is not the photogenic pile of spices. I look for what is cheap and abundant. That is the season. Tomatoes stacked without tenderness mean it is their moment. A single expensive mango on a cloth means it is not. You can learn a climate in ten minutes this way.

Then I listen. Markets have a pitch. In some cities it is a bright bargaining, almost musical. In others it is a low, practical murmur, as if everyone has already agreed on the price and is only confirming. The pitch tells you how strangers are supposed to behave. I try to match it. There is no faster way to look like a fool than to perform the wrong kind of haggle.

I buy something I do not need. A handful of herbs I cannot name. A pastry that will fall apart in my bag. A small knife that will never make it through customs in my carry-on, so I leave it with the hotel desk and feel briefly like a person with a kitchen. The purchase is a ticket into a conversation. Once you have paid, you are allowed to ask what to do with the herbs. Once you have asked, you are no longer only a camera.

The best stalls are rarely the cleanest. I learned this the slow way, by getting sick once and then, later, by getting fed by the stall that looked like a dare. Cleanliness in a market is not the same as care. Care looks like a woman sorting chilies with a speed that is a form of respect. Care looks like ice that is actually ice, not a rumor of ice. Care looks like the same customers coming back, which you can see if you stand still long enough to watch the traffic of bags.

I use markets to decide where I will eat at night. If the fish is bright in the morning, I look for a place that will cook it simply in the evening. If the bread is gone by ten, I know the city takes breakfast seriously. If there are more plastic-wrapped imports than local greens, I adjust my expectations and also my sadness. A market is honest about what a place can afford to grow and what it has to fetch from elsewhere.

There is a cruelty in this, I know. I get to stroll through other people's livelihoods with a notebook. I try to pay for that privilege with attention instead of just cash. I learn a few words for weights. I do not touch the fruit unless invited. I do not take photos of faces without the kind of hello that could become a no.

When I leave, I write down the prices. Not because I will remember them accurately, but because prices are a diary of a week in a place. Eggs, onions, a bottle of oil, a handful of the herb I still cannot name. Months later, those numbers bring back the heat and the argument at the next stall more clearly than my photographs of the monument.

A map shows you how to get across a city. A market shows you how the city feeds itself. I know which one I trust when I am trying to understand where I am.`,
      },
      {
        title: "How to cook for one without making it a ritual of loneliness",
        excerpt:
          "A single plate can be an apology or a small ceremony. The difference is whether you set the table for a person who happens to be yourself.",
        coverImage: unsplash("photo-1556910103-1c02745aae4d"),
        tags: ["#cooking", "#solitude", "#kitchens"],
        daysAgo: 54,
        content: `Cooking for one has a reputation for being either sad or optimized. Sad is the yogurt in the doorway of the fridge. Optimized is the protein measured to the gram, eaten over the sink. I have done both. Neither is dinner.

Dinner, even alone, is a pause you offer a body. The pause does not have to be fancy. It has to be real enough that you sit down.

I keep a few rules, and I break them whenever they become a performance.

Use a plate. Not every night, but often enough that the meal does not feel like a secret. A plate says the food was intended. I have eaten excellent leftovers from a storage container and still felt like a person camping in my own apartment. The plate is not etiquette. It is a boundary between the day and the meal.

Cook a little more than you need, but not so much that the week becomes a museum of the same stew. The sweet spot is tomorrow's lunch, not next Thursday's obligation. Loneliness loves a fridge full of identical boxes. Company, even your own, likes a small variation: an egg on top, a different green, a squeeze of lemon you did not use the night before.

Talk to the pan. I mean this literally and without embarrassment. A kitchen is too quiet if the only sound is the extractor fan. I name what I am doing. I swear at the garlic when it goes too far. This is not madness. This is how cooks have always stayed present. Silence is where the mind starts reciting the day's unfinished conversations.

I also keep one ingredient that feels like a guest. A good olive oil. A chile crisp. A piece of cheese that is slightly too expensive for a Tuesday. Used sparingly, it changes the temperature of the meal. You are not splurging. You are refusing to treat yourself as an afterthought.

There are nights when I do not cook, and I try not to moralize them. A sandwich can be a ceremony if you cut it on the diagonal and sit by the window. The loneliness ritual is not takeout. The loneliness ritual is eating as if you are in the way of your own life.

When I was first alone in a new city, I cooked as if someone might come over and inspect the evidence. Too many pans. Too much garnish. It was hospitality with no guest, which is just anxiety in an apron. Now I cook toward the person I will be in an hour, who will be tired and hungry and deserving of a bowl that tastes like someone cared. That someone is me. It is an awkward sentence and also an accurate one.

If you want a practical starting point: put on water for something. Rice, eggs, tea, pasta. Water coming to a boil is a clock that is kinder than a phone. While it heats, wash a handful of greens or slice whatever is threatening to die in the crisper. You will have a meal before you have had time to decide you are a person who does not cook for one.

Set the table for a person who happens to be yourself. Then eat like you meant to be there.`,
      },
      {
        title: "The long way home through a kitchen",
        excerpt:
          "My mother's stew had a map in it: who had visited, who was broke, who needed to be forgiven. I am still learning to cook the version that includes me.",
        coverImage: unsplash("photo-1414235077428-338989a2e8c0"),
        tags: ["#family", "#stew", "#home"],
        daysAgo: 76,
        content: `There are recipes that are instructions and recipes that are letters. My mother's stew was a letter. It never tasted the same twice, not because she was careless, but because the pot was a place where the week went to be made edible.

If a cousin had visited, there was more meat. If money was tight, there were more tomatoes and a kind of bravery with spices. If someone in the house had been forgiven, the stew was sweeter. I did not know I was reading all of this as a child. I only knew that some nights the kitchen smelled like a holiday and some nights it smelled like a lecture.

I left home and tried to copy the stew from memory, which is like trying to copy a handwriting you only ever saw in motion. I called her for the steps. She laughed. There were no steps. There was a sequence of attentions: brown the meat until it smells like the beginning, not the end; let the onions go further than you think; do not rush the moment when the oil comes back red. Then she would change the subject to someone I had not asked about, because the stew was never only about the stew.

Cooking it now, years later and several cities away, I understand the letter better. A pot on the stove is a way of saying: we are still a we, even if the we is just me and the people I am feeding in my head. I put on her music. I use too many tomatoes. I stand there longer than a recipe would require, because the long way is the point.

People like to turn immigrant kitchens into a genre: the fragrant apartment, the aunties, the secret spice blend. Some of that is true and some of it is a postcard other people enjoy holding. The true part, for me, is more ordinary. It is the sound of a wooden spoon against enamel. It is the decision to cook something that takes longer than hunger, so that hunger has to wait and become patience, and patience becomes a kind of love.

I have made the stew for friends who did not grow up with it. They ask what is in it. I give them a list and watch it fail to explain the taste. The taste includes a kitchen I cannot take them to. That is fine. They do not need the whole letter. They need a good bowl and a second helping, which is its own correspondence.

Sometimes I add things she would not have used: a splash of vinegar, a handful of herbs from a market in a country she has never seen. I used to feel guilty about this, as if I were editing a document I did not author. Now I think this is how a recipe stays alive. It travels. It picks up the accent of the new stove. It still begins with onions going further than you think.

The long way home is not a flight. It is a pot you tend until the apartment smells like a place you have been before. I eat standing up the first night, because I cannot wait, and then I eat properly the second night, because leftover stew is the part of the letter that was written for tomorrow.

I still cannot make it taste exactly like hers. I have stopped trying to win that game. The game is not accuracy. The game is continuing the sentence.`,
      },
    ],
  },
  {
    username: "elena",
    name: "Elena Voss",
    email: "elena@blogly.dev",
    image: unsplash("photo-1544005313-94ddf0286df2", 400),
    posts: [
      {
        title: "The hour before the birds start",
        excerpt:
          "Dawn is not a metaphor if you actually get up for it. It is a working hour with its own employees: dew, a fox, the first robin rehearsing the day.",
        coverImage: unsplash("photo-1470252649378-9c29740c9fa8"),
        tags: ["#dawn", "#birds", "#nature"],
        featured: true,
        daysAgo: 7,
        content: `I started getting up before the birds because I could not sleep, which is a poor spiritual origin story. There was no pilgrimage. There was a kitchen window, a cheap thermos, and a restlessness that made the bed feel like a wrong sentence.

The hour before the chorus is a different country. The light is not gold, not yet. It is a kind of withheld gray, as if the day is still deciding whether to go through with it. If you go outside then, you can hear how much noise we usually live inside. The road has not remembered itself. The houses are still holding their breath.

The first bird is rarely the famous one. In my neighborhood it is a robin that sounds like it is clearing its throat. Then a wren, too large a voice for the body it comes from. Then, if I have walked as far as the creek, the red-winged blackbirds start their electric arguments in the reeds. By the time the sun is actually up, the hour has already been spent. Most people meet the day in its second draft.

I do not go out to be improved. Dawn is often cold and my coffee is often worse for having been made in the dark. What I go out for is a version of the world that has not been fully staffed yet. You can see the fox if you are lucky and still, which is a combination I am still practicing. You can see which gardens were watered and which were only intended. You can see your own breath and be surprised, every time, that you are a mammal.

There is a fashion for talking about nature as a wellness product. I distrust it, even as I benefit from the walk. The creek does not care about my nervous system. The birds are not a soundtrack. They are working: claiming, warning, finding, announcing that a particular hedge is taken. If I am calmed by that, it is because their work is not mine. It is a relief to stand next to a purpose that does not include me.

I have learned a few practical things. Wear the ugly jacket. Do not bring the phone unless you need the flashlight, and then put it away before you start using it as a window. Walk the same loop often enough that the changes become visible: a new nest, a fallen limb, the week the creek smells like iron. Novelty is overrated. Return is how a place becomes a teacher.

Some mornings nothing happens, which is also data. A quiet dawn is not a failed one. It is the hour doing its job without a show. I go home and make a second coffee that tastes like a person who is awake. The birds, by then, are in full employment. I listen from the kitchen and try not to translate them into advice.

If you can spare it, give that hour to something that does not need your performance. A street, a field, a window if the street is not safe. The day will get loud soon enough. There is a brief window when it is still an animal. I like to meet it then, before we both put on our names.`,
      },
      {
        title: "A field guide to ordinary weather",
        excerpt:
          "We treat weather as small talk because it is the one subject that is always happening to all of us. That does not make it small. It makes it shared.",
        coverImage: unsplash("photo-1501785888041-af3ef285b470"),
        tags: ["#weather", "#seasons", "#noticing"],
        daysAgo: 24,
        content: `I used to apologize for talking about the weather, as if it were a failure of imagination. Then I lived through a summer that smelled like smoke three states away, and a winter that forgot how to freeze, and I stopped apologizing.

Weather is the plot we are all inside. We pretend it is small talk because naming it is one of the last public intimacies we have. You can say “the wind today” to a stranger and both of you will have a body that agrees.

A field guide to ordinary weather would not begin with disasters, though disasters are no longer rare enough to be called exceptions. It would begin with the days that do not make the news. The slightly too-warm Tuesday in February. The rain that cannot decide whether it is a mist or a commitment. The afternoon when the light goes metallic and your fillings, if you have them, seem to hum.

I keep a weather notebook, which sounds precious until you see how little I write. “West wind. Soil dark. First fungus on the stump.” That is a whole entry. Over a year it becomes a private almanac. I can tell you now that the stump mushrooms arrive, in this yard, about a week after the night temperatures stop dropping below a number I never used to track.

Ordinary weather is disappearing into the category of the remarkable, which is a loss even when the remarkable is beautiful. People post sunsets as if the sky had done a trick. The sky does that trick because of particles and angle. You can love it and still refuse to treat it as content. I try to watch the sunset without taking it, the way you try to listen to a friend without already composing your reply.

There are practical reasons to learn your local weather in a finer grain. Gardeners know this. So do people who walk to work. The rest of us outsourced the knowledge to an icon on a phone, which is a useful liar. The icon cannot tell you that the air has the weight of a coming storm even though the percentage is low. Your knees can. The swallows can, if you have swallows. The house can, in the way it holds heat.

I am not arguing against forecasts. I am arguing for a second opinion from the actual hour. Step outside. Smell the pavement. See whether the leaves are showing their undersides. This is not folklore as decoration. It is a set of observations that kept people from being surprised by their own lives.

When the weather is bad, I try not to call it bad until I know what it is doing. Rain is bad for the picnic and good for the roots. Wind is bad for the hat and good for the seed. This is not optimism. It is accuracy. Ordinary weather is a set of trades. We live inside the trades whether we name them or not.

If you want a place to start, pick one ordinary thing: the way your street smells after the first heat, the sound of rain on the particular bin lid outside your window, the color of the sky when snow is about to try. Write it down once. You will have begun a field guide. The century will try to make every season an emergency. Keep a record of the days that were only weather. They are still the days we have.`,
      },
      {
        title: "What a river remembers",
        excerpt:
          "A river is a historian with a terrible filing system. It keeps the shape of floods, the taste of the hills, and, more and more, whatever we throw in and call gone.",
        coverImage: unsplash("photo-1439066615861-d1af74d74000"),
        tags: ["#rivers", "#ecology", "#place"],
        daysAgo: 48,
        content: `The river I grew up beside was not famous enough to be on a postcard and not dirty enough, then, to be a cause. It was a working river. It turned a small set of mills and then, later, it turned nothing, which is its own kind of work: continuing after the reason has left.

I was told, as a child, that rivers remember. I thought this was a pretty lie, the sort of thing you say to make a kid stare at water for five more minutes. Then I learned the unpretty version. A river remembers in sediment. It remembers in the oxbow it abandoned, in the gravel bar that used to be a bank, in the chemical signature of a factory that closed before I was born and still shows up in a fish.

Memory, for a river, is not nostalgia. It is physics plus time plus whatever we have added. If you know how to look, the banks are an archive. High-water marks in the trees. Plastic in the roots, which is a new kind of leaf litter. A smell after rain that is not only rain.

I walk the same mile of it in different seasons because a single walk is a rumor. In spring the water is brown and in a hurry, carrying the hills downstream in a way you can see. In late summer it pulls back and shows its bones: shopping carts, a tire, the unexpected elegance of limestone. In winter it smokes. People take photographs of the smoke and call it magical. It is just warmer water meeting colder air, which is also a kind of magic if you do not need it to be rare.

What I love, and what troubles me, is that the river does not refuse us. It takes the runoff. It takes the extra nitrogen. It takes the weekend. It will keep taking until taking becomes a different river with the same name. Names are a human kindness. They stay after the thing has changed.

There are restoration crews now, pulling invasives, grading banks, arguing about what “original” could possibly mean. I admire the work. I also think we should be honest that we are not returning a river to a past. We are negotiating a future in which a river can still be a river: wet, moving, able to flood without being treated only as a failure of infrastructure.

I have a habit of putting a hand in, even when it is cold enough to be stupid. The shock is a way of paying attention. Water that has come from elsewhere is touching a person who will go elsewhere. That is the whole story of a watershed, reduced to skin.

If you live near a river and you do not know where it goes, that is a reasonable place to begin. Follow it on a map. Then follow it on foot as far as the fences allow. You will pass the beautiful parts and the parts behind the big-box stores, and both belong to the same sentence. A river is not a scenery. It is a system that happens to be beautiful when we have not entirely broken the grammar.

What a river remembers is not for us, exactly. It will remember the flood whether we write about it or not. The least we can do is remember the river back: the mile we have, the smell after rain, the fact that gone is not a place water believes in.`,
      },
      {
        title: "Learning the names of things",
        excerpt:
          "I used to think naming was a way of owning. Then I learned a dozen plants on one trail and the trail stopped being green stuff. It became a crowd I could greet.",
        coverImage: unsplash("photo-1465146633011-14f8e0781093"),
        tags: ["#botany", "#language", "#walking"],
        daysAgo: 93,
        content: `For a long time I walked through green as if green were a single material. Trees, bushes, that fernlike thing, that other fernlike thing. It was a kind of visual humming. Pleasant, and almost entirely without people in it, if you will allow plants to be people for the length of this sentence.

Then a friend, who is the sort of person who stops in the middle of a conversation to greet a shrub, started handing me names. Not as a quiz. As introductions. Jewelweed. Sweetfern, which is not a fern. Indian pipe, which looks like a ghost and has no chlorophyll, a fact that made me feel I had been inattentive my entire life.

I resisted at first. Naming felt like a colonial habit, a way of pinning the living to a card. Some of that suspicion is fair. Common names are a mess of history, including the ugly parts. Scientific names can sound like a locked door. And yet: without a name, I could not ask a question. I could not find out whether the ghost plant was parasitic or just shy. I could not tell a child, or myself, what we were looking at. The nameless trail stayed a blur.

Learning names did not make me an expert. It made me a beginner with a better flashlight. Once I knew jewelweed, I started seeing it in every damp ditch. The world had not filled up with jewelweed. I had. Attention is like that. It colonizes you back.

There is a humility that comes after the first dozen names, when you realize the remaining hundreds are not going to wait for you. I carry a small guide and I still get it wrong. I have greeted a look-alike with confidence and then been corrected by a leaf that refused the description. Being wrong in a field is a clean kind of wrong. The plant does not shame you. It just continues.

I care now about the politics of the names, too. Some of the old common names are a record of who got to do the naming. There are better names in other languages, including the ones that were here first. Learning a name can be a door into that history rather than a way to skip it. I try to learn more than one name when I can. The plant is not the English word. The word is a handle. Handles can be replaced.

What I did not expect was the social life of it. People who know plants recognize each other the way people who know birds do: a slight pause at a patch of shoulder-high weeds, a leaning in. I have had entire conversations that were just pointing. That, too, is a kind of literacy.

If you want to start, do not start with a forest. Start with the unglamorous strip you already pass: the alley, the parking-lot edge, the crack in the schoolyard. Learn three names there. Use them until they stick. The strip will become a neighborhood. You will have slightly more world than you did last week.

I still walk through green sometimes and let it be a hum. Not every hour has to be a field guide. But I like knowing that the hum is made of voices, and that I can, when I want to, say hello.`,
      },
    ],
  },
];
