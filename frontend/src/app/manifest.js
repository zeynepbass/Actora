export default function manifest() {
  return {
    name: "Actora",
    short_name: "Actora",
    description: "Fitness topluluğu ve kilo hedefi takibi",
    lang: "tr",
    start_url: "/workouts",
    display: "standalone",
    background_color: "#f7f5f3",
    theme_color: "#8a1538",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
