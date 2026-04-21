# 🏔️ WildEye : L'Observatoire National du Sauvage

> **Plateforme communautaire de cartographie haute performance pour la minéralogie, la faune et la flore en France.**

---

## 🎯 1. Vision & Objectifs
**WildEye** est une *Progressive Web App* (PWA) conçue pour les passionnés de montagne et de nature. Elle permet d'allier la précision de la donnée géologique à la magie de l'observation sauvage, tout en garantissant une expérience utilisateur fluide sur le terrain.

* **💎 Minéralogie :** Indexation des gisements et partage de trouvailles (Quartz, Fluorines, etc.).
* **🦌 Faune Sauvage :** Partage d'observations (Chamois, Bouquetins, Gypaètes) sans dérangement.
* **🌿 Flore Remarquable :** Recensement de spécimens rares (Edelweiss, Sabot de Vénus).

---

## 🛠️ 2. Stack Technique (Performance First)

L'application est bâtie sur une architecture **"Edge-Ready"** pour garantir une réactivité maximale, même en conditions de réseau dégradé.

| Couche | Technologie | Rôle & Justification |
| :--- | :--- | :--- |
| **Frontend** | `Next.js 14+` | App Router pour un rendu hybride et une navigation instantanée. |
| **Cartographie** | `Mapbox GL JS` | Moteur WebGL pour le rendu 3D du relief à 60 FPS. |
| **Style Carte** | `Mapbox Outdoors` | Optimisé pour la lecture des courbes de niveau et sentiers IGN. |
| **Backend** | `Supabase` | PostgreSQL + PostGIS pour la puissance des requêtes spatiales. |
| **State** | `Zustand` | Gestion légère de l'état global et des filtres de recherche. |
| **Images** | `Cloudinary` | Pipeline d'optimisation automatique des photos de terrain. |

---

## 🌐 3. Architecture des Données & API

### A. Sources de Données Officielles
* **BRGM (InfoTerre) :** Couches géologiques vectorisées pour identifier les zones de prospection.
* **INPN (OpenObs) :** Données sur les zones de protection (Natura 2000, Parcs Nationaux).
* **IGN :** Altimétrie précise pour le positionnement 3D des observations.

### B. Schéma de Base de Données (PostGIS)
```sql
CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  category VARCHAR(20) CHECK (category IN ('cristal', 'faune', 'flore')),
  species_name VARCHAR(100),
  description TEXT,
  -- Coordonnées précises (Privé)
  geom GEOGRAPHY(POINT, 4326) NOT NULL, 
  -- Coordonnées floutées pour la communauté (Public)
  geom_blurred GEOGRAPHY(POINT, 4326), 
  photo_url TEXT,
  user_id UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_obs_geom ON observations USING GIST (geom);

✨ 4. Fonctionnalités Clés & UX
🚀 Performance "Zero Latence"
Vector Tiling : Utilisation de tuiles vectorielles pour un affichage massif de points sans ralentissement.

Clustering Géographique : Regroupement intelligent des icônes selon le niveau de zoom.

🛡️ Éthique & Confidentialité
Floutage Dynamique : Algorithme de décalage aléatoire (300m - 500m) des points publics pour protéger les gisements et la tranquillité de la faune.

Zones Sensibles : Système d'alerte contextuel si l'utilisateur saisit une donnée dans une réserve intégrale.

📶 Mode "Off-the-Grid"
Offline First : Cache des tuiles cartographiques via Service Workers.

Sync Background : Mise en file d'attente des publications lors des zones blanches (sans réseau).

🏗️ 5. Guide d'Implémentation
Étape 1 : Initialisation de la Scène 3D
JavaScript
// Activation du terrain 3D réel
map.on('load', () => {
  map.addSource('mapbox-dem', {
    'type': 'raster-dem',
    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1'
  });
  map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.2 });
});
Étape 2 : Filtrage Instantané
Implémentation d'une interface de filtrage par "Layers" Mapbox pour masquer/afficher les catégories (Faune/Flore/Cristaux) sans re-render de la carte.

Étape 3 : Workflow de Contribution
Capture : Extraction automatique de la position via GPS Mobile.

Compression : Réduction de la taille de l'image (Canvas API) avant l'upload.

Validation : Vérification des zones de protection via l'API INPN.

📈 6. Indicateurs de Réussite (KPI)
Score Lighthouse : > 90/100 sur mobile.

Frame Rate : Constant à 60 FPS lors du Pan/Zoom sur la France entière.

Poids de l'App : < 2Mo (hors cache cartographique).

🔮 7. Évolutions Futures
AI Identification : Module de reconnaissance d'image pour aider à nommer les minéraux.

Social Layer : Système de "Likes" et profils de "Gardien du Sauvage".

Topo 3D : Export de tracés GPX enrichis par les observations de la communauté.