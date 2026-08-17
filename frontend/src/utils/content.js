export function getPlainTextFromHtml(html = "") {
  if (!html) return ""

  const temp = document.createElement("div")
  temp.innerHTML = html

  return (temp.textContent || temp.innerText || "")
    .replace(/\s+/g, " ")
    .trim()
}

export function getTextPreview(html = "", maxLength = 150) {
  const plainText = getPlainTextFromHtml(html)

  if (!plainText) return ""

  if (plainText.length <= maxLength) {
    return plainText
  }

  return `${plainText.slice(0, maxLength).trimEnd()}...`
}
