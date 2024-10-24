import * as utilities from "./utilities.js";
import * as serverVariables from "./serverVariables.js";

let cacheRequestsExpirationTime = serverVariables.get(
  "main.cacheRequestsExpirationTime"
);

// Repository file data urls cache
global.requestsCache = [];
global.cachedRequestsCleaner = false;

export default class CachedRequestsManager {
  static add(url, content, ETag = "") {
    /* mise en cache */
    if (!cachedRequestsCleaner) {
      cachedRequestsCleaner = true;
      CachedRequestsManager.startCachedRequestsCleaner();
    }
    if (url != "") {
      CachedRequestsManager.clear(url);
      requestsCache.push({
        url,
        content,
        ETag,
        Expire_Time: utilities.nowInSeconds() + cacheRequestsExpirationTime,
      });
      console.log(BgWhite + FgOrange,  `[Data of url:  ${url} repository has been cached]` );
    }
  }
  static startCachedRequestsCleaner() {
    /* démarre le processus de nettoyage des caches périmées */
    setInterval(
      CachedRequestsManager.flushExpired,
      cacheRequestsExpirationTime * 1000
    );
    console.log(BgWhite + FgOrange,"[Periodic repositories data caches url cleaning process started...]");
  }
  static find(url) {
    /* retourne la cache associée à l'url */
   console.log(requestsCache);
    try {
      if (url != "") {
        for (let cache of requestsCache) {
          if (cache.url == url) {
            cache.Expire_Time = utilities.nowInSeconds() + cacheRequestsExpirationTime;
            console.log(BgWhite + FgOrange, `[${cache.url} data url retrieved from cache]`);
            return cache;
          }
        }
      }
    } catch (error) {
      console.log(BgWhite + FgRed, "[repository cache url error!]", error);
    }
    return null;
  }
  static clear(url) {
    /* efface la cache associée à l’url */
    if (url != "") {
      let indexToDelete = [];
      let index = 0;
      for (let cache of requestsCache) {
        if (cache.url == url) indexToDelete.push(index);
        index++;
      }
      utilities.deleteByIndex(requestsCache, indexToDelete);
    }
  }
  static flushExpired() {
    /* efface les caches expirées */
    let now = utilities.nowInSeconds();
    for (let cache of requestsCache) {
      if (cache.Expire_Time <= now) {
        console.log(BgWhite + FgOrange,"Cached file data of url: " + cache.url + ".json expired" );
      }
    }
    requestsCache = requestsCache.filter((cache) => cache.Expire_Time > now);
  }
  static get(HttpContext) {
    /* 
    Chercher la cache correspondant à l'url de la requête. Si trouvée,
    envoyer la réponse avec HttpContext.response.JSON(content, ETag, true /* from cache).
    Donc, si les données proviennent du cache, on ne les met pas dans une autre cache. 
    Si elles ne proviennent pas du cache, il faut les ajouter.
    */
    let cache = CachedRequestsManager.find(HttpContext.req.url);
    if (cache && HttpContext.isCacheable) {
      HttpContext.response.JSON(cache.content, cache.ETag, true);
      return true;
    }
    return false;
  }
}
