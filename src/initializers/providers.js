//check login status of Facebook and others
//https://developers.facebook.com/docs/reference/javascript/FB.getLoginStatus
export default () => {
  //Facebook
  console.log("Facebook is getting initialized");
  window.fbAsyncInit = function() {
    FB.init({
      appId            : '113078216085633',
      autoLogAppEvents : true,
      xfbml            : true, //false disables searching for social plug-ins
      version          : 'v2.10'
    });
    FB.AppEvents.logPageView();
    //will be called after the FB.init
    FB.getLoginStatus()
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

  //might move checking login status from the login component to here
}
