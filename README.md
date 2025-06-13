# Codex Extract TS

Ce projet est une application Node.js qui permet de copier des données d'une base de données Sybase vers une base de données MySQL.

## Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Une base de données Sybase source
- Une base de données MySQL cible

## Installation

1. Clonez le dépôt :
```bash
git clone [URL_DU_REPO]
cd codex_extract_ts
```

2. Installez les dépendances :
```bash
npm install
```

3. Copiez le fichier `.env.example` en `.env` et configurez vos variables d'environnement :
```bash
cp .env.example .env
```

## Configuration

Modifiez le fichier `.env` avec vos paramètres de connexion :

- Configuration de la base de données source (Sybase)
- Configuration de la base de données cible (MySQL)
- Niveau de log

## Utilisation

Pour lancer l'application :

```bash
npm start
```

## Structure du projet

```
src/
  ├── config/         # Configuration (bases de données, requêtes)
  ├── types/          # Types TypeScript
  ├── utils/          # Utilitaires (logger, etc.)
  └── index.ts        # Point d'entrée
```

## Logs

Les logs sont stockés dans le répertoire `logs/` avec rotation automatique :
- Taille maximale : 10 Mo
- Conservation : 12 fichiers
- Compression : activée

## Licence

[Votre licence] 