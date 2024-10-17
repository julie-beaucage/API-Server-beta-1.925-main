import * as utilities from "../utilities.js";
import * as serverVariables from "../serverVariables.js";

let repositoryCachesExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");

// Repository file data models cache
global.repositoryCaches = [];
global.cachedRepositoriesCleanerStarted = false;

export default class CachedRequestsManager {
  static startCachedRequestsCleaner() {
    /* démarre le processus de nettoyage des caches périmées */
    setInterval(RepositoryCachesManager.flushExpired, repositoryCachesExpirationTime * 1000);
    console.log(BgWhite + FgBlue, "[Periodic repositories data caches cleaning process started...]");
  }
  static add(url, content, ETag = "") {
    /* mise en cache */
  }
  static find(url) {
    /* si existe, si existe pas return null, retourne la cache associée à l'url */
  }
  static clear(url) {
    /* efface la cache associée à l’url */
  }
  static flushExpired() {
    /* efface les caches expirées */
  }
  static get(HttpContext) {
    /* 
Chercher la cache correspondant à l'url de la requête. Si trouvé,
Envoyer la réponse avec 
HttpContext.response.JSON( content, ETag, true /* from cache ) donc (si le truc provient de la cache, on na la met
pas une autre dans la cahe, si elle ne provient pas de la cache, il faut la mettre de dans)*/
  }
}
