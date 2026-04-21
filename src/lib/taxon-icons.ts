/* (c) 2026 - Loris Dc - WildEye Project */
import { normalizeSpeciesText } from "./species-catalog";
import { Observation } from "./types";

const TAXON_EMOJIS: Record<string, string> = {
  "cerf élaphe": "🦌",
  "chevreuil européen": "🦌",
  chamois: "🦌",
  "bouquetin des alpes": "🐐",
  "marmotte des alpes": "🦫",
  sanglier: "🐗",
  "renard roux": "🦊",
  "loup gris": "🐺",
  "lynx boréal": "🐈",
  "ours brun": "🐻",
  "blaireau européen": "🦡",
  hermine: "🤍",
  fouine: "🐾",
  belette: "🐾",
  "écureuil roux": "🐿️",
  "hérisson d'europe": "🦔",
  "lièvre variable": "🐇",
  "lièvre d'europe": "🐇",
  "lapin de garenne": "🐇",
  "loutre d'europe": "🦦",
  "canard colvert": "🦆",
  "cygne tuberculé": "🦢",
  "héron cendré": "🪶",
  "aigrette garzette": "🪶",
  "cigogne blanche": "🪶",
  "gypaète barbu": "🦅",
  "aigle royal": "🦅",
  "vautour fauve": "🦅",
  "milan royal": "🦅",
  "milan noir": "🦅",
  "buse variable": "🦅",
  "épervier d'europe": "🦅",
  "faucon pèlerin": "🦅",
  "faucon crécerelle": "🦅",
  "grand-duc d'europe": "🦉",
  "chouette hulotte": "🦉",
  "chevêche d'athéna": "🦉",
  "hibou moyen-duc": "🦉",
  "pic épeiche": "🐦‍⬛",
  "pic épeichette": "🐦‍⬛",
  "pic noir": "🐦‍⬛",
  "pic vert": "🐦‍⬛",
  "torcol fourmilier": "🐦‍⬛",
  "geai des chênes": "🐦‍⬛",
  "pie bavarde": "🐦‍⬛",
  "corneille noire": "🐦‍⬛",
  "grand corbeau": "🐦‍⬛",
  "corbeau freux": "🐦‍⬛",
  "choucas des tours": "🐦‍⬛",
  "grive litorne": "🐦",
  "grive musicienne": "🐦",
  "grive draine": "🐦",
  "grive mauvis": "🐦",
  "merle noir": "🐦‍⬛",
  "mésange bleue": "🐦",
  "mésange charbonnière": "🐦",
  "mésange noire": "🐦",
  "mésange huppée": "🐦",
  "mésange nonnette": "🐦",
  "mésange boréale": "🐦",
  "mésange à longue queue": "🐦",
  "rougegorge familier": "🐦",
  "rougequeue noir": "🐦",
  "rougequeue à front blanc": "🐦",
  "bergeronnette grise": "🐦",
  "bergeronnette des ruisseaux": "🐦",
  "pinson des arbres": "🐦",
  "chardonneret élégant": "🐦",
  "verdier d'europe": "🐦",
  "bouvreuil pivoine": "🐦",
  "martin-pêcheur d'europe": "🐦",
  "huppe fasciée": "🐦",
  "martinet noir": "🐦",
  "hirondelle rustique": "🐦",
  "hirondelle de fenêtre": "🐦",
  "tétras lyre": "🐦",
  "grand tétras": "🐦",
  "lagopède alpin": "🐦",
  "vipère aspic": "🐍",
  "couleuvre helvétique": "🐍",
  "couleuvre verte et jaune": "🐍",
  "couleuvre d'esculape": "🐍",
  "lézard des murailles": "🦎",
  "lézard à deux raies": "🦎",
  "orvet fragile": "🦎",
  "grenouille rousse": "🐸",
  "grenouille rieuse": "🐸",
  "crapaud commun": "🐸",
  "salamandre tachetée": "🦎",
  "triton alpestre": "🦎",
  apollon: "🦋",
  machaon: "🦋",
  "piéride du chou": "🦋",
  vulcain: "🦋",
  "paon-du-jour": "🦋",
  citron: "🦋",
  "abeille domestique": "🐝",
  "bourdon terrestre": "🐝",
  "coccinelle à sept points": "🐞",
  "lucane cerf-volant": "🪲",
  "grillon champêtre": "🦗",
  "grande sauterelle verte": "🦗",
  "libellule déprimée": "🪰",
  "anax empereur": "🪰",
  "stéatode ponctuée": "🕷️",
  "épeire diadème": "🕷️",
  "tégénaire domestique": "🕷️",
  "escargot de bourgogne": "🐌",
  "escargot petit-gris": "🐌",
  "écrevisse à pattes blanches": "🦞",
  orque: "🐋",
  "dauphin commun": "🐬",
  "baleine bleue": "🐋",
  "grand requin blanc": "🦈",
  "tortue verte": "🐢",
  "poisson-clown": "🐠",
  "baleine à bosse": "🐋",
  cachalot: "🐋",
  "raie manta": "🐟",
  "pieuvre géante du pacifique": "🐙",
  "méduse lune": "🪼",
  lion: "🦁",
  "éléphant d'afrique": "🐘",
  tigre: "🐯",
  "panda géant": "🐼",
  gorille: "🦍",
  girafe: "🦒",
  koala: "🐨",
  kangourou: "🦘",
  hippopotame: "🦛",
  rhinocéros: "🦏",
  zèbre: "🦓",
  caméléon: "🦎",
  manchot: "🐧",
  "ours polaire": "🐻‍❄️",
  otarie: "🦭",
  espadon: "🐟",
  tournesol: "🌻",
  lavande: "🪻",
  rose: "🌹",
  coquelicot: "🌺",
  "chêne pédonculé": "🌳",
  edelweiss: "🌼",
  "sabot de vénus": "🌺",
  "gentiane jaune": "🌼",
  "chardon bleu des alpes": "🌸",
  "androsace des alpes": "🌸",
  génépi: "🌿",
  "rhododendron ferrugineux": "🌺",
  "lys martagon": "🌸",
  quartz: "🔮",
  "quartz fumé": "🔮",
  améthyste: "💜",
  fluorine: "🟣",
  "fluorine violette": "🟣",
  sidérite: "🟤",
  anatase: "💎",
  axinite: "🟫",
  "grenat almandin": "🔴",
  épidote: "🟢",
  adulaire: "✨",
  calcite: "◇",
  rutile: "🪡",
  actinote: "🟢",
  barytine: "🍯",
  pyrite: "✨",
  hématite: "⚙️",
  "tourmaline noire": "⚫",
};

