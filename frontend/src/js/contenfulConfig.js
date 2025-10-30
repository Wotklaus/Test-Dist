const CONTENTFUL_SPACE_ID = 'v6xedn2etntd';
const CONTENTFUL_ACCESS_TOKEN = '4_5GCKbBbI-sTuWTQsYf1KYMAEvJhqxZpPaV1Xy6gTk';

// Función global para obtener artículos + assets
async function fetchArticlesWithAssets() {
  try {
    const res = await fetch(
      `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/entries?access_token=${CONTENTFUL_ACCESS_TOKEN}&content_type=ArticuloPokemon&include=2`
    );
    const data = await res.json();
    console.log('Contentful response:', data);

    // Construye el diccionario de assets
    const assets = (data.includes && data.includes.Asset)
      ? Object.fromEntries(data.includes.Asset.map(a => [a.sys.id, a]))
      : {};

    const items = data.items || [];
    if (!Array.isArray(items)) {
      console.error("No items array returned from Contentful:", data);
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
      return {
        title: article.fields.title,
        author: article.fields.author || "",
        date: article.fields.fechaPublicacion || "",
        content: article.fields.content || "",
        slug: article.fields.slug || "",
        image: imageUrl
      };
    });
  } catch (err) {
    console.error("Fetch Contentful error:", err);
    return [];
  }
}