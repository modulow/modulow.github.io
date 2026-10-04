# Publication manuelle SharePoint vers GitHub Pages

## Architecture et état

L'utilisateur a choisi le flux SharePoint-only **Kiwi - Export content.json**,
enregistré et prêt dans Power Automate. Il exporte le contenu publié dans :
`learn.IT-Kiwi/Shared Documents/Kiwi-export/content.json`.
L'utilisateur **vérifie le fichier et le commite lui-même** dans le dépôt.

```text
EuropaContent -> flux Power Automate utilisant SharePoint uniquement
              -> Shared Documents/Kiwi-export/content.json
              -> revue humaine -> content.json à la racine du dépôt
              -> publication GitHub Pages -> lecture navigateur même origine

Tickets -> liens vers SharePoint (formulaire, EuropaTickets, TicketExchanges agents)
        -> login Microsoft 365 natif ; aucune donnée lue par le portail
```

Le flux HTTP **Kiwi - Published content API** avait été bloqué par la DLP.
Il ne fait plus partie de l'architecture : ne pas l'activer ni contourner
la politique. Aucun Worker, URL SAS, appel Graph, MSAL ou secret cloud n'est
nécessaire. Le Worker, sa configuration et la dépendance Wrangler ont été
retirés du dépôt. Aucun changement de ressource cloud n'est exécuté ici.

Sur nouvelle instruction explicite de publication, `content.json` initial
est généré directement du seed autorisé, avec les quatre records Published:true.
`portal-config.js` active sa lecture (`enabled: true`). Les liens tickets
sont ensuite activés (`ticketsEnabled: true`) sur demande explicite de
l'utilisateur, en navigation seule (voir « Tickets natifs »). Ce fichier n'est pas présenté comme un téléchargement
du flux ni comme une preuve des créations SharePoint ; leur résultat est
rapporté séparément par la session de provisioning navigateur.
Tests locaux uniquement : aucune recette réelle multi-comptes SharePoint
ni exécution du flux déclarée vérifiée ici. La publication de la branche et
d'une PR a été demandée explicitement ; la mise en production Pages nécessite
la fusion dans main.

## EuropaContent et export

Site : `https://europarl.sharepoint.com/sites/learn.IT-Kiwi`.
Liste : `/Lists/EuropaContent/AllItems.aspx`.

| Nom interne | Type | Réglage |
| --- | --- | --- |
| Title | Texte une ligne existant | Requis, unique/indexé ; page/brochure/schedule/support |
| Payload | Texte multiligne brut | Requis, sans enrichissement ni append ; objet JSON sérialisé |
| Published | Oui/Non | Défaut Non ; indexé |

Limiter l'édition aux éditeurs désignés, activer le versionnement et confirmer
les indexes/unicité. Pas de partage anonyme SharePoint nécessaire.
`content-seed.json` reprend les textes existants avec Published:false.
Créer chaque item avec `Payload = JSON.stringify(record.Payload)`.
Vérifier avant publication des quatre items. Le support utilise `#tickets`,
résolu par le navigateur vers le lien natif configuré lorsque celui-ci est activé.

Le flux se déclenche quand un item EuropaContent est créé/modifié, lit
`Published eq 1`, trie par Title, limite à 50 et projette seulement
`Title`, `Published: true`, `Payload: json(Payload)`, puis écrit l'enveloppe.
Le booléen true est correct **uniquement après le filtre Published eq 1** ;
le validateur ne peut pas savoir si le flux a marqué un brouillon comme publié.
Confirmer ce filtre dans Power Automate lors de la revue IT.
Ne lire/exporter aucune liste tickets ni bibliothèque de documents internes.
La destination Shared Documents est utilisée uniquement pour écrire l'export.

Éviter les écritures concurrentes du flux (concurrence déclencheur = 1) ;
attendre la dernière exécution réussie et vérifier le fichier avant publication.
Un JSON invalide, un export dépassant la limite ou tronqué ne doit pas être publié.
L'accès au flux et aux connecteurs reste soumis aux politiques/licences IT.

