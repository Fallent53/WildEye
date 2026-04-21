import { Category } from "./types";

export type SpeciesLocale = "fr" | "en";

export interface AnimalSpecies {
  vernacularName: string;
  scientificName: string;
  localizedNames?: Partial<Record<SpeciesLocale, string>>;
  group: string;
  emoji: string;
  family?: string;
  habitatHint?: string;
  activityHint?: string;
  sensitivityLabel?: string;
  aliases: string[];
}

const GROUP_EMOJIS: Record<string, string> = {
  mammiferes: "🦌",
  mammalia: "🐾",
  "mammiferes marins": "🐋",
  oiseaux: "🦅",
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
  crustaces: "🦀",
  malacostraca: "🦀",
  flore: "🌱",
  plantae: "🌿",
  cristaux: "💎",
};

const FRENCH_TAXON_NAMES: Record<string, string> = {
  "Leontopodium alpinum": "Edelweiss",
  "Leontopodium nivale": "Edelweiss",
  "Cypripedium calceolus": "Sabot de Vénus",
  "Gentiana lutea": "Gentiane jaune",
  "Eryngium alpinum": "Chardon bleu des Alpes",
  "Androsace alpina": "Androsace des Alpes",
  "Artemisia glacialis": "Génépi",
  "Artemisia umbelliformis": "Génépi blanc",
  "Rhododendron ferrugineum": "Rhododendron ferrugineux",
  "Lilium martagon": "Lys martagon",
  "Garrulus glandarius": "Geai des chênes",
  "Pica pica": "Pie bavarde",
  "Corvus corone": "Corneille noire",
  "Corvus frugilegus": "Corbeau freux",
  "Corvus monedula": "Choucas des tours",
  "Corvus corax": "Grand corbeau",
  "Turdus merula": "Merle noir",
  "Turdus philomelos": "Grive musicienne",
  "Turdus viscivorus": "Grive draine",
  "Turdus iliacus": "Grive mauvis",
  "Turdus pilaris": "Grive litorne",
  "Dendrocopos major": "Pic épeiche",
  "Dryobates minor": "Pic épeichette",
  "Dryocopus martius": "Pic noir",
  "Picus viridis": "Pic vert",
  "Jynx torquilla": "Torcol fourmilier",
  "Cyanistes caeruleus": "Mésange bleue",
  "Parus major": "Mésange charbonnière",
  "Periparus ater": "Mésange noire",
  "Lophophanes cristatus": "Mésange huppée",
  "Poecile palustris": "Mésange nonnette",
  "Poecile montanus": "Mésange boréale",
  "Aegithalos caudatus": "Mésange à longue queue",
  "Sitta europaea": "Sittelle torchepot",
  "Certhia brachydactyla": "Grimpereau des jardins",
  "Certhia familiaris": "Grimpereau des bois",
  "Troglodytes troglodytes": "Troglodyte mignon",
  "Erithacus rubecula": "Rougegorge familier",
  "Phoenicurus ochruros": "Rougequeue noir",
  "Phoenicurus phoenicurus": "Rougequeue à front blanc",
  "Saxicola rubicola": "Tarier pâtre",
  "Oenanthe oenanthe": "Traquet motteux",
  "Motacilla alba": "Bergeronnette grise",
  "Motacilla cinerea": "Bergeronnette des ruisseaux",
  "Anthus pratensis": "Pipit farlouse",
  "Anthus spinoletta": "Pipit spioncelle",
  "Fringilla coelebs": "Pinson des arbres",
  "Fringilla montifringilla": "Pinson du Nord",
  "Carduelis carduelis": "Chardonneret élégant",
  "Chloris chloris": "Verdier d'Europe",
  "Spinus spinus": "Tarin des aulnes",
  "Linaria cannabina": "Linotte mélodieuse",
  "Pyrrhula pyrrhula": "Bouvreuil pivoine",
  "Coccothraustes coccothraustes": "Grosbec casse-noyaux",
  "Emberiza citrinella": "Bruant jaune",
  "Emberiza cirlus": "Bruant zizi",
  "Passer domesticus": "Moineau domestique",
  "Passer montanus": "Moineau friquet",
  "Sturnus vulgaris": "Étourneau sansonnet",
  "Columba palumbus": "Pigeon ramier",
  "Columba livia": "Pigeon biset",
  "Streptopelia decaocto": "Tourterelle turque",
  "Cuculus canorus": "Coucou gris",
  "Apus apus": "Martinet noir",
  "Hirundo rustica": "Hirondelle rustique",
  "Delichon urbicum": "Hirondelle de fenêtre",
  "Riparia riparia": "Hirondelle de rivage",
  "Alcedo atthis": "Martin-pêcheur d'Europe",
  "Upupa epops": "Huppe fasciée",
  "Bubo bubo": "Grand-duc d'Europe",
  "Strix aluco": "Chouette hulotte",
  "Athene noctua": "Chevêche d'Athéna",
  "Asio otus": "Hibou moyen-duc",
  "Falco tinnunculus": "Faucon crécerelle",
  "Falco peregrinus": "Faucon pèlerin",
  "Buteo buteo": "Buse variable",
  "Milvus milvus": "Milan royal",
  "Milvus migrans": "Milan noir",
  "Accipiter nisus": "Épervier d'Europe",
  "Aquila chrysaetos": "Aigle royal",
  "Gypaetus barbatus": "Gypaète barbu",
  "Gyps fulvus": "Vautour fauve",
  "Ardea cinerea": "Héron cendré",
  "Egretta garzetta": "Aigrette garzette",
  "Ciconia ciconia": "Cigogne blanche",
  "Anas platyrhynchos": "Canard colvert",
  "Cygnus olor": "Cygne tuberculé",
  "Fulica atra": "Foulque macroule",
  "Gallinula chloropus": "Gallinule poule-d'eau",
  "Larus michahellis": "Goéland leucophée",
  "Chroicocephalus ridibundus": "Mouette rieuse",
  "Vulpes vulpes": "Renard roux",
  "Meles meles": "Blaireau européen",
  "Martes martes": "Martre des pins",
  "Martes foina": "Fouine",
  "Mustela nivalis": "Belette d'Europe",
  "Mustela erminea": "Hermine",
  "Lutra lutra": "Loutre d'Europe",
  "Sus scrofa": "Sanglier",
  "Cervus elaphus": "Cerf élaphe",
  "Capreolus capreolus": "Chevreuil européen",
  "Rupicapra rupicapra": "Chamois",
  "Capra ibex": "Bouquetin des Alpes",
  "Marmota marmota": "Marmotte des Alpes",
  "Sciurus vulgaris": "Écureuil roux",
  "Erinaceus europaeus": "Hérisson d'Europe",
  "Lepus europaeus": "Lièvre d'Europe",
  "Lepus timidus": "Lièvre variable",
  "Oryctolagus cuniculus": "Lapin de garenne",
  "Canis lupus": "Loup gris",
  "Lynx lynx": "Lynx boréal",
  "Ursus arctos": "Ours brun",
  "Rana temporaria": "Grenouille rousse",
  "Pelophylax ridibundus": "Grenouille rieuse",
  "Bufo bufo": "Crapaud commun",
  "Salamandra salamandra": "Salamandre tachetée",
  "Ichthyosaura alpestris": "Triton alpestre",
  "Vipera aspis": "Vipère aspic",
  "Natrix helvetica": "Couleuvre helvétique",
  "Hierophis viridiflavus": "Couleuvre verte et jaune",
  "Zamenis longissimus": "Couleuvre d'Esculape",
  "Podarcis muralis": "Lézard des murailles",
  "Lacerta bilineata": "Lézard à deux raies",
  "Anguis fragilis": "Orvet fragile",
  "Parnassius apollo": "Apollon",
  "Papilio machaon": "Machaon",
  "Pieris brassicae": "Piéride du chou",
  "Vanessa atalanta": "Vulcain",
  "Aglais io": "Paon-du-jour",
  "Gonepteryx rhamni": "Citron",
  "Apis mellifera": "Abeille domestique",
  "Bombus terrestris": "Bourdon terrestre",
  "Coccinella septempunctata": "Coccinelle à sept points",
  "Lucanus cervus": "Lucane cerf-volant",
  "Tettigonia viridissima": "Grande sauterelle verte",
  "Gryllus campestris": "Grillon champêtre",
  "Libellula depressa": "Libellule déprimée",
  "Anax imperator": "Anax empereur",
  "Steatoda bipunctata": "Stéatode ponctuée",
  "Araneus diadematus": "Épeire diadème",
  "Eratigena atrica": "Tégénaire domestique",
  "Helix pomatia": "Escargot de Bourgogne",
  "Cornu aspersum": "Escargot petit-gris",
  "Austropotamobius pallipes": "Écrevisse à pattes blanches",
  "Orcinus orca": "Orque",
  "Delphinus delphis": "Dauphin commun",
  "Tursiops truncatus": "Grand dauphin",
  "Balaenoptera musculus": "Baleine bleue",
  "Megaptera novaeangliae": "Baleine à bosse",
  "Carcharodon carcharias": "Grand requin blanc",
  "Chelonia mydas": "Tortue verte",
  "Amphiprion ocellaris": "Poisson-clown",
  "Aurelia aurita": "Méduse lune",
  "Enteroctopus dofleini": "Pieuvre géante du Pacifique",
  "Physeter macrocephalus": "Cachalot",
  "Taraxacum officinale": "Pissenlit",
  "Xiphias gladius": "Espadon",
  "Otariinae": "Otarie",
  "Sphenisciformes": "Manchot",
  "Ursus maritimus": "Ours polaire",
  "Macropodidae": "Kangourou",
  "Phascolarctos cinereus": "Koala",
  "Folivora": "Paresseux",
  "Hippopotamus amphibius": "Hippopotame",
  "Rhinocerotidae": "Rhinocéros",
  "Equus quagga": "Zèbre",
  "Chamaeleonidae": "Caméléon",
};

