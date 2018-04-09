export const AUDIT_TESTS = {
  pageSpeed: {
    key: "pageSpeed",
    question: "Which of your pages are too slow?",
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
        header: "Headlines to improve",
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
        header: "Bad Bounce Rate",
        primaryDimension: "ga:browser",
        metrics: {
          "ga:users": {},
          "ga:bounceRate": {},
        }
      },
      badSessionDuration: {
        header: "Bad Average Session Duration",
        primaryDimension: "ga:browser",
        metrics: {
          "ga:users": {},
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
        header: "Bad Bounce Rate",
        primaryDimension: "ga:deviceCategory",
        metrics: {
          "ga:users": {},
          "ga:bounceRate": {},
        }
      },
      badSessionDuration: {
        header: "Bad Avg Session Duration",
        primaryDimension: "ga:deviceCategory",
        metrics: {
          "ga:users": {},
          "ga:avgSessionDuration": {},
        }
      }
    },
  },

  userInteraction: {
    key: "userInteraction",
    question: "What other pages may have issues that affect performance?",
    lists: {
      badBounceRate: {
        header: "Bad Bounce Rate",
        primaryDimension: "ga:landingPagePath",
        metrics: {
          "ga:users": {},
          "ga:bounceRate": {},
        }
      },
      badSessionDuration: {
        header: "Bad Avg Session Duration",
        primaryDimension: "ga:landingPagePath",
        metrics: {
          "ga:users": {},
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
    question: "What pages should you focus on for improving their search position?",
    lists: {
      searchPositionToImprove: {
        header: "Pages to Improve",
        primaryDimension: "page",
        metrics: {
          "position": {},
        }
      },
    },
  },
  missingPages: {
    key: "missingPages",
    question: "What pages are getting 404 errors from internal and external links?",
    lists: {
      brokenExternal: {
        header: "Broken External Links",
        primaryDimension: "ga:pagePath",
        metrics: {
          "ga:pageTitle": {}, //not actually a metric, but whatever. Displaying as such
          "ga:sessions": {},
        }
      },
      brokenInternal: {
        header: "Bad Internal Links",
        metrics: {
          "ga:pageTitle": {},
          "ga:sessions": {},
        }
      }
    },
  },
}

export const AUDIT_RESULTS_SECTIONS = {
  currentIssues: {
    title: "Current Issues",
  },
  // issues fixed from last time
  fixed: {
    title: "Fixed",

  },

  // issues that are marked as complete, but was completed too recently to tell whether actually fixed or not
  maybeFixed: {
    title: "Maybe Fixed",

  },
}

// labels to put on different tests
export const AUDIT_TEST_FLAGS = {
  pageSpeed: {
  },

  headlineStrength: {
    difficulty: "easy"
  },

  browserCompatibility: {
    difficulty: "hard"
  },

  deviceCompatibility: {
    difficulty: "hard"
  },

  userInteraction: {
  },
  searchPositionToImprove: {
  },
  missingPages: {
    difficulty: "easy"
  },

}
