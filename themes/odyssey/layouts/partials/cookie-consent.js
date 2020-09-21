window.cookieconsent.initialise({
  "container": document.getElementById("content"),
  "palette": {
    "popup": { "background": "#000" },
    "button": { "background": "#f1d600" }
  },
  "position": "bottom-right",
  "revokable": true,
  "onStatusChange": function(status) {
     console.log(this.hasConsented() ?
      'enable cookies' : 'disable cookies');
    },
  "type": "opt-in",
  "cookie.domain": "odyssey.co.in",
  "cookie.secure": true,
  "content": {
    "href": "https://www.odyssey.co.in/policies"
  },
                                
  onInitialise: function (status) {
    var type = this.options.type;
    var didConsent = this.hasConsented();
    if (type == 'opt-in' && didConsent) {
      // enable cookies
      dataLayer.push({'event':'this.hasConsented'});
    }
    if (type == 'opt-out' && !didConsent) {
      // disable cookies
    }
  },

  onStatusChange: function(status, chosenBefore) {
    var type = this.options.type;
    var didConsent = this.hasConsented();
    if (type == 'opt-in' && didConsent) {
      // enable cookies
       dataLayer.push({'event':'this.hasConsented'});
    }
    if (type == 'opt-out' && !didConsent) {
      // disable cookies
    }
  },

  onRevokeChoice: function() {
    var type = this.options.type;
    if (type == 'opt-in') {
      // disable cookies
    }
    if (type == 'opt-out') {
      // enable cookies
    }
  },

});