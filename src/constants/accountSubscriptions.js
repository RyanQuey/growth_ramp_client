//keep this in sync with backend constants


module.exports = {
//TODO when change it here, must change it in backend!!
//currently, just allows them to continue use even when they have no plan. then when their time is over, when they login they'll be prompted to add data, and b/c backend knows it too, no more campaigns can get published
  ALLOWED_EMAILS: [
    "rlquey2@gmail.com",
    //"rlquey2+test2@gmail.com",
    "rlquey2+test3@gmail.com",
    "rlquey2+test4@gmail.com",
    "jdquey@gmail.com",
    "jasonquey2@gmail.com",
    "rlquey2+new-test@gmail.com",
    "hello@growthramp.io",
    "henry@ignitemycompany.com",
    "jason@cofounderswithclass.com",
    "rebekahjypark@gmail.com",

    "ajconnell1@googlemail.com",
    //"dave@ninjaoutreach.com", aris was added to replace him
    "aris@ninjaoutreach.com",
    "ed@midasmedia.co.uk",
    "hi@tomaslau.com", //this guy is only doing for 3 months so far
    "inbillsmind@gmail.com",
    "jmcmillen89@gmail.com",
    "content@mirasee.com",
    "nathan@trysourcify.com",
    "sp4387@gmail.com",
    "william@elumynt.com",
    "tylerbasu@gmail.com",
  ],

  PAYMENT_PLANS: {
    free: {
      name: "Prepaid",
      price: 0,
      frequency: "month",
    },
    prepaid: {
      name: "Prepaid",
      price: 0,
      frequency: "month",
    },
    // no longer using; soon transition out altogether
    "basic-monthly": {
      name: "Basic - Monthly",
      price: 49,
      frequency: "month",
    },
    "standard-monthly": {
      name: "Standard - Monthly",
      price: 49, // base price
      pricePerExtra: 29,
      frequency: "month",
    }
  },
}

