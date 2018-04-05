export const AUDIT_TESTS = {
  pageSpeed: {
    key: "pageSpeed",
    question: "Which of your pages are too slow and need to be fixed?",
    lists: {
      slowPages: {
        header: "Slow Pages",
        primaryDimension: "ga:pagePath",
        metrics: {
          "ga:avgPageLoadTime": {},
          "ga:pageviews": {},
        }
      }
    },
  },

  // not using yet
  /*
  wellBalancedPortfolio: {
    key: "wellBalancedPortfolio",
    question: "Is your acquisition portfolio well-balanced?",
  },

  keywordTargets: {
    key: "keywordTargets",
    question: "What keyword should the page target?",
  },

  */
  headlineStrength: {
    key: "headlineStrength",
    question: "What headlines and meta-descriptions need to be improved?",
    lists: {
      weakHeadlines: {
        header: "Headlines to improve:",
        primaryDimension: "page", //gsc
        metrics: {
          "ctr": {},
          "impressions": {},
        }
      }
    },
  },

  browserCompatibility: {
    key: "browserCompatibility",
    question: "What browsers does your site not work well on?",
    lists: {
      badBounceRate: {
        header: "Bad Bounce Rate:",
        primaryDimension: "ga:browser",
        metrics: {
          "ga:users": {},
          "ga:bounceRate": {},
          "ga:avgSessionDuration": {},
        }
      },
      badSessionDuration: {
        header: "Bad Avg Session Duration:",
        primaryDimension: "ga:browser",
        metrics: {
          "ga:users": {},
          "ga:bounceRate": {},
          "ga:avgSessionDuration": {},
        }
      }
    },
  },

  deviceCompatibility: {
    key: "deviceCompatibility",
    question: "What devices does your site not work well on?",
    lists: {
      badBounceRate: {
        header: "Bad Bounce Rate:",
        primaryDimension: "ga:deviceCategory",
        metrics: {
          "ga:users": {},
          "ga:bounceRate": {},
          "ga:avgSessionDuration": {},
        }
      },
      badSessionDuration: {
        header: "Bad Avg Session Duration:",
        primaryDimension: "ga:deviceCategory",
        metrics: {
          "ga:users": {},
          "ga:bounceRate": {},
          "ga:avgSessionDuration": {},
        }
      }
    },
  },

  userInteraction: {
    key: "userInteraction",
    question: "What other pages may have issues that need fixed?",
    lists: {
      badBounceRate: {
        header: "Bad Bounce Rate:",
        primaryDimension: "ga:landingPagePath",
        metrics: {
          "ga:users": {},
          "ga:bounceRate": {},
          "ga:avgSessionDuration": {},
        }
      },
      badSessionDuration: {
        header: "Bad Avg Session Duration:",
        primaryDimension: "ga:landingPagePath",
        metrics: {
          "ga:users": {},
          "ga:bounceRate": {},
          "ga:avgSessionDuration": {},
        }
      }
    },
  },
  /*pageValue: {
    key: "pageValue",
    question: "What content adds the most value to an ultimate outcome for your website? What pages should you repurpose and syndicate?",
  },*/
  searchPositionToImprove: {
    key: "searchPositionToImprove",
    question: "What pages should you focus on improving the search position?",
    lists: {
      searchPositionToImprove: {
        header: "Pages to Improve:",
        primaryDimension: "page",
        metrics: {
          "position": {},
        }
      },
    },
  },
  missingPages: {
    key: "missingPages",
    question: "What pages are getting 404 errors from internal links? What pages are getting 404 errors from external links?",
    lists: {
      brokenExternal: {
        header: "Broken External Links:",
        primaryDimension: "ga:pagePath",
        metrics: {
          "ga:pageTitle": {}, //not actually a metric, but whatever. Displaying as such
          "ga:sessions": {},
        }
      },
      brokenInternal: {
        header: "Bad Internal Links:",
        metrics: {
          "ga:pageTitle": {},
          "ga:sessions": {},
        }
      }
    },
  },
}
