export default {
  //eventually will probably do more, but just this for now  
  handleError: (err) => {
    let obj = {}
    //if a response from oauth...
    if (err && err.type == "OAuthException") { //got this from using an inactive access token making a Facebook post
      if (err.code == 2500) {
        obj.message = "Facebook access expired; please login again"
        obj.origin = "facebook"
      }
    }
    console.log(err);

    return obj
  },
  // extracts the relevant firebaseData data from the firebase data
  extractUserData: (firebaseData) => {
    let userData = {
      displayName: firebaseData.displayName,
      email: firebaseData.email,
      photoURL: firebaseData.photoURL,
      uid: firebaseData.uid,
      providerData: firebaseData.providerData,
    }

    return userData
  },

  safeDataPath: function (object, keyString, def = null) {
    let keys = keyString.split('.');
    let returnValue = def;
    let safeObject = object;

    if (!safeObject) {
      return def;
    }

    for (let key of keys) {
      if (safeObject[key]) {
        returnValue = safeObject[key];
        safeObject = safeObject[key];
      } else {
        return def;
      }
    }

    return returnValue;
  },
}
