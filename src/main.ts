import { MarkdownPostProcessorContext, MarkdownRenderChild, Plugin } from "obsidian";
import { heightFromMessage } from "./height";
import { parseBlock } from "./parse";
import { buildSrcdoc, Theme } from "./srcdoc";

let embedSeq = 0;

export default class HtmlEmbedPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor("html-embed", (source, el, ctx) =>
      this.render(source, el, ctx),
    );
  }

  private async render(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    // Create and attach the child before any parsing or awaiting: if the note
    // unloads or re-renders mid-read, ctx.addChild ensures the child is torn
    // down with it, and `unloaded` lets us bail out after the await instead
    // of appending a detached iframe with a leaked window listener.
    const child = new MarkdownRenderChild(el);
    ctx.addChild(child);
    let unloaded = false;
    child.register(() => {
      unloaded = true;
    });

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
    if (unloaded) return;

    const theme: Theme = document.body.classList.contains("theme-dark") ? "dark" : "light";
    const embedId = `html-embed-${++embedSeq}`;

    const iframe = document.createElement("iframe");
    iframe.className = "html-embed-frame";
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.srcdoc = buildSrcdoc(html, { theme, embedId });

    if (config.height !== undefined) {
      iframe.style.height = `${config.height}px`;
    } else {
      // Register on el.win, not the global `window`: an embed rendered in a
      // popout window receives its postMessage on that window, not the main
      // one.
      child.registerDomEvent(el.win, "message", (event: MessageEvent) => {
        if (event.source !== iframe.contentWindow) return;
        const height = heightFromMessage(event.data, embedId);
        if (height !== null) iframe.style.height = `${height}px`;
      });
    }

    el.appendChild(iframe);
  }
}

function showError(el: HTMLElement, message: string): void {
  el.createDiv({ cls: "html-embed-error", text: message });
}
