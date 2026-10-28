// svgo config for the wordmark exports — see prep-logos.sh
export default {
  multipass: true,
  js2svg: { indent: 2, pretty: true },
  plugins: [
    "preset-default",
    "convertStyleToAttrs",
    "removeXlink",
    {
      name: "removeAttrs",
      params: {
        attrs: [
          "svg:xml:space",
          "font-family",
          "font-weight",
          "font-size",
          "-inkscape-font-specification",
          "stroke",
          "stroke-width",
          "stroke-linecap",
          "stroke-linejoin",
          "stroke-opacity",
          "stroke-dasharray",
          "baseline-shift",
          "vector-effect",
          "enable-background",
          "stop-color",
          "overflow",
          "display",
          "letter-spacing",
          "word-spacing",
          "line-height",
        ],
      },
    },
    {
      name: "addAttributesToSVGElement",
      params: { attributes: [{ role: "img" }, { "aria-label": "Lima" }] },
    },
  ],
};
