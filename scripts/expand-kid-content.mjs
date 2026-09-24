import fs from 'node:fs';

const catalogPath = 'src/data/dressUpCatalog.json';
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const groups = catalog.destinations.all;
const item = (id, name, slot, destinations, extraTags = []) => ({
  id,
  name,
  description: `${name}, ready for a real-life travel adventure.`,
  imageUrl: `/little-jetter/catalog/tokyo/${id}/default.png`,
  slot,
  tags: [...destinations.map((destination) => `destination:${destination}`), 'illustrated', 'painterly', ...extraTags],
});

const additions = {
  tops: [
    item('ramen-tee', 'Ramen adventure tee', 'top', ['tokyo', 'seoul']),
    item('purple-floral-sweater', 'Purple garden sweater', 'top', ['tokyo', 'paris', 'copenhagen']),
    item('teal-shiba-sweater', 'Teal puppy sweater', 'top', ['tokyo', 'seoul', 'copenhagen']),
  ],
  bottoms: [
    item('black-flower-shorts', 'Flower play shorts', 'bottom', ['tokyo', 'honolulu', 'accra', 'salvador']),
    item('pink-bow-skirt', 'Pink bow skirt', 'bottom', ['tokyo', 'paris', 'copenhagen']),
    item('yellow-plaid-skirt', 'Sunshine plaid skirt', 'bottom', ['tokyo', 'london', 'copenhagen']),
  ],
  layers: [
    item('cherry-cardigan', 'Cherry picnic cardigan', 'outerwear', ['tokyo', 'kyoto', 'copenhagen', 'new-orleans']),
  ],
  shoes: [
    item('black-combat-boots', 'City explorer boots', 'shoes', ['tokyo', 'london', 'new-york', 'copenhagen']),
    item('purple-converse', 'Purple high-top sneakers', 'shoes', ['tokyo', 'seoul', 'new-orleans']),
    item('red-converse', 'Red high-top sneakers', 'shoes', ['tokyo', 'mumbai', 'new-orleans']),
  ],
  accessories: [
    item('purple-fanny-pack', 'Purple adventure pack', 'accessory', ['tokyo', 'seoul', 'salvador']),
    item('red-flat-cap', 'Red city cap', 'accessory', ['tokyo', 'london', 'new-orleans'], ['style:hat']),
    item('tokyo-bucket-hat', 'Tokyo patch bucket hat', 'accessory', ['tokyo', 'honolulu', 'accra'], ['style:hat']),
    item('tokyo-tote-bag', 'Tokyo flower tote', 'accessory', ['tokyo', 'kyoto', 'mumbai']),
  ],
};

for (const [group, newItems] of Object.entries(additions)) {
  const ids = new Set(groups[group].map((entry) => entry.id));
  groups[group].push(...newItems.filter((entry) => !ids.has(entry.id)));
}
fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

const explorePath = 'src/data/exploreContent.json';
const explore = JSON.parse(fs.readFileSync(explorePath, 'utf8'));
const destination = (gastronomy, vocabulary, sites, city, placeholders) => ({
  gastronomy,
  vocabulary,
  sites,
  madlib: {
    template: `Today in ${city}, I spotted a {0} treasure beside a {1} street. I tried a {2} treat that tasted {3}, then heard a {4} sound leading me toward the next adventure.`,
    blanks: [
      { label: 'A color', placeholder: placeholders[0] },
      { label: 'An adjective', placeholder: placeholders[1] },
      { label: 'A silly food', placeholder: placeholders[2] },
      { label: 'A funny taste word', placeholder: placeholders[3] },
      { label: 'A sound', placeholder: placeholders[4] },
    ],
  },
});

