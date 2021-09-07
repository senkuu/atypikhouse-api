# AtypikHouse - API
## _Réalisé par iGloo_

Pour mettre en place l'API après clonage du repository, renommer le fichier `.env.development` à la racine en `.env`.

Exécuter ensuite ces commandes :
`yarn install`
`docker-compose up database redis adminer`

Une fois les containers Docker démarrés, importer le script SQL disponible à [cette adresse](https://drive.google.com/file/d/1-mwI6aYEOrj7py8y8yCp2B6b5vvu0_Eq/view?usp=sharing) sur [l'interface Adminer](http://localhost:8000/?pgsql=database&username=atypikhouse&db=atypikhouse&ns=public).

Les informations de connexion à la base de données sont les suivantes :
- Système : PostgreSQL
- Serveur : database
- Utilisateur / Mot de passe / Base de données : atypikhouse

Le mot de passe de tous les comptes visible dans la base de données est AtypikCode#2021.

Pour lancer l'API, utiliser ces commandes :
`yarn run dev`
`yarn run watch`