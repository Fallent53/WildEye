# ðŸ”ï¸ WildEye : L'Observatoire National du Sauvage

> **Plateforme communautaire de cartographie haute performance pour la minÃ©ralogie, la faune et la flore en France.**

---

## ðŸŽ¯ 1. Vision & Objectifs
**WildEye** est une *Progressive Web App* (PWA) conÃ§ue pour les passionnÃ©s de montagne et de nature. Elle permet d'allier la prÃ©cision de la donnÃ©e gÃ©ologique Ã  la magie de l'observation sauvage, tout en garantissant une expÃ©rience utilisateur fluide sur le terrain.

* **ðŸ’Ž MinÃ©ralogie :** Indexation des gisements et partage de trouvailles (Quartz, Fluorines, etc.).
* **ðŸ¦Œ Faune Sauvage :** Partage d'observations (Chamois, Bouquetins, GypaÃ¨tes) sans dÃ©rangement.
* **ðŸŒ¿ Flore Remarquable :** Recensement de spÃ©cimens rares (Edelweiss, Sabot de VÃ©nus).

---

## ðŸ› ï¸ 2. Stack Technique (Performance First)

L'application est bÃ¢tie sur une architecture **"Edge-Ready"** pour garantir une rÃ©activitÃ© maximale, mÃªme en conditions de rÃ©seau dÃ©gradÃ©.

| Couche | Technologie | RÃ´le & Justification |
| :--- | :--- | :--- |
| **Frontend** | `Next.js 14+` | App Router pour un rendu hybride et une navigation instantanÃ©e. |
| **Cartographie** | `Mapbox GL JS` | Moteur WebGL pour le rendu 3D du relief Ã  60 FPS. |
| **Style Carte** | `Mapbox Outdoors` | OptimisÃ© pour la lecture des courbes de niveau et sentiers IGN. |
| **Backend** | `Supabase` | PostgreSQL + PostGIS pour la puissance des requÃªtes spatiales. |
| **State** | `Zustand` | Gestion lÃ©gÃ¨re de l'Ã©tat global et des filtres de recherche. |
| **Images** | `Cloudinary` | Pipeline d'optimisation automatique des photos de terrain. |

---

## ðŸŒ 3. Architecture des DonnÃ©es & API

### A. Sources de DonnÃ©es Officielles
* **BRGM (InfoTerre) :** Couches gÃ©ologiques vectorisÃ©es pour identifier les zones de prospection.
* **INPN (OpenObs) :** DonnÃ©es sur les zones de protection (Natura 2000, Parcs Nationaux).
* **IGN :** AltimÃ©trie prÃ©cise pour le positionnement 3D des observations.

### B. SchÃ©ma de Base de DonnÃ©es (PostGIS)
```sql
CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  category VARCHAR(20) CHECK (category IN ('cristal', 'faune', 'flore')),
  species_name VARCHAR(100),
  description TEXT,
  -- CoordonnÃ©es prÃ©cises (PrivÃ©)
  geom GEOGRAPHY(POINT, 4326) NOT NULL,
  -- CoordonnÃ©es floutÃ©es pour la communautÃ© (Public)
  geom_blurred GEOGRAPHY(POINT, 4326),
  photo_url TEXT,
  user_id UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_obs_geom ON observations USING GIST (geom);

âœ¨ 4. FonctionnalitÃ©s ClÃ©s & UX
ðŸš€ Performance "Zero Latence"
Vector Tiling : Utilisation de tuiles vectorielles pour un affichage massif de points sans ralentissement.

Clustering GÃ©ographique : Regroupement intelligent des icÃ´nes selon le niveau de zoom.

ðŸ›¡ï¸ Ã‰thique & ConfidentialitÃ©
Floutage Dynamique : Algorithme de dÃ©calage alÃ©atoire (300m - 500m) des points publics pour protÃ©ger les gisements et la tranquillitÃ© de la faune.

Zones Sensibles : SystÃ¨me d'alerte contextuel si l'utilisateur saisit une donnÃ©e dans une rÃ©serve intÃ©grale.

ðŸ“¶ Mode "Off-the-Grid"
Offline First : Cache des tuiles cartographiques via Service Workers.

Sync Background : Mise en file d'attente des publications lors des zones blanches (sans rÃ©seau).

ðŸ—ï¸ 5. Guide d'ImplÃ©mentation
Ã‰tape 1 : Initialisation de la ScÃ¨ne 3D
JavaScript
// Activation du terrain 3D rÃ©el
map.on('load', () => {
  map.addSource('mapbox-dem', {
    'type': 'raster-dem',
    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1'
  });
  map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.2 });
});
Ã‰tape 2 : Filtrage InstantanÃ©
ImplÃ©mentation d'une interface de filtrage par "Layers" Mapbox pour masquer/afficher les catÃ©gories (Faune/Flore/Cristaux) sans re-render de la carte.

Ã‰tape 3 : Workflow de Contribution
Capture : Extraction automatique de la position via GPS Mobile.

Compression : RÃ©duction de la taille de l'image (Canvas API) avant l'upload.

Validation : VÃ©rification des zones de protection via l'API INPN.

ðŸ“ˆ 6. Indicateurs de RÃ©ussite (KPI)
Score Lighthouse : > 90/100 sur mobile.

Frame Rate : Constant Ã  60 FPS lors du Pan/Zoom sur la France entiÃ¨re.

Poids de l'App : < 2Mo (hors cache cartographique).

ðŸ”® 7. Ã‰volutions Futures
AI Identification : Module de reconnaissance d'image pour aider Ã  nommer les minÃ©raux.

Social Layer : SystÃ¨me de "Likes" et profils de "Gardien du Sauvage".

Topo 3D : Export de tracÃ©s GPX enrichis par les observations de la communautÃ©.

---

## Licence & Attribution

WildEye est copyright (c) 2026 Loris Dc.

Le projet est distribue sous licence GNU AGPLv3 (`AGPL-3.0-only`). Toute version modifiee utilisee comme service reseau doit proposer son code source correspondant aux utilisateurs du service, conformement a l'AGPLv3.

La mention `Designed & Developed by Loris Dc` doit etre conservee dans l'interface interactive ou dans des notices legales equivalentes. Voir `LICENSE` et `NOTICE.md`.