export const ANIMAL_SPECIES: AnimalSpecies[] = [
  {
    vernacularName: "Cerf élaphe",
    scientificName: "Cervus elaphus",
    localizedNames: { fr: "Cerf élaphe", en: "Red Deer" },
    group: "Mammifères",
    emoji: "🦌",
    family: "Cervidae",
    habitatHint: "Lisières, forêts claires et vallons tranquilles.",
    activityHint: "Crépuscule, nuit et brame automnal.",
    aliases: ["cerf", "cerf elaphe", "red deer", "cervus elaphus"],
  },
  {
    vernacularName: "Chevreuil européen",
    scientificName: "Capreolus capreolus",
    localizedNames: { fr: "Chevreuil européen", en: "Roe Deer" },
    group: "Mammifères",
    emoji: "🦌",
    family: "Cervidae",
    habitatHint: "Bocage, forêts mixtes, clairières.",
    activityHint: "Aube et crépuscule.",
    aliases: ["chevreuil", "roe deer", "capreolus capreolus"],
  },
  {
    vernacularName: "Chamois",
    scientificName: "Rupicapra rupicapra",
    localizedNames: { fr: "Chamois", en: "Chamois" },
    group: "Mammifères",
    emoji: "🦌",
    family: "Bovidae",
    habitatHint: "Pentes rocheuses, alpages et couloirs escarpés.",
    activityHint: "Matin, fin de journée, zones fraîches en été.",
    sensitivityLabel: "Espèce sensible au dérangement hivernal.",
    aliases: ["chamois des alpes", "rupicapra rupicapra"],
  },
  {
    vernacularName: "Bouquetin des Alpes",
    scientificName: "Capra ibex",
    localizedNames: { fr: "Bouquetin des Alpes", en: "Alpine Ibex" },
    group: "Mammifères",
    emoji: "🐐",
    family: "Bovidae",
    habitatHint: "Falaises, vires et pelouses alpines.",
    activityHint: "Journée, souvent sur zones minérales en altitude.",
    sensitivityLabel: "Garder une distance large, surtout avec les étagnes et jeunes.",
    aliases: ["bouquetin", "ibex", "alpine ibex", "capra ibex"],
  },
  {
    vernacularName: "Marmotte des Alpes",
    scientificName: "Marmota marmota",
    localizedNames: { fr: "Marmotte des Alpes", en: "Alpine Marmot" },
    group: "Mammifères",
    emoji: "🦫",
    family: "Sciuridae",
    habitatHint: "Alpages ouverts, talus et terriers bien exposés.",
    activityHint: "Journée hors hibernation, météo douce.",
    aliases: ["marmotte", "marmotte alpine", "alpine marmot", "marmota marmota"],
  },
  {
    vernacularName: "Sanglier",
    scientificName: "Sus scrofa",
    localizedNames: { fr: "Sanglier", en: "Wild Boar" },
    group: "Mammifères",
    emoji: "🐗",
    family: "Suidae",
    habitatHint: "Forêts, friches, cultures et zones humides.",
    activityHint: "Nuit et crépuscule.",
    aliases: ["wild boar", "sus scrofa"],
  },
  {
    vernacularName: "Renard roux",
    scientificName: "Vulpes vulpes",
    localizedNames: { fr: "Renard roux", en: "Red Fox" },
    group: "Mammifères",
    emoji: "🦊",
    family: "Canidae",
    habitatHint: "Très adaptable : bocage, montagne, lisières et zones urbaines.",
    activityHint: "Crépuscule, nuit, parfois journée en zones calmes.",
    aliases: ["renard", "fox", "red fox", "vulpes vulpes"],
  },
  {
    vernacularName: "Loup gris",
    scientificName: "Canis lupus",
    localizedNames: { fr: "Loup gris", en: "Gray Wolf" },
    group: "Mammifères",
    emoji: "🐺",
    family: "Canidae",
    habitatHint: "Grands massifs, forêts, piémonts et zones de passage.",
    activityHint: "Déplacements surtout nocturnes.",
    sensitivityLabel: "Donnée sensible : localisation à flouter largement.",
    aliases: ["loup", "wolf", "gray wolf", "grey wolf", "canis lupus"],
  },
  {
    vernacularName: "Lynx boréal",
    scientificName: "Lynx lynx",
    localizedNames: { fr: "Lynx boréal", en: "Eurasian Lynx" },
    group: "Mammifères",
    emoji: "🐈",
    family: "Felidae",
    habitatHint: "Forêts continues, reliefs boisés et secteurs tranquilles.",
    activityHint: "Crépuscule et nuit.",
    sensitivityLabel: "Donnée sensible : éviter les points précis.",
    aliases: ["lynx", "eurasian lynx", "lynx lynx"],
  },
  {
    vernacularName: "Ours brun",
    scientificName: "Ursus arctos",
    localizedNames: { fr: "Ours brun", en: "Brown Bear" },
    group: "Mammifères",
    emoji: "🐻",
    family: "Ursidae",
    habitatHint: "Forêts de montagne, estives, zones peu fréquentées.",
    activityHint: "Crépuscule et nuit.",
    sensitivityLabel: "Donnée très sensible : floutage fort recommandé.",
    aliases: ["ours", "brown bear", "ursus arctos"],
  },
  {
    vernacularName: "Blaireau européen",
    scientificName: "Meles meles",
    localizedNames: { fr: "Blaireau européen", en: "European Badger" },
    group: "Mammifères",
    emoji: "🦡",
    family: "Mustelidae",
    habitatHint: "Boisements, talus, prairies et haies.",
    activityHint: "Nuit, indices près des terriers.",
    aliases: ["blaireau", "badger", "european badger", "meles meles"],
  },
  {
    vernacularName: "Lièvre variable",
    scientificName: "Lepus timidus",
    localizedNames: { fr: "Lièvre variable", en: "Mountain Hare" },
    group: "Mammifères",
    emoji: "🐇",
    family: "Leporidae",
    habitatHint: "Landes alpines, éboulis et pelouses d'altitude.",
    activityHint: "Crépuscule et traces sur neige.",
    aliases: ["lievre variable", "lièvre", "mountain hare", "lepus timidus"],
  },
  {
    vernacularName: "Écureuil roux",
    scientificName: "Sciurus vulgaris",
    localizedNames: { fr: "Écureuil roux", en: "Red Squirrel" },
    group: "Mammifères",
    emoji: "🐿️",
    family: "Sciuridae",
    habitatHint: "Forêts de conifères, feuillus et parcs arborés.",
    activityHint: "Journée.",
    aliases: ["ecureuil", "écureuil", "red squirrel", "sciurus vulgaris"],
  },
  {
    vernacularName: "Hérisson d'Europe",
    scientificName: "Erinaceus europaeus",
    localizedNames: { fr: "Hérisson d'Europe", en: "European Hedgehog" },
    group: "Mammifères",
    emoji: "🦔",
    family: "Erinaceidae",
    habitatHint: "Jardins, haies, lisières et bocage.",
    activityHint: "Nuit, hors hibernation.",
    aliases: ["herisson", "hérisson", "european hedgehog", "erinaceus europaeus"],
  },
  {
    vernacularName: "Gypaète barbu",
    scientificName: "Gypaetus barbatus",
    localizedNames: { fr: "Gypaète barbu", en: "Bearded Vulture" },
    group: "Oiseaux",
    emoji: "🦅",
    family: "Accipitridae",
    habitatHint: "Hautes falaises, vallées alpines et grands reliefs.",
    activityHint: "Vols de prospection en journée.",
    sensitivityLabel: "Nidification sensible : ne pas publier de site précis.",
    aliases: ["gypaete", "gypaète", "bearded vulture", "gypaetus barbatus"],
  },
  {
    vernacularName: "Aigle royal",
    scientificName: "Aquila chrysaetos",
    localizedNames: { fr: "Aigle royal", en: "Golden Eagle" },
    group: "Oiseaux",
    emoji: "🦅",
    family: "Accipitridae",
    habitatHint: "Falaises, crêtes et grands versants ouverts.",
    activityHint: "Journée, ascendances thermiques.",
    sensitivityLabel: "Nidification sensible : rester à distance.",
    aliases: ["aigle", "golden eagle", "aquila chrysaetos"],
  },
  {
    vernacularName: "Vautour fauve",
    scientificName: "Gyps fulvus",
    localizedNames: { fr: "Vautour fauve", en: "Griffon Vulture" },
    group: "Oiseaux",
    emoji: "🦅",
    family: "Accipitridae",
    habitatHint: "Falaises, causses, vallées et grands reliefs.",
    activityHint: "Journée, vols planés en groupe.",
    aliases: ["vautour", "griffon vulture", "gyps fulvus"],
  },
  {
    vernacularName: "Faucon pèlerin",
    scientificName: "Falco peregrinus",
    localizedNames: { fr: "Faucon pèlerin", en: "Peregrine Falcon" },
    group: "Oiseaux",
    emoji: "🦅",
    family: "Falconidae",
    habitatHint: "Falaises, carrières, grands bâtiments.",
    activityHint: "Journée, chasse rapide en vol.",
    sensitivityLabel: "Nidification sensible sur falaises.",
    aliases: ["faucon", "peregrine falcon", "falco peregrinus"],
  },
  {
    vernacularName: "Grand-duc d'Europe",
    scientificName: "Bubo bubo",
    localizedNames: { fr: "Grand-duc d'Europe", en: "Eurasian Eagle-Owl" },
    group: "Oiseaux",
    emoji: "🦉",
    family: "Strigidae",
    habitatHint: "Falaises, carrières, combes rocheuses.",
    activityHint: "Crépuscule et nuit.",
    sensitivityLabel: "Nidification très sensible.",
    aliases: ["grand duc", "hibou grand duc", "eagle owl", "bubo bubo"],
  },
  {
    vernacularName: "Tétras lyre",
    scientificName: "Lyrurus tetrix",
    localizedNames: { fr: "Tétras lyre", en: "Black Grouse" },
    group: "Oiseaux",
    emoji: "🐦",
    family: "Phasianidae",
    habitatHint: "Lisières subalpines, landes à rhododendrons, clairières.",
    activityHint: "Parades matinales au printemps.",
    sensitivityLabel: "Très sensible au dérangement hivernal et sur places de chant.",
    aliases: ["tetras lyre", "tétras", "black grouse", "lyrurus tetrix", "tetrao tetrix"],
  },
  {
    vernacularName: "Grand tétras",
    scientificName: "Tetrao urogallus",
    localizedNames: { fr: "Grand tétras", en: "Western Capercaillie" },
    group: "Oiseaux",
    emoji: "🐦",
    family: "Phasianidae",
    habitatHint: "Vieilles forêts montagnardes claires.",
    activityHint: "Parades matinales, indices discrets.",
    sensitivityLabel: "Très sensible : zones de quiétude à respecter.",
    aliases: ["grand tetras", "capercaillie", "tetrao urogallus"],
  },
  {
    vernacularName: "Lagopède alpin",
    scientificName: "Lagopus muta",
    localizedNames: { fr: "Lagopède alpin", en: "Rock Ptarmigan" },
    group: "Oiseaux",
    emoji: "🐦",
    family: "Phasianidae",
    habitatHint: "Éboulis, crêtes et pelouses alpines.",
    activityHint: "Aube, traces et plumage mimétique.",
    sensitivityLabel: "Sensible au dérangement hivernal.",
    aliases: ["lagopede", "lagopède", "rock ptarmigan", "lagopus muta"],
  },
  {
    vernacularName: "Grive litorne",
    scientificName: "Turdus pilaris",
    localizedNames: { fr: "Grive litorne", en: "Fieldfare" },
    group: "Oiseaux",
    emoji: "🐦",
    family: "Turdidae",
    habitatHint: "Bocage, vergers, prairies, lisières et zones ouvertes arborées.",
    activityHint: "Souvent en groupes, surtout en migration et en hiver.",
    aliases: ["grive litorne", "fieldfare", "turdus pilaris"],
  },
  {
    vernacularName: "Pic épeiche",
    scientificName: "Dendrocopos major",
    localizedNames: { fr: "Pic épeiche", en: "Great Spotted Woodpecker" },
    group: "Oiseaux",
    emoji: "🐦",
    family: "Picidae",
    habitatHint: "Boisements, parcs, vergers et haies avec vieux arbres.",
    activityHint: "Tambourinage et cris en journée.",
    aliases: ["pic epeiche", "pic épeiche", "great spotted woodpecker", "dendrocopos major"],
  },
  {
    vernacularName: "Mésange bleue",
    scientificName: "Cyanistes caeruleus",
    localizedNames: { fr: "Mésange bleue", en: "Eurasian Blue Tit" },
    group: "Oiseaux",
    emoji: "🐦",
    family: "Paridae",
    habitatHint: "Boisements feuillus, jardins, haies et parcs.",
    activityHint: "Active en journée, souvent en petites bandes hors reproduction.",
    aliases: ["mesange bleue", "mésange bleue", "blue tit", "eurasian blue tit", "cyanistes caeruleus"],
  },
  {
    vernacularName: "Mésange charbonnière",
    scientificName: "Parus major",
    localizedNames: { fr: "Mésange charbonnière", en: "Great Tit" },
    group: "Oiseaux",
    emoji: "🐦",
    family: "Paridae",
    habitatHint: "Jardins, forêts, haies et parcs.",
    activityHint: "Chants fréquents dès la fin de l'hiver.",
    aliases: ["mesange charbonniere", "mésange charbonnière", "great tit", "parus major"],
  },
  {
    vernacularName: "Rougegorge familier",
    scientificName: "Erithacus rubecula",
    localizedNames: { fr: "Rougegorge familier", en: "European Robin" },
    group: "Oiseaux",
    emoji: "🐦",
    family: "Muscicapidae",
    habitatHint: "Jardins, haies, sous-bois et lisières.",
    activityHint: "Chant territorial, même en saison froide.",
    aliases: ["rougegorge", "rouge gorge", "european robin", "erithacus rubecula"],
  },
  {
    vernacularName: "Canard colvert",
    scientificName: "Anas platyrhynchos",
    localizedNames: { fr: "Canard colvert", en: "Mallard" },
    group: "Oiseaux",
    emoji: "🦆",
    family: "Anatidae",
    habitatHint: "Étangs, rivières, lacs, canaux et zones humides.",
    activityHint: "Visible toute la journée près de l'eau.",
    aliases: ["canard colvert", "colvert", "mallard", "anas platyrhynchos"],
  },
  {
    vernacularName: "Moineau domestique",
    scientificName: "Passer domesticus",
    localizedNames: { fr: "Moineau domestique", en: "House Sparrow" },
    group: "Oiseaux",
    emoji: "🐦",
    family: "Passeridae",
    habitatHint: "Villages, fermes, jardins et bâti humain.",
    activityHint: "Groupes bruyants en journée.",
    aliases: ["moineau", "moineau domestique", "house sparrow", "passer domesticus"],
  },
  {
    vernacularName: "Étourneau sansonnet",
    scientificName: "Sturnus vulgaris",
    localizedNames: { fr: "Étourneau sansonnet", en: "Common Starling" },
    group: "Oiseaux",
    emoji: "🐦",
    family: "Sturnidae",
    habitatHint: "Prairies, cultures, villes, vergers et parcs.",
    activityHint: "Groupes et dortoirs, surtout hors reproduction.",
    aliases: ["etourneau", "étourneau", "common starling", "sturnus vulgaris"],
  },
  {
    vernacularName: "Salamandre tachetée",
    scientificName: "Salamandra salamandra",
    localizedNames: { fr: "Salamandre tachetée", en: "Fire Salamander" },
    group: "Amphibiens",
    emoji: "🦎",
    family: "Salamandridae",
    habitatHint: "Forêts fraîches, sources et ruisselets.",
    activityHint: "Nuit humide, après pluie.",
    aliases: ["salamandre", "fire salamander", "salamandra salamandra"],
  },
  {
    vernacularName: "Grenouille rousse",
    scientificName: "Rana temporaria",
    localizedNames: { fr: "Grenouille rousse", en: "Common Frog" },
    group: "Amphibiens",
    emoji: "🐸",
    family: "Ranidae",
    habitatHint: "Mares, tourbières, prairies humides et forêts.",
    activityHint: "Printemps pour la reproduction, temps humide.",
    aliases: ["grenouille", "common frog", "rana temporaria"],
  },
  {
    vernacularName: "Triton alpestre",
    scientificName: "Ichthyosaura alpestris",
    localizedNames: { fr: "Triton alpestre", en: "Alpine Newt" },
    group: "Amphibiens",
    emoji: "🦎",
    family: "Salamandridae",
    habitatHint: "Mares forestières et plans d'eau frais.",
    activityHint: "Printemps et début d'été en phase aquatique.",
    aliases: ["triton", "alpine newt", "ichthyosaura alpestris", "triturus alpestris"],
  },
  {
    vernacularName: "Vipère aspic",
    scientificName: "Vipera aspis",
    localizedNames: { fr: "Vipère aspic", en: "Asp Viper" },
    group: "Reptiles",
    emoji: "🐍",
    family: "Viperidae",
    habitatHint: "Lisières sèches, murets, pierriers et landes.",
    activityHint: "Thermorégulation au soleil, éviter toute manipulation.",
    aliases: ["vipere", "vipère", "asp viper", "vipera aspis"],
  },
  {
    vernacularName: "Couleuvre helvétique",
    scientificName: "Natrix helvetica",
    localizedNames: { fr: "Couleuvre helvétique", en: "Barred Grass Snake" },
    group: "Reptiles",
    emoji: "🐍",
    family: "Natricidae",
    habitatHint: "Zones humides, rives, mares et prairies proches de l'eau.",
    activityHint: "Journée douce.",
    aliases: ["couleuvre", "grass snake", "natrix helvetica"],
  },
  {
    vernacularName: "Lézard des murailles",
    scientificName: "Podarcis muralis",
    localizedNames: { fr: "Lézard des murailles", en: "Common Wall Lizard" },
    group: "Reptiles",
    emoji: "🦎",
    family: "Lacertidae",
    habitatHint: "Murs, rochers, talus secs et ruines.",
    activityHint: "Journée ensoleillée.",
    aliases: ["lezard", "lézard", "wall lizard", "podarcis muralis"],
  },
  {
    vernacularName: "Apollon",
    scientificName: "Parnassius apollo",
    localizedNames: { fr: "Apollon", en: "Apollo Butterfly" },
    group: "Insectes",
    emoji: "🦋",
    family: "Papilionidae",
    habitatHint: "Pelouses et éboulis calcaires de montagne.",
    activityHint: "Journées chaudes et ensoleillées.",
    sensitivityLabel: "Espèce patrimoniale : éviter les stations précises.",
    aliases: ["papillon apollon", "parnassius apollo", "apollo butterfly"],
  },
  {
    vernacularName: "Machaon",
    scientificName: "Papilio machaon",
    localizedNames: { fr: "Machaon", en: "Old World Swallowtail" },
    group: "Insectes",
    emoji: "🦋",
    family: "Papilionidae",
    habitatHint: "Prairies fleuries, jardins, friches et pelouses.",
    activityHint: "Journées ensoleillées.",
    aliases: ["grand porte-queue", "papilio machaon", "swallowtail"],
  },
  {
    vernacularName: "Abeille domestique",
    scientificName: "Apis mellifera",
    localizedNames: { fr: "Abeille domestique", en: "Western Honey Bee" },
    group: "Insectes",
    emoji: "🐝",
    family: "Apidae",
    habitatHint: "Milieux fleuris, ruchers, lisières et jardins.",
    activityHint: "Journée, floraisons.",
    aliases: ["abeille", "honey bee", "apis mellifera"],
  },
  {
    vernacularName: "Coccinelle à sept points",
    scientificName: "Coccinella septempunctata",
    localizedNames: { fr: "Coccinelle à sept points", en: "Seven-spot Ladybird" },
    group: "Insectes",
    emoji: "🐞",
    family: "Coccinellidae",
    habitatHint: "Prairies, jardins, lisières et cultures.",
    activityHint: "Journée, végétation basse.",
    aliases: ["coccinelle", "coccinella septempunctata", "seven spot ladybird"],
  },
  {
    vernacularName: "Lucane cerf-volant",
    scientificName: "Lucanus cervus",
    localizedNames: { fr: "Lucane cerf-volant", en: "European Stag Beetle" },
    group: "Insectes",
    emoji: "🪲",
    family: "Lucanidae",
    habitatHint: "Vieilles forêts, haies avec bois mort, vergers anciens.",
    activityHint: "Soirées chaudes de juin-juillet.",
    sensitivityLabel: "Dépend du bois mort : ne pas perturber les microhabitats.",
    aliases: ["lucane", "cerf volant", "stag beetle", "lucanus cervus"],
  },
  {
    vernacularName: "Grande sauterelle verte",
    scientificName: "Tettigonia viridissima",
    localizedNames: { fr: "Grande sauterelle verte", en: "Great Green Bush-cricket" },
    group: "Insectes",
    emoji: "🦗",
    family: "Tettigoniidae",
    habitatHint: "Hautes herbes, friches, lisières et jardins.",
    activityHint: "Été, chants en fin de journée.",
    aliases: ["sauterelle", "tettigonia viridissima", "great green bush cricket"],
  },
  {
    vernacularName: "Libellule déprimée",
    scientificName: "Libellula depressa",
    localizedNames: { fr: "Libellule déprimée", en: "Broad-bodied Chaser" },
    group: "Insectes",
    emoji: "🪰",
    family: "Libellulidae",
    habitatHint: "Mares, étangs, fossés et points d'eau pionniers.",
    activityHint: "Journées chaudes près de l'eau.",
    aliases: ["libellule", "libellula depressa", "broad bodied chaser"],
  },
  {
    vernacularName: "Stéatode ponctuée",
    scientificName: "Steatoda bipunctata",
    localizedNames: { fr: "Stéatode ponctuée", en: "Rabbit Hutch Spider" },
    group: "Arachnides",
    emoji: "🕷️",
    family: "Theridiidae",
    habitatHint: "Bâtiments, abris, écorces et rochers, jusqu'en montagne.",
    activityHint: "Sur toile, souvent discrète dans les recoins.",
    aliases: [
      "steatoda bipunctata",
      "steatode ponctuée",
      "rabbit hutch spider",
      "false widow",
    ],
  },
  {
    vernacularName: "Épeire diadème",
    scientificName: "Araneus diadematus",
    localizedNames: { fr: "Épeire diadème", en: "European Garden Spider" },
    group: "Arachnides",
    emoji: "🕷️",
    family: "Araneidae",
    habitatHint: "Jardins, haies, lisières et chemins.",
    activityHint: "Fin d'été et automne, toiles orbiculaires.",
    aliases: ["epeire", "épeire", "araneus diadematus", "cross orbweaver"],
  },
  {
    vernacularName: "Tégénaire domestique",
    scientificName: "Eratigena atrica",
    localizedNames: { fr: "Tégénaire domestique", en: "Giant House Spider" },
    group: "Arachnides",
    emoji: "🕷️",
    family: "Agelenidae",
    habitatHint: "Maisons, caves, murets et abris.",
    activityHint: "Souvent visible en fin d'été et automne.",
    aliases: ["tegenaire", "tégénaire", "eratigena atrica", "house spider"],
  },
  {
    vernacularName: "Escargot de Bourgogne",
    scientificName: "Helix pomatia",
    localizedNames: { fr: "Escargot de Bourgogne", en: "Roman Snail" },
    group: "Mollusques",
    emoji: "🐌",
    family: "Helicidae",
    habitatHint: "Lisières, haies, prairies calcaires et jardins.",
    activityHint: "Temps humide.",
    aliases: ["escargot", "helix pomatia", "roman snail"],
  },
  {
    vernacularName: "Écrevisse à pattes blanches",
    scientificName: "Austropotamobius pallipes",
    localizedNames: { fr: "Écrevisse à pattes blanches", en: "White-clawed Crayfish" },
    group: "Crustacés",
    emoji: "🦞",
    family: "Astacidae",
    habitatHint: "Ruisseaux frais, oxygénés et peu pollués.",
    activityHint: "Nuit, prospection discrète.",
    sensitivityLabel: "Espèce sensible : ne pas manipuler ni déplacer.",
    aliases: ["ecrevisse", "écrevisse", "austropotamobius pallipes", "white clawed crayfish"],
  },

  // --- MARINS ---
  {
    vernacularName: "Orque",
    scientificName: "Orcinus orca",
    localizedNames: { fr: "Orque", en: "Orca" },
    group: "Mammifères marins",
    emoji: "🐋",
    family: "Delphinidae",
    habitatHint: "Océans du monde entier, souvent près des côtes.",
    activityHint: "Chasse en groupe, très social.",
    aliases: ["orca", "killer whale", "epaulard", "épaulard"],
  },
  {
    vernacularName: "Dauphin commun",
    scientificName: "Delphinus delphis",
    localizedNames: { fr: "Dauphin commun", en: "Common Dolphin" },
    group: "Mammifères marins",
    emoji: "🐬",
    family: "Delphinidae",
    habitatHint: "Eaux tempérées et tropicales.",
    activityHint: "Sauts fréquents, suit souvent les navires.",
    aliases: ["dolphin", "common dolphin"],
  },
  {
    vernacularName: "Baleine bleue",
    scientificName: "Balaenoptera musculus",
    localizedNames: { fr: "Baleine bleue", en: "Blue Whale" },
    group: "Mammifères marins",
    emoji: "🐋",
    family: "Balaenopteridae",
    habitatHint: "Eaux pélagiques, migrations saisonnières.",
    activityHint: "S'alimente par filtration près de la surface.",
    aliases: ["blue whale"],
  },
  {
    vernacularName: "Grand requin blanc",
    scientificName: "Carcharodon carcharias",
    localizedNames: { fr: "Grand requin blanc", en: "Great White Shark" },
    group: "Poissons",
    emoji: "🦈",
    family: "Lamnidae",
    habitatHint: "Eaux côtières tempérées.",
    activityHint: "Super-prédateur, observation à distance de sécurité.",
    aliases: ["requin blanc", "great white shark"],
  },
  {
    vernacularName: "Tortue verte",
    scientificName: "Chelonia mydas",
    localizedNames: { fr: "Tortue verte", en: "Green Sea Turtle" },
    group: "Reptiles",
    emoji: "🐢",
    family: "Cheloniidae",
    habitatHint: "Récifs coralliens et herbiers marins.",
    activityHint: "Ponte sur les plages de sable.",
    aliases: ["tortue marine", "green turtle", "sea turtle"],
  },
  {
    vernacularName: "Poisson-clown",
    scientificName: "Amphiprion ocellaris",
    localizedNames: { fr: "Poisson-clown", en: "Clownfish" },
    group: "Poissons",
    emoji: "🐠",
    family: "Pomacentridae",
    habitatHint: "Anémones de mer dans les récifs coralliens.",
    activityHint: "Symbiose avec les anémones.",
    aliases: ["nemo", "clownfish"],
  },
  {
    vernacularName: "Baleine à bosse",
    scientificName: "Megaptera novaeangliae",
    localizedNames: { fr: "Baleine à bosse", en: "Humpback Whale" },
    group: "Mammifères marins",
    emoji: "🐋",
    family: "Balaenopteridae",
    habitatHint: "Zones côtières et pélagiques, migrations lointaines.",
    activityHint: "Sauts spectaculaires et chants complexes.",
    aliases: ["humpback whale", "megaptere", "mégaptère"],
  },
  {
    vernacularName: "Cachalot",
    scientificName: "Physeter macrocephalus",
    localizedNames: { fr: "Cachalot", en: "Sperm Whale" },
    group: "Mammifères marins",
    emoji: "🐋",
    family: "Physeteridae",
    habitatHint: "Eaux profondes, canyons sous-marins.",
    activityHint: "Plongées records à la recherche de calmars géants.",
    aliases: ["sperm whale", "physeter"],
  },
  {
    vernacularName: "Raie manta",
    scientificName: "Manta birostris",
    localizedNames: { fr: "Raie manta", en: "Manta Ray" },
    group: "Poissons",
    emoji: "🐟",
    family: "Mobulidae",
    habitatHint: "Eaux tropicales et tempérées chaudes.",
    activityHint: "Nage gracieuse en pleine eau.",
    aliases: ["manta ray"],
  },
  {
    vernacularName: "Pieuvre géante du Pacifique",
    scientificName: "Enteroctopus dofleini",
    localizedNames: { fr: "Pieuvre géante du Pacifique", en: "Giant Pacific Octopus" },
    group: "Mollusques",
    emoji: "🐙",
    family: "Octopodidae",
    habitatHint: "Fonds rocheux et récifs jusqu'à 2000m.",
    aliases: ["octopus", "giant octopus", "pieuvre"],
  },
  {
    vernacularName: "Méduse lune",
    scientificName: "Aurelia aurita",
    localizedNames: { fr: "Méduse lune", en: "Moon Jellyfish" },
    group: "Cnidaires",
    emoji: "🪼",
    family: "Ulmaridae",
    habitatHint: "Eaux côtières peu profondes.",
    aliases: ["jellyfish", "meduse"],
  },

  // --- MONDE ---
  {
    vernacularName: "Lion",
    scientificName: "Panthera leo",
    localizedNames: { fr: "Lion", en: "Lion" },
    group: "Mammifères",
    emoji: "🦁",
    family: "Felidae",
    habitatHint: "Savanes et plaines herbeuses.",
    activityHint: "Actif à l'aube et au crépuscule.",
    aliases: ["lion", "king of the jungle"],
  },
  {
    vernacularName: "Éléphant d'Afrique",
    scientificName: "Loxodonta africana",
    localizedNames: { fr: "Éléphant d'Afrique", en: "African Elephant" },
    group: "Mammifères",
    emoji: "🐘",
    family: "Elephantidae",
    habitatHint: "Savanes, forêts et déserts.",
    activityHint: "Déplacements constants pour se nourrir.",
    aliases: ["elephant", "éléphant"],
  },
  {
    vernacularName: "Tigre",
    scientificName: "Panthera tigris",
    localizedNames: { fr: "Tigre", en: "Tiger" },
    group: "Mammifères",
    emoji: "🐯",
    family: "Felidae",
    habitatHint: "Forêts denses, mangroves, savanes.",
    aliases: ["tiger"],
  },
  {
    vernacularName: "Panda géant",
    scientificName: "Ailuropoda melanoleuca",
    localizedNames: { fr: "Panda géant", en: "Giant Panda" },
    group: "Mammifères",
    emoji: "🐼",
    family: "Ursidae",
    habitatHint: "Forêts de bambous en altitude.",
    activityHint: "Passe beaucoup de temps à manger du bambou.",
    aliases: ["panda"],
  },
  {
    vernacularName: "Gorille",
    scientificName: "Gorilla gorilla",
    localizedNames: { fr: "Gorille", en: "Gorilla" },
    group: "Mammifères",
    emoji: "🦍",
    family: "Hominidae",
    habitatHint: "Forêts tropicales et plaines marécageuses.",
    aliases: ["gorilla"],
  },
  {
    vernacularName: "Girafe",
    scientificName: "Giraffa camelopardalis",
    localizedNames: { fr: "Girafe", en: "Giraffe" },
    group: "Mammifères",
    emoji: "🦒",
    family: "Giraffidae",
    habitatHint: "Savanes arborées.",
    aliases: ["giraffe"],
  },
  {
    vernacularName: "Koala",
    scientificName: "Phascolarctos cinereus",
    localizedNames: { fr: "Koala", en: "Koala" },
    group: "Mammifères",
    emoji: "🐨",
    family: "Phascolarctidae",
    habitatHint: "Forêts d'eucalyptus.",
    aliases: ["koala"],
  },
  {
    vernacularName: "Kangourou",
    scientificName: "Macropodidae",
    localizedNames: { fr: "Kangourou", en: "Kangaroo" },
    group: "Mammifères",
    emoji: "🦘",
    family: "Macropodidae",
    habitatHint: "Prairies, savanes et forêts claires.",
    aliases: ["kangaroo"],
  },

  // --- FLORE ---
  {
    vernacularName: "Tournesol",
    scientificName: "Helianthus annuus",
    localizedNames: { fr: "Tournesol", en: "Sunflower" },
    group: "Flore",
    emoji: "🌻",
    family: "Asteraceae",
    habitatHint: "Champs ensoleillés et jardins.",
    activityHint: "Héliotropisme (suit le soleil).",
    aliases: ["soleil", "sunflower"],
  },
  {
    vernacularName: "Lavande",
    scientificName: "Lavandula angustifolia",
    localizedNames: { fr: "Lavande", en: "Lavender" },
    group: "Flore",
    emoji: "🪻",
    family: "Lamiaceae",
    habitatHint: "Coteaux ensoleillés, sols drainés.",
    activityHint: "Floraison estivale odorante.",
    aliases: ["lavender"],
  },
  {
    vernacularName: "Rose",
    scientificName: "Rosa",
    localizedNames: { fr: "Rose", en: "Rose" },
    group: "Flore",
    emoji: "🌹",
    family: "Rosaceae",
    habitatHint: "Jardins, lisières, friches.",
    aliases: ["rose"],
  },
  {
    vernacularName: "Coquelicot",
    scientificName: "Papaver rhoeas",
    localizedNames: { fr: "Coquelicot", en: "Common Poppy" },
    group: "Flore",
    emoji: "🌺",
    family: "Papaveraceae",
    habitatHint: "Champs, bords de routes, friches.",
    aliases: ["poppy"],
  },
  {
    vernacularName: "Chêne pédonculé",
    scientificName: "Quercus robur",
    localizedNames: { fr: "Chêne pédonculé", en: "English Oak" },
    group: "Flore",
    emoji: "🌳",
    family: "Fagaceae",
    habitatHint: "Forêts de feuillus, plaines et collines.",
    aliases: ["oak", "chene", "chêne"],
  },

  // --- CRISTAUX ---
  {
    vernacularName: "Améthyste",
    scientificName: "Quartz violet",
    localizedNames: { fr: "Améthyste", en: "Amethyst" },
    group: "Cristaux",
    emoji: "💜",
    family: "Silicates",
    habitatHint: "Géodes volcaniques et filons hydrothermaux.",
    aliases: ["amethyst"],
  },
  {
    vernacularName: "Malachite",
    scientificName: "Carbonate de cuivre",
    localizedNames: { fr: "Malachite", en: "Malachite" },
    group: "Cristaux",
    emoji: "🟢",
    family: "Carbonates",
    habitatHint: "Zones d'oxydation des gisements de cuivre.",
    aliases: ["malachite"],
  },
  {
    vernacularName: "Quartz rose",
    scientificName: "Quartz rose",
    localizedNames: { fr: "Quartz rose", en: "Rose Quartz" },
    group: "Cristaux",
    emoji: "🩷",
    family: "Silicates",
    habitatHint: "Pegmatites et filons de quartz.",
    aliases: ["rose quartz"],
  },
  {
    vernacularName: "Pyrite",
    scientificName: "Sulfure de fer",
    localizedNames: { fr: "Pyrite", en: "Pyrite" },
    group: "Cristaux",
    emoji: "✨",
    family: "Sulfures",
    habitatHint: "Roches diverses, souvent en cubes parfaits.",
    aliases: ["or des fous", "fool's gold"],
  },

  // --- NOUVEAUX MONDE & MARINS ---
  {
    vernacularName: "Hippopotame",
    scientificName: "Hippopotamus amphibius",
    localizedNames: { fr: "Hippopotame", en: "Hippopotamus" },
    group: "Mammifères",
    emoji: "🦛",
    family: "Hippopotamidae",
    habitatHint: "Rivières et lacs d'Afrique.",
    aliases: ["hippo"],
  },
  {
    vernacularName: "Rhinocéros",
    scientificName: "Rhinocerotidae",
    localizedNames: { fr: "Rhinocéros", en: "Rhinoceros" },
    group: "Mammifères",
    emoji: "🦏",
    family: "Rhinocerotidae",
    habitatHint: "Savanes et forêts tropicales.",
    aliases: ["rhino"],
  },
  {
    vernacularName: "Zèbre",
    scientificName: "Equus quagga",
    localizedNames: { fr: "Zèbre", en: "Zebra" },
    group: "Mammifères",
    emoji: "🦓",
    family: "Equidae",
    habitatHint: "Savanes d'Afrique.",
    aliases: ["zebra"],
  },
  {
    vernacularName: "Caméléon",
    scientificName: "Chamaeleonidae",
    localizedNames: { fr: "Caméléon", en: "Chameleon" },
    group: "Reptiles",
    emoji: "🦎",
    family: "Chamaeleonidae",
    habitatHint: "Forêts et zones arbustives.",
    activityHint: "Capable de changer de couleur pour se camoufler.",
    aliases: ["chameleon"],
  },
  {
    vernacularName: "Manchot",
    scientificName: "Sphenisciformes",
    localizedNames: { fr: "Manchot", en: "Penguin" },
    group: "Oiseaux",
    emoji: "🐧",
    family: "Spheniscidae",
    habitatHint: "Hémisphère sud, souvent en Antarctique.",
    aliases: ["penguin"],
  },
  {
    vernacularName: "Ours polaire",
    scientificName: "Ursus maritimus",
    localizedNames: { fr: "Ours polaire", en: "Polar Bear" },
    group: "Mammifères",
    emoji: "🐻‍❄️",
    family: "Ursidae",
    habitatHint: "Banquise de l'Arctique.",
    aliases: ["polar bear"],
  },
  {
    vernacularName: "Otarie",
    scientificName: "Otariinae",
    localizedNames: { fr: "Otarie", en: "Sea Lion" },
    group: "Mammifères marins",
    emoji: "🦭",
    family: "Otariidae",
    habitatHint: "Zones côtières.",
    aliases: ["sea lion"],
  },
  {
    vernacularName: "Espadon",
    scientificName: "Xiphias gladius",
    localizedNames: { fr: "Espadon", en: "Swordfish" },
    group: "Poissons",
    emoji: "🐟",
    family: "Xiphiidae",
    habitatHint: "Eaux tropicales et tempérées du monde entier.",
    aliases: ["swordfish"],
  },
];

