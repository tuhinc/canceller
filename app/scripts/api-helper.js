
// rdio js api oauth2 helper

(function() {
  var rdio, qs;

  function parseQuery(s) {
    var qs = {};
    var pieces = s.split('&');
    for (var i=0; i<pieces.length; i++) {
      var pair = pieces[i].split('=');
      // FIXME: handle "=" in RHS
      qs[pair[0]] = decodeURIComponent(pair[1]);
    }
    return qs;
  }

  function devError(message) {
    if (window.console && console.error) {
      console.error('[Rdio API] ' + message);
    }
  }

  function userError(message) {
    message = message || 'This page helps with the Rdio JavaScript API OAuth 2.0 sequence; you don\'t need to go here directly.';
    window.onload = function() {
      var div = document.createElement('div');
      div.innerHTML = message;
      document.body.appendChild(div);
    };
  }

  function redirectBack() {
    if (qs.redirect_uri) {
      window.location = qs.redirect_uri;
    } else {
      devError('No redirect URI');
      userError();
    }
  }

  // Sometimes on Chrome a popup forgets who its owner is, so it can't even close 
  // itself. The fix is to "reopen" it so it is now its own owner.
  // See: http://stackoverflow.com/questions/2032640/problem-with-window-close-and-chrome
  function closeWithChromeFix() {
    window.open('', '_self', ''); 
    window.close();
  }

  qs = parseQuery(window.location.search.substr(1));

  // The response data is supposed to be in the hash, but might be in the query string
  var responsePayload = qs;
  if (window.location.hash) {
    responsePayload = parseQuery(window.location.hash.substr(1));
  }

  if (!qs.redirect_uri) {
    try {
      if (qs.login) {
        rdio = window.opener.__rdio;
      } else {
        rdio = window.parent.__rdio;
      }
    } catch (e) {
      devError('Unable to access app from authentication helper. Note that they must reside on the same domain.');
    }

    if (!rdio) {
      // If we're unable to access the opener/parent, it may mean Chrome is not 
      // playing ball, or it could mean the user wandered on to this page by 
      // accident. Here we sort out which is which and do the right thing.
      if (responsePayload.access_token) {
        // The user said "allow"; we use localStorage to notify the app.
        localStorage.setItem('__rdioNewAuthFlag', 'true');
        closeWithChromeFix();
      } else if (responsePayload.error === 'access_denied') {
        // The user said "deny". By default the app assumes denial when the window
        // closes, so we don't need to do anything extra.
        closeWithChromeFix();
      } else if (responsePayload.error) {
        userError('An unexpected error occurred: ' + escape(responsePayload.error));
      } else {
        userError();
      }
      
      return;
    }
  }

  if (responsePayload.access_token) {
    if (rdio) {
      rdio.accessToken(responsePayload.access_token);
      if (qs.login) {
        rdio._monitorAuthenticationWindow(false);
        window.close();
      }
    } else {
      redirectBack();
    }
  } else if (responsePayload.error) {
    if (responsePayload.error === 'access_denied') {
      if (rdio) {
        rdio._authenticationDenied();
        window.close();
      } else {
        redirectBack();
      }
    } else {
      userError('An unexpected error occurred: ' + escape(responsePayload.error));
    }    
  } else {
    var base_url;
    if (rdio) {
      if (qs.login) {
        base_url = rdio._config.oauth2;
      } else {
        base_url = rdio._config.oauth2Auto;
      }
    } else if (qs.oauth2) {
      base_url = qs.oauth2;
    } else {
      devError('OAuth2 endpoint required');
      userError();
      return;
    }

    base_url += ('?response_type=token&client_id='
      + encodeURIComponent(qs.client_id)
      + '&redirect_uri='
      + encodeURIComponent(window.location.href));

    if (!rdio) {
      base_url += '&mode=redirect';
    }

    if (!qs.login) {
      if (rdio) {
        rdio._authenticationCheckStarted();
      }
    }

    if (qs.linkshare_id && base_url.search(/rdio\.com/i) !== -1) {
      var url = 'http://click.linksynergy.com/fs-bin/click?id='
        + qs.linkshare_id 
        + '&subid=&offerid=221756.1&type=10&tmpid=7950&RD_PARM1='
        + encodeURIComponent(encodeURIComponent(base_url)); // LinkShare needs it double encoded

      window.location.href = url;
    } else {
      window.location.href = base_url;
    }
  }
  
})();