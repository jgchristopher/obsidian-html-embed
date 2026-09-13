import { MarkdownPostProcessorContext, MarkdownRenderChild, Plugin } from "obsidian";
import { parseBlock } from "./parse";
import { buildSrcdoc, HEIGHT_MESSAGE_TYPE, Theme } from "./srcdoc";

const MIN_HEIGHT = 50;
const MAX_HEIGHT = 20000;
let embedSeq = 0;

export default class HtmlEmbedPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor("html-embed", (source, el, ctx) =>
      this.render(source, el, ctx),
    );
  }

  private async render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    const config = parseBlock(source);
    if ("error" in config) return showError(el, config.error);

    const file = this.app.metadataCache.getFirstLinkpathDest(config.file, ctx.sourcePath);
    if (!file) return showError(el, `html-embed: file not found: ${config.file}`);

    let html: string;
    try {
      html = await this.app.vault.read(file);
    } catch (err) {
      return showError(el, `html-embed: could not read ${config.file}: ${String(err)}`);
    }

    const theme: Theme = document.body.classList.contains("theme-dark") ? "dark" : "light";
    const embedId = `html-embed-${++embedSeq}`;

    const iframe = document.createElement("iframe");
    iframe.className = "html-embed-frame";
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.srcdoc = buildSrcdoc(html, { theme, embedId });

    const child = new MarkdownRenderChild(el);
    ctx.addChild(child);

    if (config.height !== undefined) {
      iframe.style.height = `${config.height}px`;
    } else {
      child.registerDomEvent(window, "message", (event: MessageEvent) => {
        if (event.source !== iframe.contentWindow) return;
        const data = event.data;
        if (!data || data.type !== HEIGHT_MESSAGE_TYPE || data.id !== embedId) return;
        if (typeof data.height !== "number") return;
        const height = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, data.height));
        iframe.style.height = `${height}px`;
      });
    }

    el.appendChild(iframe);
  }
}

function showError(el: HTMLElement, message: string): void {
  el.createDiv({ cls: "html-embed-error", text: message });
}
