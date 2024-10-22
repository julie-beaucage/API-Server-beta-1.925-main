import * as utilities from "./utilities.js";
import * as serverVariables from "./serverVariables.js";

let repositoryCachesExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");

// Repository file data urls cache
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
    if (!cachedRepositoriesCleanerStarted) {
      cachedRepositoriesCleanerStarted = true;
      RepositoryCachesManager.startCachedRepositoriesCleaner();
  }
  if (url != "") {
      RepositoryCachesManager.clear(url);
      repositoryCaches.push({
          url,
          content,
          ETag,
          Expire_Time: utilities.nowInSeconds() + repositoryCachesExpirationTime
      });
      console.log(BgWhite + FgBlue, `[Data of ${url} repository has been cached]`);
  }
  }
  static find(url) {
    /* si existe, si existe pas return null, retourne la cache associée à l'url */
    try {
      if (url != "") {
          for (let cache of repositoryCaches) {
              if (cache.url == url) {
                  // renew cache
                  cache.Expire_Time = utilities.nowInSeconds() + repositoryCachesExpirationTime;
                  console.log(BgWhite + FgBlue, `[${cache.url} data retrieved from cache]`);
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
      for (let cache of repositoryCaches) {
          if (cache.url== url) indexToDelete.push(index);
          index++;
      }
      utilities.deleteByIndex(repositoryCaches, indexToDelete);
  }
  }
  static flushExpired() {
    /* efface les caches expirées */
    let now = utilities.nowInSeconds();
    for (let cache of repositoryCaches) {
        if (cache.Expire_Time <= now) {
            console.log(BgWhite + FgBlue, "Cached file data of " + cache.url + ".json expired");
        }
    }
    repositoryCaches = repositoryCaches.filter( cache => cache.Expire_Time > now);
  }
  static get(HttpContext) {
    /* 
Chercher la cache correspondant à l'url de la requête. Si trouvé,
Envoyer la réponse avec 
HttpContext.response.JSON( content, ETag, true /* from cache ) donc (si le truc provient de la cache, on na la met
pas une autre dans la cahe, si elle ne provient pas de la cache, il faut la mettre de dans)*/
return new Promise(async resolve => {
  if (CachedRequestsManager.find(HttpContext.req.url) != null) {
      let cache = CachedRequestsManager.find(HttpContext.req.url);
      HttpContext.response.JSON(cache.content, cache.ETag, true);
      resolve(true);
  }
  else {
      resolve(false);
  }
});
/*
try{
  if(HttpContext.req.url!="") {
      for( cache of cacheRequests)
      {
          if(HttpContext.req.url!="" == cache.url)
          {
              return HttpContext.response.JSON( cache.content, cache.ETag, true  from cache );
          }
      }
      return null;
  }
} catch(error) {
  console.log(BgWhite + FgRed, "[Requests get cache error!]", error);
}*/
}
}

