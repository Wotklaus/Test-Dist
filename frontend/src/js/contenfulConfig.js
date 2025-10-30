const CONTENTFUL_SPACE_ID = 'v6xedn2etntd';
const CONTENTFUL_ACCESS_TOKEN = '4_5GCKbBbI-sTuWTQsYf1KYMAEvJhqxZpPaV1XY6gTk';

async function fetchArticlesWithAssets() {
  try {
    const res = await fetch(
      `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries?access_token=${CONTENTFUL_ACCESS_TOKEN}&content_type=articuloPokemon&include=2`
    );
    const data = await res.json();

    const assets = (data.includes && data.includes.Asset)
      ? Object.fromEntries(data.includes.Asset.map(a => [a.sys.id, a]))
      : {};

    const items = data.items || [];
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map(article => {
      let imageUrl = "";
      if (article.fields.imagenPrincipal && article.fields.imagenPrincipal.sys) {
        const asset = assets[article.fields.imagenPrincipal.sys.id];
        if (asset && asset.fields && asset.fields.file && asset.fields.file.url) {
          imageUrl = "https:" + asset.fields.file.url;
        }
      }
      // El contenido está en formato Rich Text, así que lo puedes extraer como string simple:
      let content = "";
      if (article.fields.contenido && article.fields.contenido.content) {
        content = article.fields.contenido.content.map(block =>
          block.content.map(textNode => textNode.value).join("\n")
        ).join("\n");
      }
      return {
        title: article.fields.title,
        author: article.fields.autor || "",
        date: article.fields.fechaPublicacion || "",
        content: content,
        slug: article.fields.slug || "",
        image: imageUrl,
        relatedPokemon: article.fields.pokemonRelacionado || ""
      };
    });
  } catch (err) {
    return [];
  }
}