## Contrat strict version 1

```json
{
  "schemaVersion": 1,
  "records": [
    { "Title": "page", "Published": true, "Payload": {} },
    { "Title": "brochure", "Published": true, "Payload": {} },
    { "Title": "schedule", "Published": true, "Payload": {} },
    { "Title": "support", "Published": true, "Payload": {} }
  ]
}
```

Remplacer les `{}` par les objets complets correspondants du seed.
Exactement quatre records, ordre libre, clés uniques, Published booléen true.
Propriétés supplémentaires interdites à tous les niveaux, y compris ID,
Author, Editor, tickets ou URLs de documents internes.
`Payload` est un objet dans le fichier, pas une chaîne JSON.

Page : `eyebrow`, `headline` (2 textes), `intro` (2 textes), `primaryLink`,
`essentials`, `appsTitle`, `steps` (3 textes), `accessNote`, `footerEyebrow`,
`footerLines` (2 textes). Cartes : `category`, `title`, `description`,
`action`, `href`. Support `href: "#tickets"` obligatoire ; autres liens HTTPS
sans credentials. `validation.js` impose aussi les limites de longueur.

Le frontend valide le fichier **entièrement avant toute modification DOM**.
Textes insérés comme texte, jamais HTML. Si fichier absent/invalide ou panne
réseau, le contenu existant dans index.html reste affiché et un avertissement
explique le repli. Pas de mise à jour partielle avec un fichier invalide.
La fonctionnalité tickets reste indépendante.

## Publication manuelle par l'utilisateur

1. Modifier les items SharePoint puis publier les quatre contenus souhaités.
2. Attendre la réussite de **Kiwi - Export content.json** après la dernière
   modification ; télécharger `Shared Documents/Kiwi-export/content.json`.
3. Relire humainement **tout le fichier** : uniquement données destinées au
   public, pas de données personnelles, tickets, secrets ou documents internes.
   Le schéma strict ne détecte pas une information privée dans un texte autorisé.
   Ne pas commiter un fichier privé même si le frontend le refuserait : tout
   fichier commité dans ce dépôt public devient accessible dans Git/historique.
4. Copier l'export relu à la racine du dépôt sous `content.json`.
   Exécuter `npm ci`, `npm run check:content`, `npm test` (Node 22+).
   Le contrôle retourne une erreur si fichier absent ou schéma invalide.
5. Dans `portal-config.js`, passer `enabled` à true seulement après revue ;
   changer `contentRevision` à chaque nouvel export (ex. date ou hash du fichier,
   1–80 caractères alphanumériques, point, tiret ou underscore).
   Le navigateur lit `./content.json?v=<contentRevision>` sur la même origine ;
   il n'appelle ni SharePoint ni une URL de flux.
6. Vérifier localement via un serveur HTTP la page, les cartes, clavier/mobile
   et les liens. Commit/push/publication **par l'utilisateur**, non automatiques.
   Pages publie main ; tenir compte du cache de dix minutes pour HTML/modules.
   Mettre à jour les cache-busters des modules/styles lors de leurs modifications.

Les changements SharePoint ne modifient pas immédiatement la page publique :
le fichier versionné constitue un instantané validé. Sans JavaScript, la page
affiche son HTML d'origine. Pour revenir au contenu d'origine, désactiver
`enabled` et republier ; aucune donnée n'est effacée automatiquement.

## Tickets natifs

URL confirmée :
`https://europarl.sharepoint.com/sites/learn.IT-Kiwi/Lists/EuropaTickets/AllItems.aspx`.
ID communiqué : `f673fe2d-9733-46dd-9afe-4bf614c99202`, inutilisé par le frontend.
Aucun ticket, cookie ou jeton Microsoft n'est exporté dans content.json.

Liens publics de navigation (`portal-config.js`, activés par `ticketsEnabled`) :

