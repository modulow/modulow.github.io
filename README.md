# Portail Europa

Portail public en français, configuré pour **https://ep.europa.kiwi/**,
avec trois accès :

| Accès | Destination |
| --- | --- |
| Brochure | https://modulow.github.io/ep-l-d-brochure/ |
| Emploi du temps | https://ld-europa.eu/ |
| Support IT / ticketing | https://modulow.github.io/sharepoint-ticketing/ |

## Fonctionnement

Site statique sans dépendances, JavaScript, suivi ni police externe. Ouvrir
`index.html` dans un navigateur pour le consulter localement. `styles.css`
contient les styles et les adaptations mobiles ; `favicon.svg` est l’icône du
site. Les cartes sont des liens accessibles au clavier, avec un focus visible,
et s’ouvrent dans le même onglet. Les effets respectent la préférence de
réduction des animations.

Pour modifier les destinations, éditer les attributs `href` des trois cartes
dans `index.html` et mettre à jour le tableau ci-dessus.

## Publication GitHub Pages

GitHub Pages doit publier la branche `main`, dossier racine `/`
(Settings → Pages → Deploy from a branch). Chaque envoi sur `main` publie le
site. `.nojekyll` désactive le traitement Jekyll.

Le domaine personnalisé configuré dans Pages et le fichier `CNAME` à la
racine du dépôt contiennent `ep.europa.kiwi`. Le domaine a été activé après
vérification du CNAME DNS. L’accès HTTPS nécessite également la délivrance
du certificat par GitHub.

Dans la zone DNS OVH de `europa.kiwi`, créer :

| Type | Sous-domaine | Cible |
| --- | --- | --- |
| CNAME | `ep` | `modulow.github.io.` |

La cible est un nom d’hôte, sans protocole ni chemin. Ne pas laisser
d’enregistrements A ou AAAA sur `ep` en parallèle du CNAME. Ne pas modifier
les autres sous-domaines ni le domaine `ld-europa.eu`.

Lors d’une nouvelle configuration, vérifier d’abord que le CNAME DNS est
résolu, puis configurer `ep.europa.kiwi` comme domaine personnalisé dans
Pages et conserver le fichier `CNAME` contenant uniquement `ep.europa.kiwi`.
Attendre la délivrance du certificat par GitHub, puis activer
**Enforce HTTPS** dans Pages lorsque cette option est disponible.
La présence de ce fichier dans le dépôt ne configure pas le DNS OVH.

**Attention aux sites de projets :** les projets GitHub Pages de `modulow`
sans domaine personnalisé peuvent hériter du domaine du site utilisateur.
Les liens `modulow.github.io/ep-l-d-brochure/` et
`modulow.github.io/sharepoint-ticketing/` peuvent donc être redirigés vers
`ep.europa.kiwi` avec le même chemin. Ils dépendent alors aussi du DNS et du
certificat du portail. Vérifier les deux chaînes de redirection après toute
modification de domaine. L’emploi du temps conserve son domaine
personnalisé `ld-europa.eu`.