export function normalizeSpeciesText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function searchableValues(species: AnimalSpecies) {
  return [
    species.vernacularName,
    species.scientificName,
    ...Object.values(species.localizedNames ?? {}),
    species.group,
    species.family,
    ...species.aliases,
  ]
    .filter(Boolean)
    .map((value) => normalizeSpeciesText(String(value)));
}

export function getLocalizedAnimalName(species: AnimalSpecies, locale: SpeciesLocale = "fr") {
  return species.localizedNames?.[locale] ?? species.vernacularName;
}

export function getFrenchTaxonName(scientificName?: string | null) {
  if (!scientificName) return undefined;
  const normalized = normalizeSpeciesText(scientificName);
  const exact = Object.entries(FRENCH_TAXON_NAMES).find(
    ([taxon]) => normalizeSpeciesText(taxon) === normalized
  );
  return exact?.[1];
}

export function findAnimalSpecies(value?: string | null) {
  if (!value) return undefined;
  const query = normalizeSpeciesText(value);
  if (!query) return undefined;

  return ANIMAL_SPECIES.find((species) =>
    searchableValues(species).some((candidate) => candidate === query)
  );
}

export function findBestAnimalSuggestion(value?: string | null) {
  if (!value) return undefined;
  const query = normalizeSpeciesText(value);
  if (query.length < 2) return undefined;

  return ANIMAL_SPECIES.find((species) =>
    searchableValues(species).some((candidate) => candidate.startsWith(query))
  );
}

