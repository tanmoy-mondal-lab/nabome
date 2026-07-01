const BLOCKED_TAGS = new Set([
  "SCRIPT", "IFRAME", "OBJECT", "EMBED", "FORM", "INPUT", "TEXTAREA",
  "BUTTON", "LINK", "META", "BASE", "STYLE",
]);

const URL_ATTRIBUTES = new Set(["href", "src", "action", "formaction", "poster", "xlink:href"]);

function isSafeUrl(value: string): boolean {
  const normalized = value.trim().replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
  return !normalized.startsWith("javascript:")
    && !normalized.startsWith("vbscript:")
    && !normalized.startsWith("data:text/html");
}

export function sanitizeHTML(dirty: string): string {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return dirty.replace(/<script[\s\S]*?<\/script>/gi, "");
  }

  const document = new DOMParser().parseFromString(`<template>${dirty}</template>`, "text/html");
  const template = document.querySelector("template");
  if (!template) return "";

  for (const element of Array.from(template.content.querySelectorAll("*"))) {
    if (BLOCKED_TAGS.has(element.tagName)) {
      element.remove();
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || name === "srcdoc" || name === "style") {
        element.removeAttribute(attribute.name);
        continue;
      }
      if (URL_ATTRIBUTES.has(name) && !isSafeUrl(attribute.value)) {
        element.removeAttribute(attribute.name);
      }
    }
    if (element.tagName === "A" && element.getAttribute("target") === "_blank") {
      element.setAttribute("rel", "noopener noreferrer");
    }
  }

  return template.innerHTML;
}
