/* (c) 2026 - Loris Dc - WildEye Project */
import { Category, Observation } from "./types";
import { standardizeAnySpecies } from "./species-catalog";

/**
 * Generates realistic demo observations spread across the French Alps,
 * Pyrénées, Massif Central, Vosges, and Corsica.
 */

const SPECIES: Record<Category, { name: string; desc: string }[]> = {
  cristal: [
    { name: "Quartz fumé", desc: "Magnifique échantillon de quartz fumé trouvé en altitude dans une fissure de granite." },
    { name: "Fluorine violette", desc: "Cristaux de fluorine d'un violet intense avec reflets verts." },
    { name: "Sidérite", desc: "Nodule de sidérite à patine dorée dans un filon de calcite." },
    { name: "Anatase", desc: "Micro-cristaux d'anatase bleu acier en placette sur quartz." },
    { name: "Axinite", desc: "Cristaux tabulaires d'axinite brune, typiques du Dauphiné." },
    { name: "Grenat almandin", desc: "Grenats rouge sombre dans les micaschistes de haute altitude." },
    { name: "Épidote", desc: "Amas d'épidote vert pistache dans une zone de faille." },
    { name: "Adulaire", desc: "Cristaux transparents d'adulaire dans une cavité alpine." },
    { name: "Améthyste", desc: "Quartz violet dans une géode liée aux terrains volcaniques." },
    { name: "Calcite", desc: "Cristaux rhomboédriques translucides sur gangue calcaire." },
  ],
  faune: [
    { name: "Chamois des Alpes", desc: "Individu agile repéré sur une crête rocheuse escarpée au lever du jour." },
    { name: "Mouflon de Corse", desc: "Groupe broutant paisiblement dans la zone centrale du parc." },
    { name: "Bouquetin des Alpes", desc: "Mâle adulte avec de magnifiques cornes recourbées, observé au repos." },
    { name: "Gypaète barbu", desc: "En vol plané au-dessus de la crête, envergure impressionnante." },
    { name: "Marmotte alpine", desc: "Sentinelle postée sur un rocher sifflant pour alerter la colonie." },
    { name: "Aigle royal", desc: "Couple nicheur repéré sur une falaise inaccessible." },
    { name: "Hermine", desc: "En pelage de transition, observée chassant dans les éboulis." },
  ],
  flore: [
    { name: "Edelweiss", desc: "Station de Leontopodium alpinum sur un replat calcaire exposé sud." },
    { name: "Sabot de Vénus", desc: "Orchidée rare en lisière de forêt de pins. Floraison exceptionnelle." },
    { name: "Gentiane jaune", desc: "Population dense de Gentiana lutea en alpage." },
    { name: "Chardon bleu des Alpes", desc: "Eryngium alpinum en pleine floraison bleue métallique." },
    { name: "Androsace des Alpes", desc: "Coussinet d'Androsace alpina à 2800m, floraison rose." },
    { name: "Génépi", desc: "Artemisia glacialis dans les moraines de haute altitude." },
    { name: "Rhododendron ferrugineux", desc: "Vaste étendue de rhododendron en fleur, tapis carminé." },
    { name: "Lys martagon", desc: "Lilium martagon en sous-bois clair, fleurs turban roses." },
    { name: "Célastre asiatique", desc: "Plante grimpante vigoureuse repérée en lisière, étouffant la végétation locale." },
  ],
};