const SCIENTIFIC_EMOJIS: Record<string, string> = {
  "Garrulus glandarius": "🐦‍⬛",
  "Pica pica": "🐦‍⬛",
  "Corvus corone": "🐦‍⬛",
  "Corvus frugilegus": "🐦‍⬛",
  "Corvus monedula": "🐦‍⬛",
  "Corvus corax": "🐦‍⬛",
  "Turdus merula": "🐦‍⬛",
  "Turdus pilaris": "🐦",
  "Dendrocopos major": "🐦‍⬛",
  "Cyanistes caeruleus": "🐦",
  "Parus major": "🐦",
  "Anas platyrhynchos": "🦆",
  "Bubo bubo": "🦉",
  "Falco peregrinus": "🦅",
  "Aquila chrysaetos": "🦅",
  "Gypaetus barbatus": "🦅",
  "Gyps fulvus": "🦅",
  "Rupicapra rupicapra": "🦌",
  "Capra ibex": "🐐",
  "Marmota marmota": "🦫",
  "Vulpes vulpes": "🦊",
  "Canis lupus": "🐺",
  "Lynx lynx": "🐈",
  "Ursus arctos": "🐻",
  "Vipera aspis": "🐍",
  "Podarcis muralis": "🦎",
  "Rana temporaria": "🐸",
  "Papilio machaon": "🦋",
  "Apis mellifera": "🐝",
  "Coccinella septempunctata": "🐞",
  "Steatoda bipunctata": "🕷️",
  "Orcinus orca": "🐋",
  "Delphinus delphis": "🐬",
  "Balaenoptera musculus": "🐋",
  "Carcharodon carcharias": "🦈",
  "Chelonia mydas": "🐢",
  "Amphiprion ocellaris": "🐠",
  "Megaptera novaeangliae": "🐋",
  "Physeter macrocephalus": "🐋",
  "Manta birostris": "🐟",
  "Enteroctopus dofleini": "🐙",
  "Aurelia aurita": "🪼",
  "Panthera leo": "🦁",
  "Loxodonta africana": "🐘",
  "Panthera tigris": "🐯",
  "Gorilla gorilla": "🦍",
  "Ailuropoda melanoleuca": "🐼",
  "Giraffa camelopardalis": "🦒",
  "Phascolarctos cinereus": "🐨",
  "Macropodidae": "🦘",
  "Hippopotamus amphibius": "🦛",
  "Rhinocerotidae": "🦏",
  "Equus quagga": "🦓",
  "Chamaeleonidae": "🦎",
  "Sphenisciformes": "🐧",
  "Ursus maritimus": "🐻‍❄️",
  "Otariinae": "🦭",
  "Xiphias gladius": "🐟",
  "Helianthus annuus": "🌻",
  "Lavandula angustifolia": "🪻",
  "Papaver rhoeas": "🌺",
  "Quercus robur": "🌳",
  "Quartz violet": "💜",
  "Carbonate de cuivre": "🟢",
  "Quartz rose": "🩷",
  "Sulfure de fer": "✨",
  "Halyzia sedecimguttata": "🐞",
  "Propylea quatuordecimpunctata": "🐞",
  "Harmonia axyridis": "🐞",
  "Thyrsites atun": "🐟",
  "Moerella tulipa": "🐚",
  "Thunnus albacares": "🐟",
  "Mirounga leonina": "🦭",
  "Balaenoptera acutorostrata": "🐋",
  "Phocoena phocoena": "🐬",
  "Mola mola": "🐟",
  "Perca fluviatilis": "🐟",
  "Salmo trutta": "🐟",
  "Esox lucius": "🐟",
  "Camelus dromedarius": "🐫",
  "Camelus bactrianus": "🐪",
};

