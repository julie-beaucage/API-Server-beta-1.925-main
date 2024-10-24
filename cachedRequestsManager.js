import * as utilities from "./utilities.js";
import * as serverVariables from "./serverVariables.js";
import HttpContext from './httpContext.js';

let cacheRequestsExpirationTime = serverVariables.get("main.cacheRequestsExpirationTime");

// Repository file data urls cache
global.requestsCache = [];
global.cachedRequestsCleaner = false;

export default class CachedRequestsManager {
  static startCachedRequestsCleaner() {
    /* démarre le processus de nettoyage des caches périmées */
    setInterval(CachedRequestsManager.flushExpired, cacheRequestsExpirationTime * 1000);
    console.log(BgWhite + FgOrange, "[Periodic repositories data caches cleaning process started...]");
  }
  static add(url, content, ETag = "") {
    /* mise en cache */
    if (!global.cachedRequestsCleaner) {
      global.cachedRequestsCleaner = true;
      CachedRequestsManager.startCachedRequestsCleaner();
  }
  if (url != "") {
      CachedRequestsManager.clear(url);
      global.requestsCache.push({
          url,
          content,
          ETag,
          Expire_Time: utilities.nowInSeconds() + cacheRequestsExpirationTime
      });
      console.log(BgWhite + FgOrange, `[Data of url ${url} repository has been cached]`);
  }
  }
  static find(url) {
    /* si existe, si existe pas return null, retourne la cache associée à l'url */
    try {
      if (url != "") {
          for (let cache of requestsCache) {
              if (cache.url == url) {
                  cache.Expire_Time = utilities.nowInSeconds() + cacheRequestsExpirationTime;
                  console.log(BgWhite + FgOrange, `[${cache.url} data retrieved from cache]`);
                  return cache.data;
              }
          }
      }
  } catch (error) {
      console.log(BgWhite + FgRed, "[repository cache error!]", error);
  }
  return null;
  }
  static clear(url) {
    /* efface la cache associée à l’url */
    if (url != "") {
      let indexToDelete = [];
      let index = 0;
      for (let cache of requestsCache) {
          if (cache.url== url) indexToDelete.push(index);
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
            console.log(BgWhite + FgBlue, "Cached file data of " + cache.url + ".json expired");
        }
    }
    requestsCache = requestsCache.filter( cache => cache.Expire_Time > now);
  }
static get(HttpContext) {
    /* 
    Chercher la cache correspondant à l'url de la requête. Si trouvée,
    envoyer la réponse avec HttpContext.response.JSON(content, ETag, true /* from cache).
    Donc, si les données proviennent du cache, on ne les met pas dans une autre cache. 
    Si elles ne proviennent pas du cache, il faut les ajouter.
    */
    return new Promise(async (resolve) => {
        const cache = CachedRequestsManager.find(HttpContext.req.url);
        if (cache && HttpContext.isCacheable) {
            cache.Expire_Time = utilities.nowInSeconds() + cacheRequestsExpirationTime;
            HttpContext.response.JSON(cache.content, cache.ETag, true);
            console.log(BgWhite + FgBlue, `[${cache.url} data retrieved from cache]`);
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

}

