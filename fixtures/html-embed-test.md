# html-embed test

## 1. Auto-resize, tall page

Expect: heading shows the current theme, "isolated: SecurityError", four dashed boxes, no inner scrollbar.

```html-embed
file: _html-embed-test/tall.html
```

## 2. Fixed height

Expect: exactly 400px tall with an inner scrollbar.

```html-embed
file: _html-embed-test/tall.html
height: 400
```

## 3. Missing file

Expect: error box "html-embed: file not found: _html-embed-test/nope.html".

```html-embed
file: _html-embed-test/nope.html
```

## 4. Missing file key

Expect: error box "html-embed: missing required `file:` line".

```html-embed
height: 300
```

## 5. Bad height

Expect: error box "html-embed: height must be a positive integer, got "tall"".

```html-embed
file: _html-embed-test/tall.html
height: tall
```

## 6. Auto-resize, short page

Expect: about 50px tall, sized independently of section 1.

```html-embed
file: _html-embed-test/short.html
```