export function getAnimalSuggestions(value: string, limit = 8) {
  const query = normalizeSpeciesText(value);
  if (query.length < 2) return [];

  return ANIMAL_SPECIES.filter((species) =>
    searchableValues(species).some((candidate) => candidate.includes(query))
  ).slice(0, limit);
}

export function getAnimalGroupEmoji(group?: string | null) {
  if (!group) return "🐾";
  return GROUP_EMOJIS[normalizeSpeciesText(group)] ?? "🐾";
}

export function getAnimalEmoji(input: {
  vernacularName?: string | null;
  scientificName?: string | null;
  group?: string | null;
}) {
  const match =
    findAnimalSpecies(input.scientificName) ??
    findAnimalSpecies(input.vernacularName);

  return match?.emoji ?? getAnimalGroupEmoji(input.group);
}

export const FLORA_METADATA: Record<string, { habitat: string; flowering: string; family?: string }> = {
  "Edelweiss": {
    habitat: "Pelouses alpines calcaires, fissures de rochers entre 1500m et 3000m.",
    flowering: "Juillet à Septembre.",
    family: "Asteraceae"
  },
  "Génépi": {
    habitat: "Moraines, éboulis stabilisés et falaises de haute altitude.",
    flowering: "Juillet et Août.",
    family: "Asteraceae"
  },
  "Sabot de Vénus": {
    habitat: "Sous-bois clairs de pins ou hêtres, sur sols calcaires frais.",
    flowering: "Mai à Juillet.",
    family: "Orchidaceae"
  },
  "Gentiane jaune": {
    habitat: "Prairies et pâturages montagnards, sols profonds.",
    flowering: "Juin à Août (ne fleurit qu'après 10 ans).",
    family: "Gentianaceae"
  },
  "Chardon bleu des Alpes": {
    habitat: "Mégalithiques, éboulis frais et riches en azote.",
    flowering: "Juillet à Septembre.",
    family: "Apiaceae"
  },
  "Lys martagon": {
    habitat: "Forêts de montagne fraîches, mégaphorbiaies.",
    flowering: "Juin à Août.",
    family: "Liliaceae"
  },
  "Célastre asiatique": {
    habitat: "Lisières forestières, friches et jardins, très adaptable (invasive).",
    flowering: "Mai-Juin, baies rouges décoratives en automne.",
    family: "Celastraceae"
  }
};

