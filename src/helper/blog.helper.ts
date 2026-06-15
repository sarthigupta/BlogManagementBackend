export function generateSlug(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

  return `${slug}-${Date.now()}`;
}

export function generateExcerpt(content: string){
    const excerpt = content
    .trim().substring(0,160);
    return content.length > 160 ? `${excerpt}...`: excerpt;
}

