* The **JSDoc spec** doesn’t mention casting at all.
* The **TypeScript docs** cover JSDoc support here: [https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html).
* But they don’t go into parsing quirks or “why parentheses are needed.” That comes from looking at the TypeScript parser rules, historical issues, and practical experience (folks have filed GitHub issues on exactly this).

Some of this is “folk knowledge” from how the TS parser behaves, not formal docs.

---

## 🔹 Safe JSDoc casting idioms

To make casts explicit, unambiguous, and less error-prone in `.js` + JSDoc files:

---

### 1. `@type` with parentheses (what we already saw)

```js
const ctor = /** @type {typeof AbstractComponent} */ (this.constructor);
```

✅ Good for: one-off casts.
⚠️ Must parenthesize anything more complex than an identifier.

---

### 2. Casting `this` separately

Sometimes casting `this` is easier:

```js
const self = /** @type {AbstractComponent} */ (this);
const ctor = self.constructor;
```

✅ Useful when you need to cast `this` often in a method.
✅ Keeps later code clean (no inline casts).

---

### 3. Using `@ts-ignore` when TS is too strict

```js
// @ts-ignore
const ctor = this.constructor;
```

⚠️ This disables checking completely at that line.
✅ Use it sparingly, but sometimes necessary if TS’s inference is just wrong.

---

### 4. Using a helper function to encapsulate casts

```js
/**
 * @template T
 * @param {any} value
 * @returns {T}
 */
function cast(value) { return value; }

// Usage:
const ctor = cast(/** @type {typeof AbstractComponent} */ (this.constructor));
```

✅ Helps if you have recurring cast needs.
✅ Lets you annotate generically.
⚠️ Slightly verbose.

---

### 5. Annotating a local with `@type`

```js
/** @type {typeof AbstractComponent} */
let ctor = this.constructor;
```

✅ Works if the expression already matches or can be implicitly assigned.
⚠️ Won’t help if TS thinks the types are incompatible — in that case you need `@type (...)` cast instead.

---

### 6. Non-null assertions (for registry lookups)

When you *know* something exists but TS can’t prove it:

```js
const tpl = /** @type {ComponentTemplate} */ (registries.componentTemplate.get(this._templateUID));
```

Or shorter (works in `.js` with TS check enabled):

```js
const tpl = /** @type {ComponentTemplate} */ (registries.componentTemplate.get(this._templateUID)!);
```

✅ Communicates intent clearly.
⚠️ You’re taking responsibility for the invariant (like Rust’s `unsafe {}`).

---

### 7. Inline function returns with `@returns`

```js
/**
 * @returns {ComponentTemplate}
 */
function getTemplate(uid) {
  return registries.componentTemplate.get(uid);
}
```

Then just use `getTemplate()` everywhere.
✅ Encapsulates the cast in one safe place.
⚠️ Adds an indirection.

---

## 🔹 Summary cheat sheet

* **Complex expression?** → parenthesize:

  ```js
  /** @type {Type} */ (expr)
  ```
* **Casting `this`?** → store in a local:

  ```js
  const self = /** @type {Type} */ (this);
  ```
* **Lookups you know can’t fail?** → non-null assertion with `!`.
* **Recurring needs?** → helper `cast()` function or wrapper API.
* **Registry invariants?** → wrap them in typed helper functions so your main logic stays clean.

---