export const CRYSTAL_METADATA: Record<string, { formation: string; habitat: string }> = {
  "Quartz fumé": {
    formation: "Cristallisation lente dans les fissures de granite (fours).",
    habitat: "Massifs cristallins, fissures alpines."
  },
  "Fluorine violette": {
    formation: "Dépôts hydrothermaux dans les veines basse température.",
    habitat: "Filonnages métallifères, zones de failles."
  },
  "Marmotte": {
     habitat: "Éboulis et prairies d'altitude.",
     formation: "Mammifère fouisseur."
  }
};

export function standardizeAnySpecies(input: {
  category: Category;
  vernacularName?: string | null;
  scientificName?: string | null;
  fallbackName?: string | null;
  group?: string | null;
  family?: string | null;
}) {
  const name = input.scientificName || input.vernacularName || input.fallbackName || "";

  if (input.category === "faune") {
    return standardizeAnimalSpecies({
      scientificName: input.scientificName,
      vernacularName: input.vernacularName,
      fallbackName: input.fallbackName,
      group: input.group,
      family: input.family
    });
  }

  if (input.category === "flore") {
    const meta = FLORA_METADATA[name] || 
                 Object.entries(FLORA_METADATA).find(([k]) => name.includes(k))?.[1];
    
    return {
      vernacularName: name,
      scientificName: input.scientificName || undefined,
      group: "Flore",
      emoji: "🌿",
      family: meta?.family || undefined,
      habitatHint: meta?.habitat || "Milieux montagnards variés.",
      activityHint: meta?.flowering || "Floraison printanière ou estivale.",
      sensitivityLabel: undefined,
    };
  }

  if (input.category === "cristal") {
    const meta = CRYSTAL_METADATA[name] || 
                 Object.entries(CRYSTAL_METADATA).find(([k]) => name.includes(k))?.[1];

    return {
      vernacularName: name,
      scientificName: undefined,
      group: "Minéralogy",
      emoji: "💎",
      family: undefined,
      habitatHint: meta?.habitat || "Zones de roches métamorphiques ou ignées.",
      activityHint: meta?.formation || "Formation géologique lente.",
      sensitivityLabel: undefined,
    };
  }

  return {
    vernacularName: name,
    scientificName: undefined,
    group: undefined,
    emoji: "🔍",
    family: undefined,
    habitatHint: undefined,
    activityHint: undefined,
    sensitivityLabel: undefined,
  };
}

