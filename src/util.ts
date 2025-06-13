
/**
 * Cette fonction est utilisee pour les tests, elle pourra être supprimee quand le script sera en PROD
 * Elle permet de generer une chaîne de caracteres aleatoire de caracteres de longueur specifiee (par defaut 4 caracteres)
 * Elle etait utilisee pour generer des identifiants aleatoires pour des INSERT pour les tests
 * 
 * @param {number} length - Longueur de la chaîne de caracteres à generer
 * @returns {string} - Chaîne de caracteres aleatoire
 */
function generateRandomString(length: number = 4): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters[randomIndex];
  }

  return result;
}

/**
 * Cette fonction retourne une chaîne de caractere formatee en TIMESTAMP pour la date et l'heure
 * Elle permet de stocker la date et l'heure d'export CODEX
 * 
 * @returns {string} - Chaîne de caractere formatee en TIMESTAMP
 */
function donneformattedDate(): string {
  const now = new Date();

  // Utiliser des methodes pour obtenir la date et l'heure locales
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Les mois sont indexes à partir de 0
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export {
  generateRandomString,
  donneformattedDate,
};