const FAMILY_EMOJIS: Record<string, string> = {
  Cervidae: "🦌",
  Bovidae: "🐐",
  Canidae: "🦊",
  Felidae: "🐈",
  Ursidae: "🐻",
  Mustelidae: "🐾",
  Sciuridae: "🐿️",
  Leporidae: "🐇",
  Accipitridae: "🦅",
  Falconidae: "🦅",
  Strigidae: "🦉",
  Anatidae: "🦆",
  Corvidae: "🐦‍⬛",
  Picidae: "🐦‍⬛",
  Turdidae: "🐦",
  Paridae: "🐦",
  Viperidae: "🐍",
  Natricidae: "🐍",
  Lacertidae: "🦎",
  Ranidae: "🐸",
  Salamandridae: "🦎",
  Papilionidae: "🦋",
  Apidae: "🐝",
  Coccinellidae: "🐞",
  Lucanidae: "🪲",
  Tettigoniidae: "🦗",
  Libellulidae: "🪰",
  Araneidae: "🕷️",
  Theridiidae: "🕷️",
  Agelenidae: "🕷️",
  Helicidae: "🐌",
  Astacidae: "🦞",
  Muridae: "🐭",
  Cricetidae: "🐭",
  Soricidae: "🐾",
  Talpidae: "🐾",
  Gliridae: "🐭",
  Castoridae: "🦫",
  Murinae: "🐭",
  Phasianidae: "🐦",
  Laridae: "🪶",
  Rallidae: "🪶",
  Ardeidae: "🪶",
  Ciconiidae: "🪶",
  Columbidae: "🕊️",
  Hirundinidae: "🐦",
  Apodidae: "🐦",
  Alcedinidae: "🐦",
  Upupidae: "🐦",
  Muscicapidae: "🐦",
  Motacillidae: "🐦",
  Fringillidae: "🐦",
  Emberizidae: "🐦",
  Passeridae: "🐦",
  Sturnidae: "🐦",
  Troglodytidae: "🐦",
  Sittidae: "🐦",
  Certhiidae: "🐦",
  Cuculidae: "🐦",
  Bufonidae: "🐸",
  Hylidae: "🐸",
  Anguidae: "🦎",
  Pieridae: "🦋",
  Nymphalidae: "🦋",
  Hesperiidae: "🦋",
  Lycaenidae: "🦋",
  Formicidae: "🐜",
  Vespidae: "🐝",
  Syrphidae: "🪰",
  Acrididae: "🦗",
  Gryllidae: "🦗",
  Gryllotalpidae: "🦗",
  Carabidae: "🪲",
  Scarabaeidae: "🪲",
  Cerambycidae: "🪲",
  Chrysomelidae: "🪲",
  Curculionidae: "🪲",
  Salticidae: "🕷️",
  Lycosidae: "🕷️",
  Thomisidae: "🕷️",
  Gnaphosidae: "🕷️",
  Lumbricidae: "🪱",
  Unionidae: "🐚",
  Planorbidae: "🐌",
  Lymnaeidae: "🐌",
  Orchidaceae: "🌺",
  Asteraceae: "🌼",
  Apiaceae: "🌿",
  Ranunculaceae: "🌼",
  Brassicaceae: "🌼",
  Campanulaceae: "🔔",
  Caryophyllaceae: "🌸",
  Fabaceae: "🌿",
  Lamiaceae: "🌿",
  Plantaginaceae: "🌿",
  Primulaceae: "🌸",
  Violaceae: "🌸",
  Boraginaceae: "🌼",
  Polygonaceae: "🌿",
  Juncaceae: "🌾",
  Cyperaceae: "🌾",
  Amaryllidaceae: "🌼",
  Gentianaceae: "🌼",
  Liliaceae: "🌸",
  Ericaceae: "🌺",
  Rosaceae: "🌸",
  Poaceae: "🌾",
  Pinaceae: "🌲",
  Fagaceae: "🌳",
  Silicates: "🔮",
  Feldspaths: "✨",
  Sorosilicates: "🟢",
  Halogénures: "🟣",
  Oxydes: "⚙️",
  Carbonates: "◇",
  Nésosilicates: "🔴",
  Inosilicates: "🟢",
  Tellinidae: "🐚",
  Scombridae: "🐟",
  Gempylidae: "🐟",
  Phocidae: "🦭",
  Otariidae: "🦭",
  Delphinidae: "🐬",
  Balaenopteridae: "🐋",
  Balaenidae: "🐋",
  Physeteridae: "🐋",
  Trochidae: "🐚",
  Mytilidae: "🐚",
  Pectinidae: "🐚",
  Veneridae: "🐚",
  Muricidae: "🐌",
  Cypraeidae: "🐚",
  Conidae: "🐚",
  Camelidae: "🐫",
  Scaridae: "🐠",
  Metridinidae: "🦐",
  Phacaceae: "🔬",
  Euglenaceae: "🔬",
  Euglenophyceae: "🔬",
  Copepoda: "🦐",
  Calanoida: "🦐",
};