export function standardizeAnimalSpecies(input: {
  vernacularName?: string | null;
  scientificName?: string | null;
  fallbackName?: string | null;
  group?: string | null;
  family?: string | null;
}) {
  const match =
    findAnimalSpecies(input.scientificName) ??
    findAnimalSpecies(input.vernacularName) ??
    findAnimalSpecies(input.fallbackName) ??
    findBestAnimalSuggestion(input.fallbackName);

  if (!match) {
    const frenchName = getFrenchTaxonName(input.scientificName) ?? getFrenchTaxonName(input.fallbackName);
    const fallback =
      frenchName ??
      input.vernacularName ??
      input.fallbackName ??
      input.scientificName ??
      "Espèce non identifiée";

    return {
      vernacularName: fallback,
      scientificName: input.scientificName ?? undefined,
      group: input.group ?? undefined,
      emoji: getAnimalGroupEmoji(input.group),
      family: input.family ?? undefined,
      habitatHint: "Milieux sauvages divers.",
      activityHint: "Inconnu (donnée à compléter).",
      sensitivityLabel: undefined,
    };
  }

  return {
    vernacularName: getLocalizedAnimalName(match, "fr"),
    scientificName: match.scientificName,
    localizedNames: match.localizedNames,
    group: match.group,
    emoji: match.emoji,
    family: match.family ?? input.family ?? undefined,
    habitatHint: match.habitatHint || "Milieux sauvages préservés.",
    activityHint: match.activityHint || "Inconnu (donnée à compléter).",
    sensitivityLabel: match.sensitivityLabel,
  };
}
