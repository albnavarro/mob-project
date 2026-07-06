## TODO:

#### LastSpinY/X ( da testare )

- Aggiornare lastSpinY/X subito dopo il loro uso

```javascript
const spinValue = this.#useHorizontalScroll
    ? (() => {
          return spinXdiff > spinYdiff ? spinX : spinY;
      })()
    : spinY;

this.#lastSpinY = spinY;
this.#lastSpinX = spinX;
```

#### Inertial limit: ( da testare )

- All'interno di `onWheel`:
    - `checkSnapOpportunity` && `scheduleSnapTimeout`
    - Dovrebbero essere eseguite solo se `Math.abs(spinValue) > 1` `( 0.5 )` ?
- Questo permetterebbe di non `bloccare` un nuovo scroll quando l'intertia `hardware` e troppo bassa.
- Di fatto saltiamo il controllo degli `snap` su spin molto bassi, questo dovrebbe favorire la fase finale senza far scattare un nuovo `snap` in quanto l'inerzia é troppo bassa.

## Upgrade:

### Velocity;

- Calcolare la velocitá a prescindere dallo snap attivo e passarla nella callback.

### triggerScrollStart.

- `triggerScrollStart()` andrebbe chiamato una sola volta quando il movimento parte/riparte.
- Al momento non abbiamo un evento dedicato per il primo movimento.
- Di conseguenza chiamiamo la funzione ad ogni movimento
- `triggerScrollStart` non fá altro che settare `this.#force3D = true` all' interno dei `children`.

```js
#isMoving = false;

// dentro subscribe:
if (!this.#isMoving) {
    this.#isMoving = true;
    this.#children.forEach((element) => element.triggerScrollStart());
}

// dentro onComplete:
this.#isMoving = false;
this.#children.forEach((element) => element.triggerScrollEnd());
```