Object.assign(explore, {
  accra: destination(
    [{ name: 'Waakye', blurb: 'Rice and beans cooked together and served with colorful sides.' }, { name: 'Kelewele', blurb: 'Warm, spiced plantain pieces with crisp edges.' }, { name: 'Bofrot', blurb: 'Soft, round Ghanaian doughnuts enjoyed as a treat.' }],
    [{ term: 'Akwaaba', meaning: 'Welcome' }, { term: 'Medaase', meaning: 'Thank you in Twi' }, { term: 'Ɛte sɛn?', meaning: 'How are you? in Twi' }],
    [{ name: 'Independence Square', blurb: 'A landmark square with a giant arch and star.' }, { name: 'Jamestown Lighthouse', blurb: 'A red-and-white lighthouse beside a historic coastal neighborhood.' }, { name: 'Arts Centre', blurb: 'A place to discover Ghanaian weaving, carving, and art.' }],
    'Accra', ['golden', 'breezy', 'plantain-swirled', 'spicy-sweet', 'drumbeat'],
  ),
  mumbai: destination(
    [{ name: 'Vada pav', blurb: 'A spiced potato fritter tucked into a soft bread roll.' }, { name: 'Bhel puri', blurb: 'A crunchy, tangy snack mixed with puffed rice and chutneys.' }, { name: 'Mango lassi', blurb: 'A cool yogurt drink blended with sweet mango.' }],
    [{ term: 'Namaste', meaning: 'A respectful hello' }, { term: 'Dhanyavaad', meaning: 'Thank you in Hindi' }, { term: 'Chalo', meaning: 'Let’s go' }],
    [{ name: 'Gateway of India', blurb: 'A huge stone arch facing Mumbai Harbour.' }, { name: 'Marine Drive', blurb: 'A curving seaside promenade that sparkles at night.' }, { name: 'Chhatrapati Shivaji Maharaj Terminus', blurb: 'A grand historic railway station full of carved details.' }],
    'Mumbai', ['marigold', 'rain-shiny', 'mango-crunch', 'tangy-bright', 'taxi-honk'],
  ),
  copenhagen: destination(
    [{ name: 'Smørrebrød', blurb: 'An open-faced sandwich arranged with colorful toppings.' }, { name: 'Kanelsnegl', blurb: 'A spiraled cinnamon pastry from a Danish bakery.' }, { name: 'Æbleskiver', blurb: 'Small round pancake puffs dusted with sugar.' }],
    [{ term: 'Hej', meaning: 'Hello' }, { term: 'Tak', meaning: 'Thank you' }, { term: 'Hygge', meaning: 'A warm, cozy feeling of togetherness' }],
    [{ name: 'Nyhavn', blurb: 'A canal lined with brightly colored townhouses and boats.' }, { name: 'Tivoli Gardens', blurb: 'A historic garden filled with lights and playful rides.' }, { name: 'The Round Tower', blurb: 'A tower with a spiral walkway instead of stairs.' }],
    'Copenhagen', ['sky-blue', 'cozy', 'cinnamon-curled', 'warm-and-sweet', 'bicycle-bell'],
  ),
  salvador: destination(
    [{ name: 'Acarajé', blurb: 'A crisp black-eyed-pea fritter filled with bright, flavorful toppings.' }, { name: 'Cocada', blurb: 'A chewy coconut sweet found in many colors and flavors.' }, { name: 'Tapioca crepe', blurb: 'A soft white crepe made from cassava and folded around a filling.' }],
    [{ term: 'Olá', meaning: 'Hello' }, { term: 'Obrigado', meaning: 'Thank you' }, { term: 'Axé', meaning: 'A word for positive energy and spirit' }],
    [{ name: 'Pelourinho', blurb: 'A historic neighborhood of colorful buildings and stone streets.' }, { name: 'Elevador Lacerda', blurb: 'A tall city elevator connecting the upper and lower city.' }, { name: 'Bonfim Church', blurb: 'A church known for thousands of colorful wish ribbons.' }],
    'Salvador', ['ribbon-red', 'sunny', 'coconut-crisp', 'tropical-sweet', 'drum-rhythm'],
  ),
  'new-orleans': destination(
    [{ name: 'Beignet', blurb: 'A warm square of fried dough covered with powdered sugar.' }, { name: 'Red beans and rice', blurb: 'A comforting bowl traditionally enjoyed on Mondays.' }, { name: 'Praline', blurb: 'A creamy candy made with pecans and brown sugar.' }],
    [{ term: 'Lagniappe', meaning: 'A little something extra' }, { term: 'Second line', meaning: 'A joyful parade that follows the band' }, { term: 'Where y’at?', meaning: 'A friendly local way to ask how someone is doing' }],
    [{ name: 'French Quarter', blurb: 'A historic neighborhood with iron balconies and lively streets.' }, { name: 'St. Charles Streetcar', blurb: 'A green streetcar that rolls beneath oak trees.' }, { name: 'City Park', blurb: 'A huge green park with ancient live oaks and family attractions.' }],
    'New Orleans', ['magnolia-white', 'music-filled', 'sugar-cloud', 'powdery-sweet', 'trumpet-toot'],
  ),
});
fs.writeFileSync(explorePath, `${JSON.stringify(explore, null, 2)}\n`);