const GROUP_EMOJIS: Record<string, string> = {
  mammiferes: "🐾",
  mammalia: "🐾",
  oiseaux: "🐦",
  aves: "🐦",
  reptiles: "🦎",
  reptilia: "🦎",
  amphibiens: "🐸",
  amphibia: "🐸",
  poissons: "🐟",
  actinopterygii: "🐟",
  insectes: "🦋",
  insecta: "🦋",
  arachnides: "🕷️",
  arachnida: "🕷️",
  mollusques: "🐌",
  mollusca: "🐌",
  malacostraca: "🦀",
  plantae: "🌿",
  fungi: "🍄",
  "mammiferes marins": "🐋",
  flore: "🌱",
  cristaux: "💎",
  cristal: "💎",
};

function lookupEmoji(value?: string | null) {
  if (!value) return undefined;
  const normalized = normalizeSpeciesText(value);
  return Object.entries(TAXON_EMOJIS).find(
    ([name]) => normalizeSpeciesText(name) === normalized
  )?.[1];
}

function lookupScientificEmoji(value?: string | null) {
  if (!value) return undefined;
  const normalized = normalizeSpeciesText(value);
  return Object.entries(SCIENTIFIC_EMOJIS).find(
    ([name]) => normalizeSpeciesText(name) === normalized
  )?.[1];
}

function lookupFamilyEmoji(value?: string | null) {
  if (!value) return undefined;
  const normalized = normalizeSpeciesText(value);
  return Object.entries(FAMILY_EMOJIS).find(
    ([name]) => normalizeSpeciesText(name) === normalized
  )?.[1];
}

