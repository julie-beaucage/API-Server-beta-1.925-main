import * as utilities from "./utilities.js";
import * as serverVariables from "./serverVariables.js";
import Repository  from "./models/repository.js";

let cacheRequestsExpirationTime = serverVariables.get(
  "main.cacheRequestsExpirationTime"
);

// Repository file data urls cache
global.requestsCache = [];
global.cachedRequestsCleaner = false;

export default class CachedRequestsManager {

    static startCachedRequestsCleaner() {
        setInterval(CachedRequestsManager.flushExpired, cacheRequestsExpirationTime * 1000);
        console.log(
          BgWhite + FgOrange,
          "[Periodic repositories data caches url cleaning process started...]"
        );
      }

  static add(url, content, ETag = "") {
    /* mise en cache */
    console.log(`Mise en cache des données pour ${url} avec ETag : ${ETag}`);

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
      console.log(
        BgWhite + FgOrange,
        `[Data of url:  ${url} repository has been cached]`
      );
    }
  }

  static find(url) {
    /* retourne la cache associée à l'url */
    try {
      if (url != "") {
        
        for (let cache of requestsCache) {
          if (cache.url == url) {
            cache.Expire_Time =
              utilities.nowInSeconds() + cacheRequestsExpirationTime;
            console.log(
              BgWhite + FgOrange,
              `[${cache.url} data url retrieved from cache]`
            );
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
       // if (url.includes(cache.url)) indexToDelete.push(index);
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
        console.log(
          BgWhite + FgOrange,
          "Cached file data of url: " + cache.url + ".json expired"
        );
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
    /*if (['POST', 'PUT', 'DELETE'].includes(HttpContext.req.method)) {
        CachedRequestsManager.clear(HttpContext.req.url);
        return false; 
      }*/
        if (!HttpContext.isCacheable) {
            return false;
        }
        let cache = CachedRequestsManager.find(HttpContext.req.url);
        if (cache) {
            if (cache.Etag!=Repository.getETag(HttpContext.path.model)) {
                CachedRequestsManager.clear(HttpContext.req.url);
                return false;
            }
            HttpContext.response.JSON(cache.content, cache.ETag, true);
            return true;
        } 
                return false;
    }
}
