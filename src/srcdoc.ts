export type Theme = "light" | "dark";
export type SrcdocOptions = { theme: Theme; embedId: string };

export const HEIGHT_MESSAGE_TYPE = "html-embed:height";

// Runs inside the sandboxed iframe before the page's own content. Measures the
// <html> element's rendered box, not scrollHeight: scrollHeight never drops
// below the iframe's current height, so embeds could grow but never shrink.
export function bootScript(opts: SrcdocOptions): string {
  const config = JSON.stringify({
    theme: opts.theme,
    id: opts.embedId,
    type: HEIGHT_MESSAGE_TYPE,
  }).replace(/</g, "\\u003c");

  return `<script>(function(){
var c=${config},last=-1,root=document.documentElement;
root.dataset.theme=c.theme;
function post(){var h=Math.ceil(root.getBoundingClientRect().height);if(h===last)return;last=h;parent.postMessage({type:c.type,id:c.id,height:h},"*");}
document.addEventListener("DOMContentLoaded",function(){post();new ResizeObserver(post).observe(root);});
window.addEventListener("load",post);
})();</script>`;
}

export function buildSrcdoc(html: string, opts: SrcdocOptions): string {
  const script = bootScript(opts);

  const head = /<head(\s[^>]*)?>/i.exec(html);
  if (head) return insertAt(html, head.index + head[0].length, script);

  // Never before the doctype: that would drop the page into quirks mode.
  const doctype = /<!doctype[^>]*>/i.exec(html);
  if (doctype) return insertAt(html, doctype.index + doctype[0].length, script);

  return script + html;
}

function insertAt(s: string, index: number, insert: string): string {
  return s.slice(0, index) + insert + s.slice(index);
}