function lookupGroupEmoji(value?: string | null) {
  if (!value) return undefined;
  return GROUP_EMOJIS[normalizeSpeciesText(value)];
}

function inferKeywordEmoji(obs: Pick<Observation, "category" | "common_name" | "species_name" | "scientific_name" | "family">) {
  const text = normalizeSpeciesText(
    [obs.common_name, obs.species_name, obs.scientific_name, obs.family].filter(Boolean).join(" ")
  );

  if (/(canard|anas|anatidae|cygne|oie)/.test(text)) return "🦆";
  if (/(aigle|vautour|buse|milan|faucon|gypaete|accipitridae|falconidae)/.test(text)) return "🦅";
  if (/(hibou|chouette|bubo|strix|asio|strigidae)/.test(text)) return "🦉";
  if (/(corbeau|corneille|pie|geai|choucas|corvus|garrulus|pica|corvidae)/.test(text)) return "🐦‍⬛";
  if (/(pic|dendrocopos|dryobates|picus|picidae)/.test(text)) return "🐦‍⬛";
  if (/(oiseau|aves|bird)/.test(text)) return "🐦";
  if (/(serpent|vipere|couleuvre|natrix|vipera|viperidae|natricidae)/.test(text)) return "🐍";
  if (/(lezard|lacerta|podarcis|orvet|lizard|lacertidae|anguidae)/.test(text)) return "🦎";
  if (/(grenouille|crapaud|rana|bufo|pelophylax|ranidae|bufonidae)/.test(text)) return "🐸";
  if (/(coccinelle|ladybird|ladybug|coccinella|coccinellidae)/.test(text)) return "🐞";
  if (/(scarabee|coleoptere|beetle|lucane|carabidae|scarabaeidae|cerambycidae|chrysomelidae|curculionidae|coleoptera)/.test(text)) return "🪲";
  if (/(papillon|butterfly|parnassius|papilio|pieris|nymphalidae|papilionidae|pieridae)/.test(text)) return "🦋";
  if (/(abeille|bourdon|apis|bombus|apidae)/.test(text)) return "🐝";
  if (/(fourmi|formicidae)/.test(text)) return "🐜";
  if (/(libellule|anax|libellulidae|odonata)/.test(text)) return "🪰";
  if (/(sauterelle|grillon|tettigonia|gryllus|orthoptera)/.test(text)) return "🦗";
  if (/(araignee|spider|arane|steatoda|eratigena|araneidae|theridiidae|salticidae|lycosidae)/.test(text)) return "🕷️";
  if (/(escargot|snail|helix|cornu|helicidae)/.test(text)) return "🐌";
  if (/(ecrevisse|crayfish|austropotamobius|astacidae)/.test(text)) return "🦞";
  if (/(cerf|chevreuil|cervus|capreolus|cervidae)/.test(text)) return "🦌";
  if (/(bouquetin|capra|chevre|bovidae)/.test(text)) return "🐐";
  if (/(renard|vulpes|canidae)/.test(text)) return "🦊";
  if (/(loup|canis lupus)/.test(text)) return "🐺";
  if (/(lynx|felidae)/.test(text)) return "🐈";
  if (/(ours|ursus|ursidae)/.test(text)) return "🐻";
  if (/(sanglier|sus scrofa)/.test(text)) return "🐗";
  if (/(marmotte|castor|marmota|castoridae)/.test(text)) return "🦫";
  if (/(ecureuil|sciurus|sciuridae)/.test(text)) return "🐿️";
  if (/(lievre|lapin|lepus|oryctolagus|leporidae)/.test(text)) return "🐇";
  if (/(souris|mulot|campagnol|muridae|cricetidae)/.test(text)) return "🐭";
  if (/(orchid|orchidaceae|sabot)/.test(text)) return "🌺";
  if (/(lys|lilium|androsace|caryophyllaceae|primulaceae|violaceae)/.test(text)) return "🌸";
  if (/(gentiane|edelweiss|asteraceae|gentianaceae|ranunculaceae)/.test(text)) return "🌼";
  if (/(graminee|poaceae|cyperaceae|juncaceae)/.test(text)) return "🌾";
  if (/(pin|sapin|epicea|pinaceae)/.test(text)) return "🌲";
  if (/(chene|fagus|quercus|fagaceae)/.test(text)) return "🌳";
  if (/(quartz|amethyste|cristal|silicate|fluorine|sidérite|anatase|axinite|grenat|épidote|adulaire|calcite|rutile|actinote|barytine|pyrite|hématite|tourmaline)/i.test(text)) return "💎";
  if (/(lion|panthera leo)/i.test(text)) return "🦁";
  if (/(elephant|loxodonta)/i.test(text)) return "🐘";
  if (/(tigre|panthera tigris)/i.test(text)) return "🐯";
  if (/(panda|ailuropoda)/i.test(text)) return "🐼";
  if (/(girafe|giraffa)/i.test(text)) return "🦒";
  if (/(orque|orca|orcinus)/i.test(text)) return "🐋";
  if (/(dauphin|dolphin|delphinus|tursiops)/i.test(text)) return "🐬";
  if (/(baleine|whale|balaenoptera)/i.test(text)) return "🐋";
  if (/(requin|shark|carcharodon)/i.test(text)) return "🦈";
  if (/(tortue|turtle|chelonia)/i.test(text)) return "🐢";
  if (/(poisson|fish|amphiprion)/i.test(text)) return "🐠";
  if (/(tournesol|helianthus)/i.test(text)) return "🌻";
  if (/(lavande|lavandula)/i.test(text)) return "🪻";
  if (/(rose|rosa)/i.test(text)) return "🌹";
  if (/(coquelicot|papaver)/i.test(text)) return "🌺";
  if (/(dromadaire|chameau|camelus|camelidae)/i.test(text)) return "🐫";
  if (/(requin|shark|carcharodon|scarus|sparid)/i.test(text)) return "🦈";
  if (/(poisson|fish|paraf|scaridae|tetraodont)/i.test(text)) return "🐠";
  if (/(copepod|metridia|calanoida|cyclopoid)/i.test(text)) return "🦐";
  if (/(phacus|alga|protozoa|euglena|microscop)/i.test(text)) return "🔬";

  return undefined;
}