const LOCATIONS: { name: string; lng: number; lat: number; spread: number }[] = [
  // Alpes du Nord
  { name: "Chamonix", lng: 6.87, lat: 45.92, spread: 0.15 },
  { name: "Vanoise", lng: 6.85, lat: 45.35, spread: 0.2 },
  { name: "Belledonne", lng: 5.98, lat: 45.15, spread: 0.12 },
  { name: "Écrins", lng: 6.35, lat: 44.95, spread: 0.25 },
  { name: "Beaufortain", lng: 6.6, lat: 45.7, spread: 0.1 },
  // Alpes du Sud
  { name: "Mercantour", lng: 7.15, lat: 44.1, spread: 0.2 },
  { name: "Queyras", lng: 6.8, lat: 44.7, spread: 0.15 },
  // Pyrénées
  { name: "Gavarnie", lng: -0.01, lat: 42.73, spread: 0.1 },
  { name: "Canigou", lng: 2.45, lat: 42.52, spread: 0.15 },
  // Autres
  { name: "Chaîne des Puys", lng: 2.97, lat: 45.77, spread: 0.1 },
  { name: "Ballons des Vosges", lng: 7.0, lat: 48.0, spread: 0.15 },
  { name: "Corse du Sud", lng: 9.15, lat: 41.85, spread: 0.2 },
];

function seededRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateDemoData(): Observation[] {
  const rand = seededRandom(42);
  const observations: Observation[] = [];
  const categories: Category[] = ["cristal", "faune", "flore"];

  for (let i = 0; i < 150; i++) {
    const cat = categories[Math.floor(rand() * categories.length)];
    const speciesList = SPECIES[cat];
    const species = speciesList[Math.floor(rand() * speciesList.length)];
    const loc = LOCATIONS[Math.floor(rand() * LOCATIONS.length)];
    
    const profile = standardizeAnySpecies({
      category: cat,
      fallbackName: species.name,
    });

    const lng = loc.lng + (rand() - 0.5) * loc.spread * 2;
    const lat = loc.lat + (rand() - 0.5) * loc.spread * 2;

    // Blurred coords
    const blurOffset = 0.003 + rand() * 0.002;
    const blurAngle = rand() * Math.PI * 2;

    // Dates: Spread over 5 years (1825 days)
    const maxDays = 365 * 5;
    const observedDaysAgo = Math.floor(rand() * maxDays);
    const observedDate = new Date();
    observedDate.setDate(observedDate.getDate() - observedDaysAgo);

    const publishDelayDays = Math.floor(rand() * 21);
    const createdDate = new Date(observedDate);
    createdDate.setDate(createdDate.getDate() + publishDelayDays);
    const now = new Date();
    if (createdDate > now) createdDate.setTime(now.getTime());

    observations.push({
      id: `demo-${i.toString().padStart(3, "0")}`,
      observed_at: observedDate.toISOString(),
      created_at: createdDate.toISOString(),
      category: cat,
      species_name: profile?.vernacularName ?? species.name,
      common_name: profile?.vernacularName,
      description: `${species.desc} — ${loc.name}.`,
      longitude: lng,
      latitude: lat,
      longitude_blurred: lng + Math.cos(blurAngle) * blurOffset,
      latitude_blurred: lat + Math.sin(blurAngle) * blurOffset,
      photo_url: null,
      user_id: "demo-user",
      source_name: "Démonstration",
      source_kind: "demo",
      location_name: loc.name,
      scientific_name: cat === "cristal" ? profile?.scientificName : (profile as any)?.scientificName,
      animal_group: (profile as any)?.group,
      animal_emoji: profile?.emoji,
      habitat_hint: profile?.habitatHint,
      activity_hint: profile?.activityHint,
      sensitivity_label: (profile as any)?.sensitivityLabel,
      family: (profile as any)?.family,
      quality_label: "Donnée synthétique non vérifiée",
      verification_label: "Démonstration locale basée sur des modèles réels.",
      crystal_system: cat === "cristal" ? ["Cubi", "Tétrago", "Hexago", "Rhombo", "Ortho", "Monocli", "Tricli"][Math.floor(rand() * 7)] + "nal" : undefined,
      luster: cat === "cristal" ? ["Vitreux", "Gras", "Adamantin", "Métallique"][Math.floor(rand() * 4)] : undefined,
      hardness: cat === "cristal" ? (rand() * 7 + 2).toFixed(1) : undefined,
      associated_minerals: cat === "cristal" ? "Quartz, Calcite, Sidérite" : undefined,
    });
  }

  return observations.sort(
    (a, b) =>
      new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime()
  );
}