| Clé | Bouton | Destination |
| --- | --- | --- |
| `ticketingPageUrl` | carte support | page ticketing Kiwi `https://ep.europa.kiwi/sharepoint-ticketing/` (même onglet ; UI et popup formulaire gérées dans le dépôt `modulow/sharepoint-ticketing`) |
| `ticketSubmitUrl` | « Create an IT ticket » | formulaire d'intake SharePoint de l'organisation (`/:l:/s/learn.IT-Kiwi/<jeton>?nav=<id>`) |
| `ticketsUrl` | « Ticket queue (learn.IT agents) » — liste non filtrée, accès liste réservé aux Members/Owners learn.IT | `/sites/learn.IT-Kiwi/Lists/EuropaTickets/AllItems.aspx` |
| `ticketAgentsUrl` | « Ticket exchanges (learn.IT agents) » | `/sites/learn.IT-Kiwi/Lists/TicketExchanges/AllItems.aspx` |

`portal-ui.js` valide chaque URL par allowlist exacte (HTTPS, hôte
`europarl.sharepoint.com`, site `learn.IT-Kiwi`, chemin exact, aucun
query/hash sauf l'unique paramètre `nav` du formulaire ; page ticketing
exactement `https://ep.europa.kiwi/sharepoint-ticketing/`). Une URL invalide
masque tous les liens tickets et affiche une erreur. Le lien agents n'accorde
aucun droit : l'accès réel dépend des permissions SharePoint de TicketExchanges.
Il n'existe pas de vue « mes tickets » filtrée par permissions : les collègues externes à learn.IT passent par le formulaire et reçoivent un accès en lecture à leur seul item via le flux e-mail.
La sélection agents/membres est gérée dans le contexte SharePoint authentifié
par une autre session ; aucun nom, e-mail, groupe ou appartenance ne doit être
ajouté à `content.json`, `portal-config.js` ou au code public. L'ancienne
redirection `ticket-popup.js` vers l'application démo `/sharepoint-ticketing/`
a été retirée du portail.

Colonnes : Title requis, Description multiligne brut requis, Created By système.
Ne pas utiliser OwnerOid/OwnerTenantId app-only.
Décision utilisateur : **envoyer et consulter seulement ; modifications
réservées aux administrateurs**.

Rompre l'héritage de la liste seulement. Lecture de ses propres items, écriture
de ses propres items. Rôle submitter AddListItems/ViewListItems + droits
auxiliaires, sans Edit/Delete/ManageLists/OverrideListBehaviors.
Le rôle Kiwi Ticket Submitters a été appliqué aux Members dans la session
de provisioning ; Owners Full Control et Visitors Read conservés.
Ces réglages sont rapportés, pas une preuve de droits effectifs multi-comptes.
Vérifier les autres groupes, héritages Teams, partages et invitations.

Pas de champ Status soumissible : masquer un champ ne protège pas sa valeur
à création via REST. Le suivi administratif de statut n'est pas implémenté ;
si requis, décider d'une liste privée admins et d'une présentation authentifiée
sécurisée distincte. Une correction asynchrone par flux ne donne pas une
garantie atomique d'état initial.

Avant activation : A peut créer/lire son ticket, B ne peut lire A même par ID,
A ne peut modifier/supprimer son ticket ni contourner via REST/export,
support explicitement autorisé peut gérer les deux. Tester anonymes, Visitors,
invités et accès direct. Les admins site/tenant conservent leurs pouvoirs.

## Retrait des secrets inutiles

Aucun secret n'existe dans les fichiers livrés. Aucun accès fournisseur ou
suppression distante n'a été effectué par cette session.
Si une configuration cloud avait été créée ailleurs, demander à son responsable
de retirer `POWER_AUTOMATE_FLOW_URL`, tout ancien `GRAPH_CLIENT_SECRET`,
les variables/bindings et routes de l'ancien Worker après vérification de leur
usage ; révoquer le SAS du flux HTTP abandonné selon la procédure IT approuvée.
Ne supprimer aucune connexion Microsoft partagée utilisée par d'autres flux.
Ces ressources n'ont pas été supposées existantes et ne sont pas automatiquement
supprimées par npm ou par la suppression du code.
