module.exports = {
  locales: ["en", "de"],
  sourceLocale: "de",
  catalogs: [
    {
      path: "locales/{locale}/messages",
      include: ["app/[locale]/terms"]
    },
  ],
  format: "po",
};
