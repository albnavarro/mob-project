# Store audit — bug e issue da verificare

Documento di lavoro: bug logici, problemi semantici e nice-to-have rilevati nel modulo `mob-core/store`. Ogni voce ha gravità, riferimento al file/righe e suggerimento di fix.

Legenda gravità:

- 🟠 media — bug latente, edge case o problema semantico
- 🟡 bassa — DX / leggibilità / refactor

---

## 🟠 Problemi semantici

---

### #7 — Dependency tracking statico (computed autodetect)

**File:** `store-set.js:842-848`

La dep-detection avviene una sola volta a definizione del computed eseguendo `callback({})`. Se la callback contiene rami (es. `if (proxi.flag) return proxi.a; else return proxi.b;`), `proxi.b` non viene tracciato finché `flag` è truthy → mutazioni di `b` non triggerano il computed.

**Effetto:** limitazione comune (Vue 2-style) ma non documentata. La readme suggerisce "automatic & complete tracking".

**Decisione richiesta:**

- (A) Documentare la limitazione in readme.
- (B) Re-tracciare le dipendenze a ogni esecuzione del computed (cambiamento più invasivo, allinea a Vue 3 / Solid).

---

### #8 — Frozen array/object durante dep-detect può lanciare

**File:** `store-proxi.js:137-145` + `store-set.js:842-848`

`shouldFreeze` ritorna `true` per Array/Object e il proxy GET wrappa in `Object.freeze([...value])`. Se la callback del computed fa mutazioni inline (`.push`, `[i] = …`) durante la dep-detection, throw in strict mode → registrazione del computed abortita senza messaggio chiaro.

**Effetto:** edge case, ma sconcertante per chi non sa che la callback viene eseguita una volta a vuoto.

**Fix:** in `storeComputedEntryPoint`, valutare un `try/catch` attorno a `callback({})` con warning specifico (in conflitto col design "no try/catch" — discutere).

---

## 🟡 Minori / DX

### #9 — `setObj`: `hasKeys` rifiuta tutto se anche una key è ignota

**File:** `store-set.js:229-235`

```js
const hasKeys = valKeys.every((item) => propKeys.includes(item));
if (!hasKeys) {
    storeSetObjKeysWarning(valKeys, prop, logStyle);
    return;
}
```

Rifiuta l'intero `set` se anche una sola key non esiste. Il warning logga `valKeys` ma non specifica quale fosse la key incriminata.

**Fix:** loggare solo le keys mancanti (`valKeys.filter(k => !propKeys.includes(k))`).

---

### #10 — `extractkeyFromProp` cattura solo la prima dep

**File:** `current-key.js:50-57`

```js
return getFirstCurrentDependencies();
```

Per selettori prop (`set/watch/emit`) funziona; ma se l'utente passa per errore `() => proxi.a + proxi.b` viene preso solo `'a'` senza warning.

**Fix:** in modalità prop-selector, se `current_computed_keys.length > 1` loggare un warning ("selector touched multiple props, using only the first").

---

### #11 — `callBackComputed` come `Set<{prop, keys, fn}>`

**File:** `inizialize-instance.js:23`, `store-set.js:747-751`

Set di oggetti → equality di reference, dedup affidata interamente a `checkIfPropIsComputed` upstream. Una `Map<prop, {keys, fn}>` sarebbe più espressiva, più veloce per lookup e renderebbe ridondante il check di duplicato.

**Fix:** refactor a `Map<string, ComputedEntry>` chiavata su `prop`.

---

### #12 — Refusi nei nomi pubblici/interni

Identificatori con typo: `Lsit`, `Queque`, `Warining`, `Compunted`, `Dependecies`, `Sallow`, `inizialize`, `addToComputedWaitLsit`, `runCallbackQueqe`, `storeComputedKeyUsedWarning` (oltre a usi interni). Rendono difficile il grep e la ricerca per nome.