function isSpecificEmoji(value?: string | null) {
  return Boolean(value && !["🐾", "🦋", "•"].includes(value));
}

export function getEmojiFromHierarchy(
  scientificName: string,
  ancestors: { name: string; rank: string }[] = [],
  commonName?: string
): string {
  // 1. Direct scientific name match
  const directMatch = lookupScientificEmoji(scientificName);
  if (directMatch) return directMatch;

  // 2. Check ancestors (Family, Class, etc.)
  // Reverse to check most specific ranks first (Family > Order > Class > Kingdom)
  const reversedAncestors = [...ancestors].reverse();
  for (const ancestor of reversedAncestors) {
    const familyMatch = lookupFamilyEmoji(ancestor.name);
    if (familyMatch) return familyMatch;

    const groupMatch = lookupGroupEmoji(ancestor.name);
    if (groupMatch) return groupMatch;
  }

  // 3. Keyword inference (last resort)
  const inferred = inferKeywordEmoji({
    category: "faune",
    scientific_name: scientificName,
    species_name: scientificName,
    common_name: commonName,
    family: ancestors.find((a) => a.rank === "family")?.name,
  });

  return inferred ?? "🐾";
}

export function getTaxonEmoji(obs: Pick<
  Observation,
  | "category"
  | "taxon_emoji"
  | "animal_emoji"
  | "common_name"
  | "species_name"
  | "scientific_name"
  | "animal_group"
  | "taxon_class"
  | "family"
>) {
  return (
    obs.taxon_emoji ??
    lookupScientificEmoji(obs.scientific_name) ??
    lookupEmoji(obs.common_name) ??
    lookupEmoji(obs.species_name) ??
    lookupFamilyEmoji(obs.family) ??
    lookupGroupEmoji(obs.animal_group) ??
    lookupGroupEmoji(obs.taxon_class) ??
    inferKeywordEmoji(obs) ??
    (isSpecificEmoji(obs.animal_emoji) ? obs.animal_emoji : undefined) ??
    (obs.category === "cristal" ? "◆" : obs.category === "flore" ? "✿" : "🐾")
  );
}
