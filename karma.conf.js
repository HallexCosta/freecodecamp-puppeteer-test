module.exports = function (config) {
  config.set({
    browsers: ["Chrome", "ChromeHeadless", "MyHeadlessChrome"],
    customLaunchers: {
      MyHeadlessChrome: {
        base: "ChromeHeadless",
        flags: [
          "--disable-translate",
          "--disable-extensions",
          "--remote-debugging-port=9223",
        ],
      },
    },
  });
};