**Fix:** rename pass — non urgente, ma bloccante per refactor futuri.

---

### #13 — `cloneValueOrGet`: ordering Object prima di Array

**File:** `store-utils.js:174-192`

```js
if (checkType(Object, value)) return { ...value };
if (checkType(Array, value)) return [...value];
```

Funziona perché `storeType.isObject` usa `[object Object]` (gli array non passano), ma è fragile a refactor di `isObject`. Spostare il check Array prima di Object aumenta robustezza.

---

### #14 — Asimmetria emit iniziale del computed

**File:** `index.js:212-214`

```js
useNextLoop(() => {
    storeEmitEntryPoint({ instanceId, prop: propParsed });
});
```

Dopo `myStore.computed(...)` fa un emit deferred. Se il watcher è installato **prima** di `computed`, riceve il valore iniziale; se installato **dopo**, no. Comportamento asimmetrico, va documentato.

---

### #15 — `destroy`: pattern di cleanup con state stantio

**File:** `destroy.js:13-53`

Dopo che gli unsubscribe wrapper invocano `updateMainMap` (sostituendo il wrapper nella mappa), il riferimento `state` locale è stantio. Il `state.unsubscribeBindInstance.length = 0` finale agisce su un array detached. Funzionalmente OK perché `removeStateFromMainMap` chiude tutto, ma il codice è fuorviante.

**Fix:** rileggere lo state corrente dopo il forEach, oppure rimuovere la riga `length = 0` (ridondante con la rimozione finale dalla mappa).

---

### #16 — `subscribeWatch` ricostruisce wrapper completo invece di patch

**File:** `store-watch.js:10-53`

Pattern `{...state, watcherByProp, watcherMetadata}` ricostruisce il wrapper. In single-thread JS è safe, ma rende fragile l'introduzione futura di codice asincrono. Considerare un helper `patchMainMap(instanceId, partial)` che fonde solo i campi modificati con il wrapper corrente.

---

## ✅ Falsi positivi rilevati nel primo passaggio

Annotati per memoria, **non sono bug**:

- **`oldValue` pinato al primo evento del tick** (`fire-queque.js:85`) — comportamento corretto: `oldValue` rappresenta lo stato "prima del batch corrente", non quello dell'ultima `set`. Verificato con sequenze `set` consecutive e `emit` + `set`.
- **`subscribeWatch` race condition** — JS single-threaded, no await tra get e update; non c'è race.
- **`validationStatusObject[prop]` undefined su prop semplici** — `inizializeAllProps` chiama `setProp` con `useStrict: false` e `initalizeStep: true`, quindi `validationStatusObject[prop] = isValidated` è sempre eseguito durante init.
- **`addToComputedWaitLsit` perde props se chiamato durante `fireComputed`** — il `Set` `computedPropsQueque` è condiviso tra wrapper (shallow copy), le `add` durante un tick si accumulano correttamente; `fireComputed` resetta il set DOPO aver letto `computedFiltered`.

---

## Priorità di intervento

| Ordine | Item                          | Severità | Effort               |
| ------ | ----------------------------- | -------- | -------------------- |
| 1      | #1 Circular check             | 🔴       | xs (1 riga)          |
| 2      | #2 Wait + null/undefined      | 🔴       | xs (rimuovere check) |
| 3      | #3 emitAsync double fire      | 🔴       | s                    |
| 4      | #5 Proxy set warning          | 🟠       | xs                   |
| 5      | #6 watchEntryPoint local prop | 🟠       | xs                   |
| 6      | #4 Bind override semantics    | 🟠       | discussione          |
| 7      | #7 Dep tracking static        | 🟠       | doc o refactor       |
| 8      | #9, #10 DX warnings           | 🟡       | xs                   |
| 9      | #11 callBackComputed → Map    | 🟡       | m                    |
| 10     | #12 Rename typos              | 🟡       | s (mass rename)      |
